import { z } from "zod";

export const recurrenceSchema = z.object({
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  interval: z.number().int().min(1).default(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  timezone: z.string().optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
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
  receipt_url: z.string().nullable().optional(),
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
  receipt_url: z.string().nullable().optional(),
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
// No default export to preserve proper type information for named exports.
