import { inngest } from "../client";
import { RECURRING_EVENT, enqueueRecurringRun } from "@/constants/events";
import { RecurringSchema } from "@/constants/event-schemas";
import { createLogger } from "@/lib/logging";
import { db } from "@/server/db";

const logger = createLogger("inngest-recurring");
import { calculateNextRunAt } from "@/lib/recurrence";
import { sendEmail } from "@/lib/email";
import { toNum } from "@shared/decimal";
import { RecurringStatus } from "@prisma/client";
import type { RecurrenceConfig, RecurringOverrides } from "@/types/recurrence";

export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
  },
  { event: RECURRING_EVENT },
  async ({ event }) => {
    const { ruleId } = RecurringSchema.parse(event.data);

    const rule = await db.recurringRule.findUnique({
      where: { id: ruleId },
      select: {
        id: true,
        userId: true,
        accountId: true,
        categoryId: true,
        amount: true,
        type: true,
        description: true,
        notes: true,
        frequency: true,
        interval: true,
        dayOfMonth: true,
        semiMonthlyDay: true,
        dayOfWeek: true,
        weekOfMonth: true,
        lastDayOfMonth: true,
        overrides: true,
        startDate: true,
        endDate: true,
        nextRunAt: true,
        status: true,
        user: { select: { email: true } },
      },
    });
    if (!rule) return;
    if (rule.status !== RecurringStatus.ACTIVE) return;

    if (rule.nextRunAt > new Date()) {
      return;
    }

    // Use the scheduled date (rule.nextRunAt) as the transaction date, not "now"
    const scheduledDate = rule.nextRunAt;

    const cfg: RecurrenceConfig = {
      frequency: rule.frequency as RecurrenceConfig["frequency"],
      interval: rule.interval ?? 1,
      dayOfMonth: rule.dayOfMonth ?? undefined,
      semiMonthlyDay: rule.semiMonthlyDay ?? undefined,
      dayOfWeek: rule.dayOfWeek ?? undefined,
      weekOfMonth: rule.weekOfMonth ?? undefined,
      lastDayOfMonth: rule.lastDayOfMonth ?? undefined,
      overrides: (rule.overrides as RecurringOverrides) ?? undefined,
      startDate:
        rule.startDate instanceof Date
          ? rule.startDate
          : new Date(rule.startDate),
      endDate: rule.endDate
        ? rule.endDate instanceof Date
          ? rule.endDate
          : new Date(rule.endDate)
        : undefined,
      nextRunAt: rule.nextRunAt
        ? rule.nextRunAt instanceof Date
          ? rule.nextRunAt
          : new Date(rule.nextRunAt)
        : undefined,
    };

    // Compute next from the scheduled date (not "now") to keep the cadence anchored
    const nextRunAt = calculateNextRunAt(cfg, scheduledDate);

    // Atomically create transaction and update rule to prevent duplicates on crash
    try {
      await db.$transaction(async (tx) => {
        await tx.transaction.create({
          data: {
            userId: rule.userId,
            accountId: rule.accountId,
            categoryId: rule.categoryId ?? null,
            amount: rule.amount,
            type: rule.type,
            description: rule.description ?? null,
            notes: rule.notes ?? null,
            date: scheduledDate,
            scheduledDate,
            isRecurring: true,
            recurringRuleId: rule.id,
          },
        });

        await tx.recurringRule.update({
          where: { id: rule.id },
          data: {
            lastRunAt: new Date(),
            status: nextRunAt ? RecurringStatus.ACTIVE : RecurringStatus.ENDED,
            ...(nextRunAt && { nextRunAt }),
          },
        });
      });
    } catch (error: unknown) {
      // P2002 = unique constraint violation → duplicate transaction for this scheduledDate
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "P2002"
      ) {
        logger.warn(
          `Duplicate recurring transaction detected for rule ${rule.id}, advancing nextRunAt`,
        );
        // Advance the rule so it doesn't get stuck
        if (nextRunAt) {
          await db.recurringRule.update({
            where: { id: rule.id },
            data: { nextRunAt },
          });
          await enqueueRecurringRun(rule.id, nextRunAt);
        }
        return;
      }
      throw error;
    }

    // Schedule the next occurrence, if any
    if (nextRunAt) {
      await enqueueRecurringRun(rule.id, nextRunAt);
    }

    // Notify the user via email
    const userEmail = rule.user?.email ?? undefined;
    if (userEmail) {
      await sendEmail({
        to: userEmail,
        subject: "Recurring transaction processed",
        html: `A recurring transaction for <strong>${rule.description ?? "Transaction"}</strong> was processed for ${toNum(rule.amount).toFixed(2)} on ${scheduledDate.toDateString()}.`,
      });
    }
  },
);

/**
 * Notify users about upcoming recurring transactions (1 day before)
 * Runs daily at 8 AM
 */
export const notifyUpcomingRecurring = inngest.createFunction(
  {
    id: "notify-upcoming-recurring",
    name: "Notify Upcoming Recurring",
  },
  { cron: "0 8 * * *" }, // At 8:00 AM every day
  async ({ step }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const rules = await step.run("fetch-upcoming-rules", async () => {
      return db.recurringRule.findMany({
        where: {
          status: RecurringStatus.ACTIVE,
          nextRunAt: {
            gt: new Date(),
            lte: tomorrow,
          },
        },
        select: {
          id: true,
          userId: true,
          description: true,
          amount: true,
          nextRunAt: true,
          user: { select: { email: true } },
        },
      });
    });

    const results = [];
    for (const rule of rules) {
      try {
        if (rule.user?.email) {
          await step.run(`send-upcoming-email-${rule.id}`, async () => {
            const { NotificationService } = await import(
              "@/server/services/notificationService"
            );
            const { NotificationType } = await import("@prisma/client");

            // 1. Send Email
            await sendEmail({
              to: rule.user.email,
              subject: `Upcoming Bill Reminder: ${rule.description}`,
              html: `
                <div style="font-family: sans-serif; padding: 20px;">
                  <h2>Upcoming Payment Reminder</h2>
                  <p>This is a reminder that a recurring payment for <strong>${rule.description}</strong> of <strong>$${toNum(rule.amount).toFixed(2)}</strong> is scheduled for tomorrow, ${new Date(rule.nextRunAt).toDateString()}.</p>
                  <p>Please ensure you have sufficient funds in your account.</p>
                </div>
              `,
            });

            // 2. Create In-App Notification
            await NotificationService.createNotification({
              userId: rule.userId,
              type: NotificationType.TRANSACTION_RECURRING,
              title: "Upcoming Recurring Payment",
              message: `Reminder: Your recurring payment for ${rule.description} ($${toNum(rule.amount).toFixed(2)}) is scheduled for tomorrow.`,
              metadata: { ruleId: rule.id },
            });
          });
          results.push({ ruleId: rule.id, success: true });
        }
      } catch (error) {
        logger.error(`Failed to notify for rule ${rule.id}`, {
          error: error instanceof Error ? error.message : String(error),
        });
        results.push({ ruleId: rule.id, success: false, error: String(error) });
      }
    }

    return { processed: rules.length, results };
  },
);
