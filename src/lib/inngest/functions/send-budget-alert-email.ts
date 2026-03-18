import { inngest } from "@/lib/inngest/client";
import { NonRetriableError } from "inngest";
import { createLogger } from "@/lib/logging";
import { db } from "@/server/db";
import { toNum } from "@shared/decimal";

const logger = createLogger("inngest-budget-alert");
import { sendEmail, compileTemplate } from "@/lib/email";
import { env } from "@/env";
import { BUDGET_THRESHOLD_REACHED_EVENT } from "@/constants/events";
import { BudgetThresholdSchema } from "@/constants/event-schemas";

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
    const { budgetId, userId, threshold } = BudgetThresholdSchema.parse(
      event.data,
    );

    const budget = await step.run("fetch-budget", async () => {
      return db.budget.findUnique({
        where: { id: budgetId },
        select: {
          id: true,
          userId: true,
          spentAmount: true,
          amount: true,
          category: { select: { name: true } },
          user: {
            select: {
              name: true,
              email: true,
              notificationPrefs: {
                select: { emailBalanceAlerts: true },
              },
            },
          },
        },
      });
    });

    if (!budget) {
      throw new NonRetriableError(`Budget ${budgetId} not found`);
    }

    if (budget.userId !== userId) {
      throw new NonRetriableError(`Budget does not belong to user ${userId}`);
    }

    await step.run("send-email", async () => {
      const spent = toNum(budget.spentAmount);
      const limit = toNum(budget.amount);

      const percentage = (spent / limit) * 100;
      const remaining = Math.max(0, limit - spent);

      // Fetch AI recommendations if threshold is high
      let aiRecommendations =
        "Stay mindful of your spending to keep within your budget targets.";
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
            aiRecommendations = Array.isArray(aiResult.recommendations)
              ? aiResult.recommendations.join("\n")
              : String(aiResult.recommendations);
          }
        } catch (e) {
          logger.error("Failed to fetch AI recommendations", {
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }

      const template = await compileTemplate("budget-alert.html", {
        userName: budget.user.name,
        categoryName: budget.category.name,
        percentage: percentage.toFixed(0),
        spent: spent.toFixed(2),
        limit: limit.toFixed(2),
        remaining: remaining.toFixed(2),
        appUrl: env.NEXT_PUBLIC_APP_URL ?? "",
        aiRecommendations,
      });

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
