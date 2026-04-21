import { z } from "zod";

export const recurrenceSchema = z
  .object({
    frequency: z.enum(["DAILY", "WEEKLY", "SEMI_MONTHLY", "MONTHLY", "YEARLY"]),
    interval: z.number().int().min(1).default(1),
    startDate: z.string(),
    endDate: z.string().optional(),
    timezone: z.string().optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    semiMonthlyDay: z.number().int().min(1).max(31).optional(),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    weekOfMonth: z.number().int().min(1).max(5).optional(),
    lastDayOfMonth: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.frequency === "SEMI_MONTHLY") {
        return (
          typeof data.dayOfMonth === "number" &&
          typeof data.semiMonthlyDay === "number"
        );
      }
      return true;
    },
    {
      message:
        "SEMI_MONTHLY frequency requires both dayOfMonth and semiMonthlyDay",
      path: ["semiMonthlyDay"],
    },
  )
  .refine(
    (data) => {
      if (typeof data.weekOfMonth === "number") {
        return (
          data.frequency === "MONTHLY" && typeof data.dayOfWeek === "number"
        );
      }
      return true;
    },
    {
      message: "weekOfMonth requires MONTHLY frequency and dayOfWeek",
      path: ["weekOfMonth"],
    },
  );

export const skipOccurrenceSchema = z.object({
  ruleId: z.string().min(1),
  date: z.string().min(1), // ISO date to skip
});

export const rescheduleOccurrenceSchema = z.object({
  ruleId: z.string().min(1),
  originalDate: z.string().min(1), // ISO date of the original occurrence
  newDate: z.string().min(1), // ISO date to reschedule to
});

export const createTransactionSchema = z.object({
  accountId: z.string().min(1),
  amount: z
    .string()
    .min(1)
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Amount can have at most 2 decimal places",
    }),
  type: z.enum(["DEBIT", "CREDIT", "TRANSFER"]),
  categoryId: z.string().nullable().optional(),
  contactId: z.string().nullable().optional(),
  groupId: z.string().nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  date: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrence: recurrenceSchema.optional(),
  paymentMethod: z
    .enum(["CARD", "CASH", "BANK_TRANSFER", "AUTO_DEBIT", "UPI", "OTHER"])
    .optional(),
  receipt_url: z.string().url().nullable().optional(),
  receipt_extracted_text: z.string().nullable().optional(),
});

export const updateTransactionSchema = z.object({
  id: z.string().min(1),
  accountId: z.string().optional(),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Amount can have at most 2 decimal places",
    })
    .optional(),
  type: z.enum(["DEBIT", "CREDIT", "TRANSFER"]).optional(),
  categoryId: z.string().nullable().optional(),
  contactId: z.string().nullable().optional(),
  groupId: z.string().nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  date: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrence: recurrenceSchema.optional(),
  paymentMethod: z
    .enum(["CARD", "CASH", "BANK_TRANSFER", "AUTO_DEBIT", "UPI", "OTHER"])
    .optional(),
  receipt_url: z.string().url().nullable().optional(),
  receipt_extracted_text: z.string().nullable().optional(),
});

export const transactionListInput = z.object({
  accountId: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  page: z.number().int().min(1).optional(),
  q: z.string().max(200).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type RecurrenceInput = z.infer<typeof recurrenceSchema>;
export type SkipOccurrenceInput = z.infer<typeof skipOccurrenceSchema>;
export type RescheduleOccurrenceInput = z.infer<
  typeof rescheduleOccurrenceSchema
>;
