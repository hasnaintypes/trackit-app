import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createLogger } from "@/lib/logging";
import { sendEmail } from "@/lib/email";

const logger = createLogger("reportRouter");
import { TRPCError } from "@trpc/server";
import { ReportService } from "@/server/services/reportService";
import { ReportType } from "@prisma/client";
import {
  reportListSchema,
  generateReportSchema,
  resendReportSchema,
} from "@/validation/report";

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
      });

      if (report?.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      }

      // Use the actual email service to resend
      try {
        await sendEmail({
          to: ctx.user.email ?? report.emailSentTo ?? "",
          subject: `Report: ${report.type} - ${report.period}`,
          html: `<p>Report content for ${report.type}</p><pre>${JSON.stringify(report.data, null, 2)}</pre>`,
        });

        await ReportService.markAsSent(report.id, ctx.user.email ?? "");

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
