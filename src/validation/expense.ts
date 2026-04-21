import { z } from "zod";
import { Currency, SplitMethod } from "@prisma/client";

const participantSchema = z.object({
  contactId: z.string().min(1).nullable(),
  isPayer: z.boolean().default(false),
  paidAmount: z.number().min(0).default(0),
  customValue: z.number().optional(),
});

export const createExpenseSchema = z.object({
  groupId: z.string().min(1),
  description: z.string().min(1, "Description is required").max(500),
  notes: z.string().max(1000).optional(),
  amount: z.number().min(0.01, "Amount must be positive"),
  currency: z.nativeEnum(Currency).optional(),
  categoryId: z.string().min(1).optional(),
  date: z.date().optional(),
  receiptUrl: z.string().url().optional(),
  splitMethod: z.nativeEnum(SplitMethod).default("EQUAL"),
  participants: z
    .array(participantSchema)
    .min(1, "At least one participant is required"),
  linkTransaction: z.boolean().default(false),
  accountId: z.string().min(1).optional(),
});

export const updateExpenseSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1).max(500).optional(),
  notes: z.string().max(1000).optional().nullable(),
  amount: z.number().min(0.01).optional(),
  categoryId: z.string().min(1).optional().nullable(),
  date: z.date().optional(),
  receiptUrl: z.string().url().optional().nullable(),
  splitMethod: z.nativeEnum(SplitMethod).optional(),
  participants: z.array(participantSchema).min(1).optional(),
});

export const listExpensesSchema = z.object({
  groupId: z.string().min(1),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(30),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ListExpensesInput = z.infer<typeof listExpensesSchema>;
