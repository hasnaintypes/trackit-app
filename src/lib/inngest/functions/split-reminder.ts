import { inngest } from "@/lib/inngest/client";
import { createLogger } from "@/lib/logging";
import { db } from "@/server/db";
import { SplitService } from "@/server/services/splitService";
import { sendEmail, compileTemplate } from "@/lib/email";
import { env } from "@/env";

const logger = createLogger("inngest-split-reminder");

/**
 * Weekly split reminder: check all groups for unsettled debts.
 * Runs every Sunday at 10 AM.
 */
export const sendSplitReminder = inngest.createFunction(
  {
    id: "send-split-reminder",
    name: "Send Split Reminder",
  },
  { cron: "0 10 * * 0" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return db.user.findMany({
        where: {
          emailVerified: true,
          groups: { some: { isArchived: false } },
        },
        select: { id: true, email: true, name: true },
      });
    });

    let sent = 0;

    await step.run("process-reminders", async () => {
      for (const user of users) {
        try {
          const { youOwe, youAreOwed } =
            await SplitService.calculateTotalBalance(user.id);

          if (youOwe <= 0 && youAreOwed <= 0) continue;

          // Create in-app notification
          await db.notification.create({
            data: {
              userId: user.id,
              type: "SPLIT_REMINDER",
              title: "Unsettled Split Balances",
              message:
                youOwe > 0
                  ? `You owe $${youOwe.toFixed(2)} across your groups.`
                  : `You are owed $${youAreOwed.toFixed(2)} across your groups.`,
              metadata: { youOwe, youAreOwed },
            },
          });

          // Send email
          try {
            const emailHtml = await compileTemplate("split-reminder.html", {
              userName: user.name,
              youOwe: youOwe.toFixed(2),
              youAreOwed: youAreOwed.toFixed(2),
              hasDebt: youOwe > 0,
              hasCredit: youAreOwed > 0,
              appUrl: env.NEXT_PUBLIC_APP_URL ?? "",
            });

            await sendEmail({
              to: user.email,
              subject: "Reminder: Unsettled Split Balances",
              html: emailHtml,
            });
            sent++;
          } catch (emailError) {
            logger.error(`Failed to send split reminder email to ${user.id}`, {
              error:
                emailError instanceof Error
                  ? emailError.message
                  : String(emailError),
            });
          }
        } catch (error) {
          logger.error(`Failed to process split reminder for ${user.id}`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    });

    return { processed: users.length, emailsSent: sent };
  },
);
