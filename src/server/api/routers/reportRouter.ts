import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createLogger } from "@/lib/logging";
import { sendTemplateEmail } from "@/lib/email";

const logger = createLogger("reportRouter");
import { TRPCError } from "@trpc/server";
import { ReportService } from "@/server/services/reportService";
import { ReportType } from "@prisma/client";
import type { SendTemplateEmailOptions } from "@/lib/email";
import {
  reportListSchema,
  generateReportSchema,
  resendReportSchema,
} from "@/validation/report";

const REPORT_TYPE_TO_TEMPLATE: Record<
  ReportType,
  SendTemplateEmailOptions["template"]
> = {
  MONTHLY_SUMMARY: "monthly-summary",
  WEEKLY_DIGEST: "weekly-digest",
  BUDGET_EXCEEDED: "budget-alert",
  SPENDING_INSIGHTS: "ai-insight",
};

export const reportRouter = createTRPCRouter({
  list: protectedProcedure
    .input(reportListSchema)
    .query(async ({ ctx, input }) => {
      const reports = await ReportService.getReports(ctx.user.id, {
        type: input.type,
        limit: input.limit,
      });

      return {
        items: reports,
        total: reports.length,
      };
    }),

  generate: protectedProcedure
    .input(generateReportSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.type === ReportType.MONTHLY_SUMMARY) {
        const { report } = await ReportService.generateMonthlySummary(
          ctx.user.id,
          input.period,
        );
        return report;
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Report type ${input.type} generation not implemented`,
      });
    }),

  resend: protectedProcedure
    .input(resendReportSchema)
    .mutation(async ({ input, ctx }) => {
      const report = await ctx.db.report.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          userId: true,
          type: true,
          period: true,
          data: true,
          emailSentTo: true,
        },
      });

      if (report?.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      }

      const userEmail = ctx.user.email;
      if (!userEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No email address on account",
        });
      }

      // Use the actual email service to resend
      try {
        const rawData =
          typeof report.data === "object" && report.data !== null
            ? (report.data as Record<string, unknown>)
            : {};

        // Compute template-specific fields that aren't stored in report.data
        const netSavings =
          typeof rawData.totalIncome === "number" &&
          typeof rawData.totalExpenses === "number"
            ? rawData.totalIncome - rawData.totalExpenses
            : 0;

        await sendTemplateEmail({
          to: userEmail,
          subject: `Report: ${report.type
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase())} - ${report.period}`,
          template: REPORT_TYPE_TO_TEMPLATE[report.type],
          data: {
            userName: ctx.user.name ?? "User",
            period: report.period,
            ...rawData,
            netSavingsColor: netSavings >= 0 ? "#10b981" : "#ef4444",
            remaining:
              typeof rawData.limit === "number" &&
              typeof rawData.spent === "number"
                ? rawData.limit - rawData.spent
                : undefined,
          },
        });

        await ReportService.markAsSent(report.id, userEmail);

        return { success: true };
      } catch (error) {
        logger.error("Resend failed", {
          error: error instanceof Error ? error.message : String(error),
        });
        await ReportService.markAsFailed(report.id);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resend email",
        });
      }
    }),
});
