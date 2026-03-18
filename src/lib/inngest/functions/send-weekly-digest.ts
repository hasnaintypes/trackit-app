import { inngest } from "@/lib/inngest/client";
import { createLogger } from "@/lib/logging";
import { db } from "@/server/db";
import { toNum } from "@shared/decimal";

const logger = createLogger("inngest-weekly-digest");
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns";
import { sendEmail, compileTemplate } from "@/lib/email";
import { env } from "@/env";

interface DigestResult {
  userId: string;
  success: boolean;
  totalIncome?: number;
  totalExpenses?: number;
  topCategories?: Array<{ name: string; amount: number }>;
  anomalies?: string | null;
  error?: string;
}

/**
 * Send Weekly Digest
 * Scheduled to run every Monday at 9 AM
 */
export const sendWeeklyDigest = inngest.createFunction(
  {
    id: "send-weekly-digest",
    name: "Send Weekly Digest",
  },
  { cron: "0 9 * * 1" }, // At 9:00 AM every Monday
  async ({ step }) => {
    // Get last week's range
    const lastWeek = subWeeks(new Date(), 1);
    const weekStart = startOfWeek(lastWeek, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(lastWeek, { weekStartsOn: 1 });
    const period = `Week of ${format(weekStart, "MMM d, yyyy")}`;

    const users = await step.run("fetch-users", async () => {
      return db.user.findMany({
        where: {
          emailVerified: true,
          notificationPrefs: {
            emailWeeklyDigest: true, // Specific flag for digests
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    });

    const results = await step.run("generate-digests", async () => {
      const digestResults: DigestResult[] = [];

      for (const user of users) {
        try {
          const dateFilter = {
            userId: user.id,
            date: { gte: weekStart, lte: weekEnd },
          };

          const [
            incomeResult,
            expenseResult,
            spendingByCategory,
            transactionCount,
          ] = await Promise.all([
            db.transaction.aggregate({
              where: { ...dateFilter, type: "CREDIT" },
              _sum: { amount: true },
            }),
            db.transaction.aggregate({
              where: { ...dateFilter, type: "DEBIT" },
              _sum: { amount: true },
            }),
            db.transaction.groupBy({
              by: ["categoryId"],
              where: { ...dateFilter, type: "DEBIT" },
              _sum: { amount: true },
            }),
            db.transaction.count({ where: dateFilter }),
          ]);

          const totalIncome = incomeResult._sum.amount
            ? toNum(incomeResult._sum.amount)
            : 0;
          const totalExpenses = expenseResult._sum.amount
            ? toNum(expenseResult._sum.amount)
            : 0;

          const catIds = spendingByCategory
            .map((g) => g.categoryId)
            .filter((id): id is string => id !== null);
          const cats =
            catIds.length > 0
              ? await db.category.findMany({
                  where: { id: { in: catIds } },
                  select: { id: true, name: true },
                })
              : [];
          const catNameMap = new Map(cats.map((c) => [c.id, c.name]));

          const topCategories = spendingByCategory
            .map((g) => ({
              name: g.categoryId
                ? (catNameMap.get(g.categoryId) ?? "Uncategorized")
                : "Uncategorized",
              amount: g._sum.amount ? toNum(g._sum.amount) : 0,
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

          // Create report record
          await db.report.create({
            data: {
              userId: user.id,
              type: "WEEKLY_DIGEST",
              period: format(weekStart, "yyyy-'W'ww"),
              status: "PENDING",
              data: {
                period,
                weekStart: weekStart.toISOString(),
                weekEnd: weekEnd.toISOString(),
                totalIncome,
                totalExpenses,
                netSavings: totalIncome - totalExpenses,
                transactionCount,
                topCategories,
              },
            },
          });

          // Detect AI Anomalies
          const { AIService } = await import("@/server/services/aiService");
          const anomalyResult = await AIService.detectAnomalies(user.id);

          digestResults.push({
            userId: user.id,
            success: true,
            totalIncome,
            totalExpenses,
            topCategories,
            anomalies: anomalyResult.summary,
          });
        } catch (error) {
          logger.error(`Failed to generate digest for user ${user.id}`, {
            error: error instanceof Error ? error.message : String(error),
          });
          digestResults.push({
            userId: user.id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            anomalies: null,
          });
        }
      }

      return digestResults;
    });

    await step.run("send-emails", async () => {
      for (const result of results) {
        if (!result.success) continue;

        const user = users.find((u) => u.id === result.userId);
        if (!user) continue;

        try {
          const netSavings =
            (result.totalIncome ?? 0) - (result.totalExpenses ?? 0);

          const emailHtml = await compileTemplate("weekly-digest.html", {
            userName: user.name,
            period,
            totalIncome: (result.totalIncome ?? 0).toFixed(2),
            totalExpenses: (result.totalExpenses ?? 0).toFixed(2),
            netSavings: netSavings.toFixed(2),
            netSavingsColor: netSavings >= 0 ? "#10b981" : "#ef4444",
            appUrl: env.NEXT_PUBLIC_APP_URL ?? "",
            aiAnomalies:
              result.anomalies ?? "No unusual activity detected this week.",
            topCategories: (result.topCategories ?? []).map((cat) => ({
              name: cat.name,
              amount: cat.amount.toFixed(2),
            })),
          });

          await sendEmail({
            to: user.email,
            subject: `Weekly Financial Digest - ${period}`,
            html: emailHtml,
          });
        } catch (error) {
          logger.error(`Failed to send digest email to ${user.id}`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    });

    return {
      processed: users.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    };
  },
);
