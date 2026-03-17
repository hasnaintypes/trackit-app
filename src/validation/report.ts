import { z } from "zod";
import { ReportType } from "@prisma/client";

export const reportListSchema = z.object({
  type: z.nativeEnum(ReportType).optional(),
  limit: z.number().optional().default(20),
});

export const generateReportSchema = z.object({
  type: z.nativeEnum(ReportType),
  period: z.string(), // "2026-01" for monthly, "2026-W03" for weekly
});

export const resendReportSchema = z.object({
  id: z.string(),
});

export type ReportListInput = z.infer<typeof reportListSchema>;
export type GenerateReportInput = z.infer<typeof generateReportSchema>;
export type ResendReportInput = z.infer<typeof resendReportSchema>;
