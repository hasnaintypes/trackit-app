import { inngest } from "@/lib/inngest/client";
import { createLogger } from "@/lib/logging";
import { db } from "@/server/db";
import { toNum } from "@/lib/shared/decimal";

const logger = createLogger("inngest-budget-alert");
import { sendEmail } from "@/lib/email";
import { getTemplate } from "@/lib/email/template-cache";
import { env } from "@/env";
import { BUDGET_THRESHOLD_REACHED_EVENT } from "@/lib/inngest/events";

/**
 * Send Budget Alert Email
 * Triggered by budget/threshold.reached event
 */
export const sendBudgetAlertEmail = inngest.createFunction(
  {
    id: "send-budget-alert-email",
    name: "Send Budget Alert Email",
  },
  { event: BUDGET_THRESHOLD_REACHED_EVENT },

  async ({ event, step }) => {
    const { budgetId, userId, threshold } = event.data as {
      budgetId: string;
      userId: string;
      threshold: number;
    };

    const budget = await step.run("fetch-budget", async () => {
      return db.budget.findUnique({
        where: { id: budgetId },
        include: {
          category: true,
          user: {
            include: {
              notificationPrefs: true,
            },
          },
        },
      });
    });

    if (!budget) {
      throw new Error(`Budget ${budgetId} not found`);
    }

    if (budget.userId !== userId) {
      throw new Error(`Budget does not belong to user ${userId}`);
    }

    await step.run("send-email", async () => {
      const spent = toNum(budget.spentAmount);
      const limit = toNum(budget.amount);

      const percentage = (spent / limit) * 100;
      const remaining = Math.max(0, limit - spent);

      // Read budget alert template from cache
      let template = await getTemplate("budget-alert.html");

      // Fetch AI recommendations if threshold is high
      let recommendations = "";
      if (threshold >= 90) {
        try {
          const { AIService } = await import("@/server/services/aiService");
          const aiResult =
            await AIService.generateBudgetRecommendations(userId);
          if (
            aiResult &&
            typeof aiResult === "object" &&
            "recommendations" in aiResult
          ) {
            recommendations = Array.isArray(aiResult.recommendations)
              ? aiResult.recommendations.join("\n")
              : String(aiResult.recommendations);
          }
        } catch (e) {
          logger.error("Failed to fetch AI recommendations", {
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }

      template = template
        .replace(/{{userName}}/g, budget.user.name)
        .replace(/{{categoryName}}/g, budget.category.name)
        .replace(/{{percentage}}/g, percentage.toFixed(0))
        .replace(/{{spent}}/g, spent.toFixed(2))
        .replace(/{{limit}}/g, limit.toFixed(2))
        .replace(/{{remaining}}/g, remaining.toFixed(2))
        .replace(/{{appUrl}}/g, env.NEXT_PUBLIC_APP_URL ?? "")
        .replace(
          /{{aiRecommendations}}/g,
          recommendations ||
            "Stay mindful of your spending to keep within your budget targets.",
        );

      try {
        if (budget.user.notificationPrefs?.emailBalanceAlerts) {
          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert: ${budget.category.name} - ${percentage.toFixed(0)}% Used`,
            html: template,
          });
        }

        // Create notification in database
        await db.notification.create({
          data: {
            userId: budget.userId,
            type: "BUDGET_ALERT",
            title: `Budget Alert: ${budget.category.name}`,
            message: `You've reached ${percentage.toFixed(0)}% of your budget limit for ${budget.category.name}.`,
            metadata: {
              budgetId: budget.id,
              threshold,
              spent,
              limit,
              percentage,
            },
          },
        });

        // Create budget exceeded report if at 100%
        if (threshold >= 100) {
          const { ReportService } = await import(
            "@/server/services/reportService"
          );
          await ReportService.generateBudgetExceededReport(userId, budgetId);
        }

        return {
          success: true,
          budgetId,
          userId,
          threshold,
          emailSent: true,
        };
      } catch (error) {
        logger.error("Failed to send budget alert email", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    });
  },
);
