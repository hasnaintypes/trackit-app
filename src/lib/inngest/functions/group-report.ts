import { inngest } from "@/lib/inngest/client";
import { createLogger } from "@/lib/logging";
import { db } from "@/server/db";
import { toNum } from "@shared/decimal";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { sendEmail, compileTemplate } from "@/lib/email";
import { env } from "@/env";

const logger = createLogger("inngest-group-report");

/**
 * Monthly group spending report.
 * Runs on the 1st of each month at 8 AM.
 */
export const generateGroupReport = inngest.createFunction(
  {
    id: "generate-group-report",
    name: "Generate Group Report",
  },
  { cron: "0 8 1 * *" },
  async ({ step }) => {
    const lastMonth = subMonths(new Date(), 1);
    const monthStart = startOfMonth(lastMonth);
    const monthEnd = endOfMonth(lastMonth);
    const period = format(lastMonth, "yyyy-MM");
    const periodLabel = format(lastMonth, "MMMM yyyy");

    const users = await step.run("fetch-users", async () => {
      return db.user.findMany({
        where: {
          emailVerified: true,
          groups: { some: { isArchived: false } },
        },
        select: {
          id: true,
          email: true,
          name: true,
          groups: {
            where: { isArchived: false },
            select: { id: true, name: true },
          },
        },
      });
    });

    let generated = 0;

    await step.run("generate-reports", async () => {
      for (const user of users) {
        try {
          const groupSummaries = [];

          for (const group of user.groups) {
            const expenses = await db.expense.findMany({
              where: {
                groupId: group.id,
                date: { gte: monthStart, lte: monthEnd },
              },
              select: { amount: true },
            });

            const totalSpent = expenses.reduce(
              (sum, e) => sum + toNum(e.amount),
              0,
            );

            if (totalSpent > 0) {
              groupSummaries.push({
                name: group.name,
                totalSpent: totalSpent.toFixed(2),
                expenseCount: expenses.length,
              });
            }
          }

          if (groupSummaries.length === 0) continue;

          // Store report
          await db.report.create({
            data: {
              userId: user.id,
              type: "MONTHLY_SUMMARY",
              period,
              status: "PENDING",
              data: { periodLabel, groups: groupSummaries },
            },
          });

          // Send email
          try {
            const emailHtml = await compileTemplate("group-summary.html", {
              userName: user.name,
              period: periodLabel,
              groups: groupSummaries,
              appUrl: env.NEXT_PUBLIC_APP_URL ?? "",
            });

            await sendEmail({
              to: user.email,
              subject: `Group Spending Summary - ${periodLabel}`,
              html: emailHtml,
            });
            generated++;
          } catch (emailError) {
            logger.error(`Failed to send group report email to ${user.id}`, {
              error:
                emailError instanceof Error
                  ? emailError.message
                  : String(emailError),
            });
          }
        } catch (error) {
          logger.error(`Failed to generate group report for ${user.id}`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    });

    return { processed: users.length, generated };
  },
);
