import { db } from "@/server/db";
import { subMonths, format } from "date-fns";
import { sendEmail } from "@/lib/email";
import { env } from "@/env";
import { inngest } from "../client";

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
          console.error(
            `Failed to generate report for user ${user.id}:`,
            error,
          );
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
        const res = result as {
          success: boolean;
          reportId: string | null;
          insights: string | null;
        };
        if (!res.success || !res.reportId) continue;

        const report = (await db.report.findUnique({
          where: { id: res.reportId },
          include: { user: true },
        })) as unknown as {
          user: { name: string | null; email: string | null };
          id: string;
          period: string;
          data: Record<string, unknown>;
        } | null;

        if (!report) continue;

        try {
          const reportData = report.data as {
            totalIncome: number;
            totalExpenses: number;
            netSavings: number;
            topCategories: Array<{ name: string; amount: number }>;
          };

          // Read monthly summary template
          const fs = await import("fs/promises");
          const path = await import("path");
          const templatePath = path.join(
            process.cwd(),
            "src/lib/email/templates/monthly-summary.html",
          );
          let template = await fs.readFile(templatePath, "utf-8");

          // Replace variables with actual data
          template = template
            .replace(/{{userName}}/g, report.user.name ?? "User")
            .replace(/{{period}}/g, report.period)
            .replace(/{{totalIncome}}/g, reportData.totalIncome.toFixed(2))
            .replace(/{{totalExpenses}}/g, reportData.totalExpenses.toFixed(2))
            .replace(/{{netSavings}}/g, reportData.netSavings.toFixed(2))
            .replace(
              /{{netSavingsColor}}/g,
              reportData.netSavings >= 0 ? "#10b981" : "#ef4444",
            )
            .replace(/{{appUrl}}/g, env.NEXT_PUBLIC_APP_URL ?? "")
            .replace(
              /{{aiInsights}}/g,
              res.insights ?? "No AI insights available for this period.",
            );

          // Replace topCategories loop
          const topCategoriesHtml = reportData.topCategories
            .map(
              (cat) => `
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

          template = template.replace(
            /{{#each topCategories}}[\s\S]*?{{\/each}}/,
            topCategoriesHtml,
          );

          await sendEmail({
            to: report.user.email ?? "",
            subject: `Monthly Financial Summary - ${report.period}`,
            html: template,
          });

          await ReportService.markAsSent(report.id, report.user.email ?? "");
        } catch (error) {
          console.error(
            `Failed to send email for report ${result.reportId}:`,
            error,
          );
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
