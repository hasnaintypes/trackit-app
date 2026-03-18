import { db } from "@/server/db";
import { subMonths, format } from "date-fns";
import { sendEmail, compileTemplate } from "@/lib/email";
import { env } from "@/env";
import { createLogger } from "@/lib/logging";
import { inngest } from "../client";

const logger = createLogger("inngest-monthly-report");

/**
 * Generate Monthly Report
 * Scheduled to run on the 1st of each month at 9 AM
 */
export const generateMonthlyReport = inngest.createFunction(
  {
    id: "generate-monthly-report",
    name: "Generate Monthly Report",
  },
  { cron: "0 9 1 * *" }, // At 9:00 AM on day 1 of every month
  async ({ step }) => {
    // Get last month's period
    const lastMonth = subMonths(new Date(), 1);
    const period = format(lastMonth, "yyyy-MM");

    const users = await step.run("fetch-users", async () => {
      return db.user.findMany({
        where: {
          // Only send to users who have email verified
          emailVerified: true,
          notificationPrefs: {
            emailMonthlySummary: true,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    });

    const results = await step.run("generate-reports", async () => {
      const { ReportService } = await import("@/server/services/reportService");
      const reportResults = [];

      for (const user of users) {
        try {
          const { report } = await ReportService.generateMonthlySummary(
            user.id,
            period,
          );

          // Generate AI Insights
          const { AIService } = await import("@/server/services/aiService");
          const insights = await AIService.generateSpendingInsights(
            user.id,
            period,
          );

          reportResults.push({
            userId: user.id,
            reportId: report.id,
            success: true,
            insights:
              typeof insights === "object" &&
              insights !== null &&
              "summary" in insights
                ? (insights as { summary: string }).summary
                : null,
          });
        } catch (error) {
          logger.error(`Failed to generate report for user ${user.id}`, {
            error: error instanceof Error ? error.message : String(error),
          });
          reportResults.push({
            userId: user.id,
            reportId: null,
            success: false,
            insights: null,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return reportResults;
    });

    await step.run("send-emails", async () => {
      const { ReportService } = await import("@/server/services/reportService");

      for (const result of results) {
        if (!result.success || !result.reportId) continue;
        const res = result;

        const report = await db.report.findUnique({
          where: { id: res.reportId },
          select: {
            id: true,
            period: true,
            data: true,
            user: { select: { name: true, email: true } },
          },
        });

        if (!report) continue;

        try {
          const reportData = report.data as {
            totalIncome: number;
            totalExpenses: number;
            netSavings: number;
            topCategories: Array<{ name: string; amount: number }>;
          };

          // Compile monthly summary template
          const emailHtml = await compileTemplate("monthly-summary.html", {
            userName: report.user.name ?? "User",
            period: report.period,
            totalIncome: reportData.totalIncome.toFixed(2),
            totalExpenses: reportData.totalExpenses.toFixed(2),
            netSavings: reportData.netSavings.toFixed(2),
            netSavingsColor: reportData.netSavings >= 0 ? "#10b981" : "#ef4444",
            appUrl: env.NEXT_PUBLIC_APP_URL ?? "",
            aiInsights:
              res.insights ?? "No AI insights available for this period.",
            topCategories: reportData.topCategories.map((cat) => ({
              name: cat.name,
              amount: cat.amount.toFixed(2),
            })),
          });

          await sendEmail({
            to: report.user.email ?? "",
            subject: `Monthly Financial Summary - ${report.period}`,
            html: emailHtml,
          });

          await ReportService.markAsSent(report.id, report.user.email ?? "");
        } catch (error) {
          logger.error(`Failed to send email for report ${result.reportId}`, {
            error: error instanceof Error ? error.message : String(error),
          });
          if (result.reportId) {
            await ReportService.markAsFailed(result.reportId);
          }
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
