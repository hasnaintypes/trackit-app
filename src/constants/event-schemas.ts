import { z } from "zod";

export const TransactionProcessedSchema = z.object({
  userId: z.string(),
  transactionId: z.string(),
  accountId: z.string(),
  categoryId: z.string().nullable(),
  date: z.coerce.date(),
});

export const BudgetThresholdSchema = z.object({
  budgetId: z.string(),
  userId: z.string(),
  threshold: z.number(),
});

export const TransactionAlertSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  description: z.string(),
  threshold: z.number(),
});

export const RecurringSchema = z.object({
  ruleId: z.string(),
});
