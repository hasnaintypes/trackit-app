import { z } from "zod";
import {
  Currency,
  Language,
  DateFormat,
  TimeFormat,
  WeekDay,
  CurrencyPosition,
  ThousandSeparator,
  ColorScheme,
} from "@prisma/client";

export const updateNotificationsSchema = z.object({
  emailTransactions: z.boolean().optional(),
  emailBalanceAlerts: z.boolean().optional(),
  emailSecurity: z.boolean().optional(),
  emailMarketing: z.boolean().optional(),
  emailAiInsights: z.boolean().optional(),
  emailWeeklyDigest: z.boolean().optional(),
  emailMonthlySummary: z.boolean().optional(),
  emailLowBalanceAlerts: z.boolean().optional(),
  emailLargeTransactions: z.boolean().optional(),
  pushTransactions: z.boolean().optional(),
  pushBalanceAlerts: z.boolean().optional(),
  smsLargeTransactions: z.boolean().optional(),
  smsSecurity: z.boolean().optional(),
  largeTransactionThreshold: z.number().optional(),
  lowBalanceThreshold: z.number().optional(),
});

export const updateDisplaySchema = z.object({
  decimalPlaces: z.number().int().min(0).max(4).optional(),
  currencyPosition: z.nativeEnum(CurrencyPosition).optional(),
  thousandSeparator: z.nativeEnum(ThousandSeparator).optional(),
  colorScheme: z.nativeEnum(ColorScheme).optional(),
  compactNumbers: z.boolean().optional(),
});

export const updateRegionalSchema = z.object({
  defaultCurrency: z.nativeEnum(Currency).optional(),
  language: z.nativeEnum(Language).optional(),
  dateFormat: z.nativeEnum(DateFormat).optional(),
  timeFormat: z.nativeEnum(TimeFormat).optional(),
  weekStartsOn: z.nativeEnum(WeekDay).optional(),
});

export type UpdateNotificationsInput = z.infer<
  typeof updateNotificationsSchema
>;
export type UpdateDisplayInput = z.infer<typeof updateDisplaySchema>;
export type UpdateRegionalInput = z.infer<typeof updateRegionalSchema>;
