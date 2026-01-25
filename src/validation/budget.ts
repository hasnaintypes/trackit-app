import { z } from "zod";
import { BudgetPeriod } from "@prisma/client";

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.number().min(0),
  period: z.nativeEnum(BudgetPeriod),
  startDate: z.date(),
  endDate: z.date().optional(),
});

export const updateBudgetSchema = z.object({
  id: z.string().min(1),
  amount: z.number().min(0).optional(),
  period: z.nativeEnum(BudgetPeriod).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
