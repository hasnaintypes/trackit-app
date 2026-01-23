import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { PrismaClient } from "@prisma/client";

/**
 * Account router
 * - CRUD for user bank accounts (BankAccount model)
 */
export type RawAccount = {
  id: string;
  userId?: string | null;
  name: string;
  type: string;
  currency: string;
  balance: unknown;
  color: string | null;
  icon: string | null;
  isDefault: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export const accountRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const prisma = ctx.db as unknown as PrismaClient;

    const accountsRaw = await prisma.bankAccount.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        currency: true,
        balance: true,
        color: true,
        icon: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const accounts = accountsRaw as RawAccount[];

    return accounts.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      currency: a.currency,
      balance: String(a.balance),
      color: a.color ?? null,
      icon: a.icon ?? null,
      isDefault: Boolean(a.isDefault),
      createdAt: new Date(a.createdAt).toISOString(),
      updatedAt: new Date(a.updatedAt).toISOString(),
    }));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const prisma = ctx.db as unknown as PrismaClient;

      const aRaw = await prisma.bankAccount.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          userId: true,
          name: true,
          type: true,
          currency: true,
          balance: true,
          color: true,
          icon: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      const a = aRaw as RawAccount | null;
      if (a?.userId !== userId) return null;
      return {
        id: a.id,
        name: a.name,
        type: a.type,
        currency: a.currency,
        balance: String(a.balance),
        color: a.color ?? null,
        icon: a.icon ?? null,
        isDefault: Boolean(a.isDefault),
        createdAt: new Date(a.createdAt).toISOString(),
        updatedAt: new Date(a.updatedAt).toISOString(),
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum(["BANK", "CASH", "CREDIT", "INVESTMENT", "LOAN", "OTHER"]),
        currency: z
          .enum([
            "USD",
            "EUR",
            "GBP",
            "JPY",
            "AUD",
            "CAD",
            "CHF",
            "CNY",
            "INR",
            "SGD",
            "PKR",
          ])
          .optional(),
        balance: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        isDefault: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // Determine whether this account should be the default.
      // If the user has no accounts yet, the first created account becomes default.
      const prisma = ctx.db as unknown as PrismaClient;

      const existingCount = await prisma.bankAccount.count({
        where: { userId },
      });
      const isDefaultFinal =
        typeof input.isDefault !== "undefined"
          ? Boolean(input.isDefault)
          : existingCount === 0;

      // If final value is default, unset previous defaults in a transaction
      if (isDefaultFinal) {
        await prisma.$transaction([
          prisma.bankAccount.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
          }),
        ]);
      }

      const createdRaw = await prisma.bankAccount.create({
        data: {
          userId,
          name: input.name,
          type: input.type,
          currency: input.currency ?? "USD",
          balance: input.balance ?? undefined,
          color: input.color ?? undefined,
          icon: input.icon ?? undefined,
          isDefault: isDefaultFinal,
        },
        select: {
          id: true,
          name: true,
          type: true,
          currency: true,
          balance: true,
          color: true,
          icon: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const created = createdRaw as RawAccount;

      return {
        id: created.id,
        name: created.name,
        type: created.type,
        currency: created.currency,
        balance: String(created.balance),
        color: created.color ?? null,
        icon: created.icon ?? null,
        isDefault: Boolean(created.isDefault),
        createdAt: new Date(created.createdAt).toISOString(),
        updatedAt: new Date(created.updatedAt).toISOString(),
      };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).optional(),
        type: z
          .enum(["BANK", "CASH", "CREDIT", "INVESTMENT", "LOAN", "OTHER"])
          .optional(),
        currency: z
          .enum([
            "USD",
            "EUR",
            "GBP",
            "JPY",
            "AUD",
            "CAD",
            "CHF",
            "CNY",
            "INR",
            "SGD",
            "PKR",
          ])
          .optional(),
        balance: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        isDefault: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const prisma = ctx.db as unknown as PrismaClient;
      const existingRaw = await prisma.bankAccount.findUnique({
        where: { id: input.id },
      });
      const existing = existingRaw as RawAccount | null;
      if (existing?.userId !== userId)
        throw new Error("Account not found or not owned by user");

      if (input.isDefault) {
        await prisma.$transaction([
          prisma.bankAccount.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
          }),
        ]);
      }

      const data: Record<string, unknown> = {};
      if (typeof input.name !== "undefined") data.name = input.name;
      if (typeof input.type !== "undefined") data.type = input.type;
      if (typeof input.currency !== "undefined") data.currency = input.currency;
      if (typeof input.balance !== "undefined") data.balance = input.balance;
      if (typeof input.color !== "undefined") data.color = input.color;
      if (typeof input.icon !== "undefined") data.icon = input.icon;
      if (typeof input.isDefault !== "undefined")
        data.isDefault = input.isDefault;
      data.updatedAt = new Date();

      const updatedRaw = await prisma.bankAccount.update({
        where: { id: input.id },
        data,
        select: {
          id: true,
          name: true,
          type: true,
          currency: true,
          balance: true,
          color: true,
          icon: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      const updated = updatedRaw as RawAccount;

      return {
        id: updated.id,
        name: updated.name,
        type: updated.type,
        currency: updated.currency,
        balance: String(updated.balance),
        color: updated.color ?? null,
        icon: updated.icon ?? null,
        isDefault: Boolean(updated.isDefault),
        createdAt: new Date(updated.createdAt).toISOString(),
        updatedAt: new Date(updated.updatedAt).toISOString(),
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const prisma = ctx.db as unknown as PrismaClient;
      const existing = await prisma.bankAccount.findUnique({
        where: { id: input.id },
      });
      if (existing?.userId !== userId)
        throw new Error("Account not found or not owned by user");

      await prisma.bankAccount.delete({ where: { id: input.id } });
      return { success: true };
    }),
});

export default accountRouter;
