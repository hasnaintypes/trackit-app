import { inngest } from "@/lib/inngest/client";
import { db } from "@/server/db";
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns";
import { sendEmail } from "@/lib/email";
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
          // Get week's transactions
          const transactions = await db.transaction.findMany({
            where: {
              userId: user.id,
              date: {
                gte: weekStart,
                lte: weekEnd,
              },
            },
            include: {
              category: true,
            },
          });

          const totalIncome = transactions
            .filter((t) => t.type === "CREDIT")
            .reduce(
              (sum, t) =>
                sum +
                (typeof t.amount === "object" && "toNumber" in t.amount
                  ? t.amount.toNumber()
                  : Number(t.amount)),
              0,
            );

          const totalExpenses = transactions
            .filter((t) => t.type === "DEBIT")
            .reduce(
              (sum, t) =>
                sum +
                (typeof t.amount === "object" && "toNumber" in t.amount
                  ? t.amount.toNumber()
                  : Number(t.amount)),
              0,
            );

          const categorySpending = transactions
            .filter((t) => t.type === "DEBIT")
            .reduce(
              (acc, t) => {
                const category = t.category?.name ?? "Uncategorized";
                const amount =
                  typeof t.amount === "object" &&
                  t.amount !== null &&
                  "toNumber" in t.amount
                    ? t.amount.toNumber()
                    : Number(t.amount ?? 0);
                acc[category] = (acc[category] ?? 0) + amount;
                return acc;
              },
              {} as Record<string, number>,
            );

          const topCategories = Object.entries(categorySpending)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, amount]) => ({ name, amount }));

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
                transactionCount: transactions.length,
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
          console.error(
            `Failed to generate digest for user ${user.id}:`,
            error,
          );
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
      const fs = await import("fs/promises");
      const path = await import("path");
      const templatePath = path.join(
        process.cwd(),
        "src/lib/email/templates/weekly-digest.html",
      );
      const template = await fs.readFile(templatePath, "utf-8");

      for (const result of results) {
        if (!result.success) continue;

        const user = users.find((u) => u.id === result.userId);
        if (!user) continue;

        try {
          const res = result;
          let emailHtml = template
            .replace(/{{userName}}/g, user.name)
            .replace(/{{period}}/g, period)
            .replace(/{{totalIncome}}/g, (res.totalIncome ?? 0).toFixed(2))
            .replace(/{{totalExpenses}}/g, (res.totalExpenses ?? 0).toFixed(2))
            .replace(
              /{{netSavings}}/g,
              ((res.totalIncome ?? 0) - (res.totalExpenses ?? 0)).toFixed(2),
            )
            .replace(
              /{{netSavingsColor}}/g,
              (res.totalIncome ?? 0) - (res.totalExpenses ?? 0) >= 0
                ? "#10b981"
                : "#ef4444",
            )
            .replace(/{{appUrl}}/g, env.NEXT_PUBLIC_APP_URL ?? "")
            .replace(
              /{{aiAnomalies}}/g,
              (res as { anomalies?: string | null }).anomalies ??
                "No unusual activity detected this week.",
            );

          const topCategoriesHtml = (res.topCategories ?? [])
            .map(
              (cat: { name: string; amount: number }) => `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7;">
                  <span style="font-size: 14px; color: #18181b;">${cat.name}</span>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e4e4e7; text-align: right;">
                  <span style="font-size: 14px; font-weight: 500; color: #18181b;">$${cat.amount.toFixed(2)}</span>
                </td>
              </tr>
            `,
            )
            .join("");

          emailHtml = emailHtml.replace(
            /{{#each topCategories}}[\s\S]*?{{\/each}}/,
            topCategoriesHtml,
          );

          await sendEmail({
            to: user.email,
            subject: `Weekly Financial Digest - ${period}`,
            html: emailHtml,
          });
        } catch (error) {
          console.error(`Failed to send digest email to ${user.id}:`, error);
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
