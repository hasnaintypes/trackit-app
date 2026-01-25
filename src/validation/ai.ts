import { z } from "zod";

export const spendingInsightsSchema = z.object({
  period: z.string(), // "2026-01"
});

export const aiCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  parentCategoryId: z.string().nullable().optional(),
});

export const scanReceiptSchema = z.object({
  extractedText: z.string().optional(),
  imageUrl: z.string().optional(),
  categories: z.array(aiCategorySchema).optional(),
});

export const categorizeTransactionsSchema = z.object({
  transactions: z.array(
    z.object({
      index: z.number(),
      description: z.string(),
      amount: z.string(),
      type: z.enum(["DEBIT", "CREDIT", "TRANSFER"]),
      date: z.string().optional(),
      notes: z.string().optional(),
    }),
  ),
  categories: z.array(aiCategorySchema),
});

export type SpendingInsightsInput = z.infer<typeof spendingInsightsSchema>;
export type ScanReceiptInput = z.infer<typeof scanReceiptSchema>;
export type CategorizeTransactionsInput = z.infer<
  typeof categorizeTransactionsSchema
>;
