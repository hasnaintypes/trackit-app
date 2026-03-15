import { inngest } from "../client";
import { createLogger } from "@/lib/logging";
import { db } from "@/server/db";

const logger = createLogger("inngest-ai-insights");
import { sendEmail } from "@/lib/email";
import { getTemplate } from "@/lib/email/template-cache";
import { env } from "@/env";
import { format, subDays } from "date-fns";

/**
 * Send Dedicated AI Insights
 * Scheduled to run every 3 days at 10 AM
 */
export const sendAiInsights = inngest.createFunction(
  {
    id: "send-ai-insights",
    name: "Send AI Spending Insights",
  },
  { cron: "0 10 */3 * *" }, // Every 3 days at 10:00 AM
  async ({ step }) => {
    const users = await step.run("fetch-active-users", async () => {
      return db.user.findMany({
        where: {
          emailVerified: true,
          notificationPrefs: {
            emailAiInsights: true,
          },
          // Only users with at least some transactions in the last month
          transactions: {
            some: {
              date: { gte: subDays(new Date(), 30) },
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    });

    const results = [];
    for (const user of users) {
      try {
        const insights = await step.run(`get-insights-${user.id}`, async () => {
          const { AIService } = await import("@/server/services/aiService");
          const period = format(new Date(), "yyyy-MM");
          const data = await AIService.generateSpendingInsights(
            user.id,
            period,
          );

          return typeof data === "object" && data !== null && "summary" in data
            ? (data as { summary: string }).summary
            : null;
        });

        if (insights) {
          await step.run(`send-email-${user.id}`, async () => {
            // Read template from cache
            let template = await getTemplate("ai-insight.html");

            template = template
              .replace(/{{userName}}/g, user.name ?? "there")
              .replace(/{{aiContent}}/g, insights)
              .replace(/{{appUrl}}/g, env.NEXT_PUBLIC_APP_URL ?? "")
              .replace(/{{#if hasAnomalies}}[\s\S]*?{{\/if}}/, ""); // Cleanup if tag not used

            await sendEmail({
              to: user.email,
              subject: "Your AI Spending Analysis",
              html: template,
            });
          });
          results.push({ userId: user.id, success: true });
        }
      } catch (error) {
        logger.error(`Failed AI insight for user ${user.id}`, {
          error: error instanceof Error ? error.message : String(error),
        });
        results.push({ userId: user.id, success: false, error: String(error) });
      }
    }

    return {
      processed: users.length,
      successful: results.filter((r) => r.success).length,
    };
  },
);
