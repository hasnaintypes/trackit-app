import { z } from "zod";
import { Currency } from "@prisma/client";

export const createSettlementSchema = z.object({
  groupId: z.string().min(1),
  fromContactId: z.string().min(1).nullable(),
  toContactId: z.string().min(1).nullable(),
  amount: z.number().min(0.01, "Amount must be positive"),
  currency: z.nativeEnum(Currency).optional(),
  notes: z.string().max(500).optional(),
  date: z.date().optional(),
  linkTransaction: z.boolean().default(false),
  accountId: z.string().min(1).optional(),
});

export const listSettlementsSchema = z.object({
  groupId: z.string().min(1),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(30),
});

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
export type ListSettlementsInput = z.infer<typeof listSettlementsSchema>;
