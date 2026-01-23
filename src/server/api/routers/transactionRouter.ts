import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type {
  Prisma,
  Transaction as TxModel,
  RecurringRule as RecurringRuleModel,
} from "@prisma/client";
import { RecurringStatus, type RecurringFrequency } from "@prisma/client";
import { calculateNextRunAt } from "@/lib/recurrence";
import { enqueueRecurringRun } from "@/lib/inngest/events";

// Use the shared input type inferred from Zod schema to keep
// router and UI aligned without unsafe casts.
type RecurrenceInputStrict = {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval?: number;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
};

// Local schema to avoid unsafe import typing from external module.
const recurrenceInputSchema = z.object({
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  interval: z.number().int().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timezone: z.string().optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
});

export const transactionRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        accountId: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        cursor: z.string().optional(),
        page: z.number().int().min(1).optional(),
        q: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const prisma = ctx.db;

      const where: Prisma.TransactionWhereInput = { userId };
      if (input.accountId) where.accountId = input.accountId;
      if (input.q) {
        where.OR = [
          { description: { contains: input.q, mode: "insensitive" } },
          { notes: { contains: input.q, mode: "insensitive" } },
        ];
      }
      if (input.startDate || input.endDate) {
        where.date = {} as Prisma.DateTimeFilter;
        if (input.startDate)
          (where.date as Prisma.DateTimeFilter).gte = new Date(input.startDate);
        if (input.endDate)
          (where.date as Prisma.DateTimeFilter).lte = new Date(input.endDate);
      }

      const take = input.limit + 1;

      // If `page` is provided we use offset (skip) pagination so callers
      // can request a specific page in a single request (avoids making
      // repeated cursor calls when jumping to page N).
      const useOffset = typeof input.page === "number";
      const pageSafe = useOffset
        ? Math.max(Number(input.page ?? 1), 1)
        : undefined;
      const skip =
        useOffset && typeof pageSafe === "number"
          ? (pageSafe - 1) * input.limit
          : input.cursor
            ? 1
            : 0;

      const rows = await prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        take,
        cursor: !useOffset && input.cursor ? { id: input.cursor } : undefined,
        skip,
        select: {
          id: true,
          userId: true,
          accountId: true,
          categoryId: true,
          contactId: true,
          groupId: true,
          amount: true,
          type: true,
          description: true,
          notes: true,
          date: true,
          isRecurring: true,
          recurringRuleId: true,
          receipt_url: true,
          receipt_extracted_text: true,
          paymentMethod: true,
          ai_category_suggestion: true,
          ai_notes: true,
          createdAt: true,
          updatedAt: true,
          recurringRule: {
            select: {
              frequency: true,
              nextRunAt: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (rows.length > input.limit) {
        const next = rows.pop()!;
        nextCursor = next.id;
      }

      const totalCount = await prisma.transaction.count({ where });

      return {
        transactions: rows.map((t) => ({
          ...t,
          amount: String(t.amount),
          date: t.date.toISOString(),
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          recurringRule: t.recurringRule
            ? {
                frequency: (
                  t.recurringRule as { frequency: RecurringFrequency }
                ).frequency,
                nextRunAt: (
                  t.recurringRule as { nextRunAt: Date }
                ).nextRunAt.toISOString(),
              }
            : null,
        })),
        nextCursor,
        totalCount,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const prisma = ctx.db;
      const t = await prisma.transaction.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          userId: true,
          accountId: true,
          categoryId: true,
          contactId: true,
          groupId: true,
          amount: true,
          type: true,
          description: true,
          notes: true,
          date: true,
          isRecurring: true,
          recurringRuleId: true,
          receipt_url: true,
          receipt_extracted_text: true,
          paymentMethod: true,
          ai_category_suggestion: true,
          ai_notes: true,
          createdAt: true,
          updatedAt: true,
          recurringRule: {
            select: {
              frequency: true,
              nextRunAt: true,
            },
          },
        },
      });
      if (t?.userId !== ctx.user.id) return null;
      return {
        ...t,
        amount: String(t.amount),
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        recurringRule: t.recurringRule
          ? {
              frequency: (t.recurringRule as { frequency: RecurringFrequency })
                .frequency,
              nextRunAt: (
                t.recurringRule as { nextRunAt: Date }
              ).nextRunAt.toISOString(),
            }
          : null,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        amount: z.string().min(1),
        type: z.enum(["DEBIT", "CREDIT", "TRANSFER"]),
        categoryId: z.string().nullable().optional(),
        contactId: z.string().nullable().optional(),
        groupId: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        date: z.string().optional(),
        isRecurring: z.boolean().optional(),
        recurrence: recurrenceInputSchema.optional(),
        paymentMethod: z
          .enum(["CARD", "CASH", "BANK_TRANSFER", "AUTO_DEBIT", "UPI", "OTHER"])
          .optional(),
        receipt_url: z.string().nullable().optional(),
        receipt_extracted_text: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const prisma = ctx.db;

      const account = await prisma.bankAccount.findUnique({
        where: { id: input.accountId },
      });
      if (account?.userId !== userId)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      const recurrence: RecurrenceInputStrict | null = input.recurrence ?? null;
      const initialDate = input.date ? new Date(input.date) : new Date();

      const { created, rule } = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          let newRule: { id: string; nextRunAt?: Date | null } | null = null;

          if (input.isRecurring && recurrence) {
            const startDate = new Date(
              (recurrence.startDate ?? initialDate) as string,
            );
            const nextRunAt = startDate;
            const followingRun = calculateNextRunAt({
              frequency: recurrence.frequency,
              interval: recurrence.interval,
              dayOfMonth: recurrence.dayOfMonth,
              dayOfWeek: recurrence.dayOfWeek,
              startDate,
              endDate: recurrence.endDate
                ? new Date(recurrence.endDate)
                : undefined,
              nextRunAt,
            });

            const createdRule = await tx.recurringRule.create({
              data: {
                userId,
                accountId: input.accountId,
                categoryId: input.categoryId ?? null,
                amount: input.amount,
                type: input.type,
                description: input.description ?? null,
                notes: input.notes ?? null,
                startDate,
                endDate: recurrence.endDate
                  ? new Date(recurrence.endDate)
                  : null,
                frequency: recurrence.frequency,
                interval: recurrence.interval ?? 1,
                dayOfMonth: recurrence.dayOfMonth ?? null,
                dayOfWeek: recurrence.dayOfWeek ?? null,
                nextRunAt: followingRun ?? nextRunAt,
                timezone: recurrence.timezone ?? "UTC",
                status: RecurringStatus.ACTIVE,
              },
            });

            newRule = {
              id: createdRule.id,
              nextRunAt: followingRun ?? createdRule.nextRunAt,
            };
          }

          const createdTx: TxModel = await tx.transaction.create({
            data: {
              userId,
              accountId: input.accountId,
              categoryId: input.categoryId ?? null,
              contactId: input.contactId ?? null,
              groupId: input.groupId ?? null,
              amount: input.amount,
              type: input.type,
              description: input.description ?? null,
              notes: input.notes ?? null,
              date: initialDate,
              isRecurring: Boolean(newRule) || input.isRecurring === true,
              recurringRuleId: newRule?.id,
              paymentMethod: input.paymentMethod ?? undefined,
              receipt_url: input.receipt_url ?? null,
              receipt_extracted_text: input.receipt_extracted_text ?? null,
            },
          });

          return { created: createdTx, rule: newRule };
        },
      );

      if (rule?.nextRunAt) {
        await enqueueRecurringRun(rule.id, rule.nextRunAt);
      }

      return {
        ...created,
        amount: String(created.amount),
        date: created.date.toISOString(),
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        accountId: z.string().optional(),
        amount: z.string().optional(),
        type: z.enum(["DEBIT", "CREDIT", "TRANSFER"]).optional(),
        categoryId: z.string().nullable().optional(),
        contactId: z.string().nullable().optional(),
        groupId: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        notes: z.string().nullable().optional(),
        paymentMethod: z
          .enum(["CARD", "CASH", "BANK_TRANSFER", "AUTO_DEBIT", "UPI", "OTHER"])
          .optional(),
        receipt_url: z.string().nullable().optional(),
        receipt_extracted_text: z.string().nullable().optional(),
        date: z.string().optional(),
        isRecurring: z.boolean().optional(),
        recurrence: recurrenceInputSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const prisma = ctx.db;
      const existing = await prisma.transaction.findUnique({
        where: { id: input.id },
      });
      if (existing?.userId !== ctx.user.id)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });

      if (input.accountId) {
        const account = await prisma.bankAccount.findUnique({
          where: { id: input.accountId },
        });
        if (account?.userId !== ctx.user.id)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Account not found",
          });
      }

      const recurrence: RecurrenceInputStrict | null = input.recurrence ?? null;

      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const data: Record<string, unknown> = {};
          if (typeof input.accountId !== "undefined") {
            data.account = { connect: { id: input.accountId } };
          }
          if (typeof input.amount !== "undefined") data.amount = input.amount;
          if (typeof input.type !== "undefined") data.type = input.type;
          if (Object.prototype.hasOwnProperty.call(input, "categoryId")) {
            if (input.categoryId) {
              data.category = { connect: { id: input.categoryId } };
            } else {
              data.category = { disconnect: true };
            }
          }
          if (Object.prototype.hasOwnProperty.call(input, "contactId"))
            data.contactId = input.contactId ?? null;
          if (Object.prototype.hasOwnProperty.call(input, "groupId"))
            data.groupId = input.groupId ?? null;
          if (Object.prototype.hasOwnProperty.call(input, "description"))
            data.description = input.description ?? null;
          if (Object.prototype.hasOwnProperty.call(input, "notes"))
            data.notes = input.notes ?? null;
          if (Object.prototype.hasOwnProperty.call(input, "paymentMethod"))
            data.paymentMethod = input.paymentMethod ?? null;
          if (Object.prototype.hasOwnProperty.call(input, "receipt_url"))
            data.receipt_url = input.receipt_url ?? null;
          if (
            Object.prototype.hasOwnProperty.call(
              input,
              "receipt_extracted_text",
            )
          )
            data.receipt_extracted_text = input.receipt_extracted_text ?? null;
          if (typeof input.date !== "undefined")
            data.date = new Date(input.date);
          if (typeof input.isRecurring !== "undefined")
            data.isRecurring = input.isRecurring;

          data.updatedAt = new Date();

          let ruleId: string | null | undefined = existing.recurringRuleId;
          let nextRunAt: Date | null | undefined;

          if (recurrence && (input.isRecurring ?? existing.isRecurring)) {
            const startDate = new Date(recurrence.startDate ?? existing.date);
            if (ruleId) {
              const followingRun = calculateNextRunAt(
                {
                  frequency: recurrence.frequency,
                  interval: recurrence.interval,
                  dayOfMonth: recurrence.dayOfMonth,
                  dayOfWeek: recurrence.dayOfWeek,
                  startDate,
                  endDate: recurrence.endDate
                    ? new Date(recurrence.endDate)
                    : null,
                  nextRunAt: startDate,
                },
                startDate,
              );

              const updatedRule: RecurringRuleModel =
                await tx.recurringRule.update({
                  where: { id: ruleId },
                  data: {
                    accountId: input.accountId ?? existing.accountId,
                    categoryId: Object.prototype.hasOwnProperty.call(
                      input,
                      "categoryId",
                    )
                      ? (input.categoryId ?? null)
                      : existing.categoryId,
                    amount: input.amount ?? existing.amount.toString(),
                    type: input.type ?? existing.type,
                    description: input.description ?? existing.description,
                    notes: input.notes ?? existing.notes,
                    startDate,
                    endDate: recurrence.endDate
                      ? new Date(recurrence.endDate)
                      : null,
                    frequency: recurrence.frequency,
                    interval: recurrence.interval ?? 1,
                    dayOfMonth: recurrence.dayOfMonth ?? null,
                    dayOfWeek: recurrence.dayOfWeek ?? null,
                    nextRunAt: followingRun ?? startDate,
                    status: RecurringStatus.ACTIVE,
                  },
                });
              nextRunAt = followingRun ?? updatedRule.nextRunAt;
            } else {
              const followingRun = calculateNextRunAt(
                {
                  frequency: recurrence.frequency,
                  interval: recurrence.interval,
                  dayOfMonth: recurrence.dayOfMonth,
                  dayOfWeek: recurrence.dayOfWeek,
                  startDate,
                  endDate: recurrence.endDate
                    ? new Date(recurrence.endDate)
                    : null,
                  nextRunAt: startDate,
                },
                startDate,
              );

              const createdRule: RecurringRuleModel =
                await tx.recurringRule.create({
                  data: {
                    userId: existing.userId,
                    accountId: input.accountId ?? existing.accountId,
                    categoryId: Object.prototype.hasOwnProperty.call(
                      input,
                      "categoryId",
                    )
                      ? (input.categoryId ?? null)
                      : existing.categoryId,
                    amount: input.amount ?? existing.amount.toString(),
                    type: input.type ?? existing.type,
                    description: input.description ?? existing.description,
                    notes: input.notes ?? existing.notes,
                    startDate,
                    endDate: recurrence.endDate
                      ? new Date(recurrence.endDate)
                      : null,
                    frequency: recurrence.frequency,
                    interval: recurrence.interval ?? 1,
                    dayOfMonth: recurrence.dayOfMonth ?? null,
                    dayOfWeek: recurrence.dayOfWeek ?? null,
                    nextRunAt: followingRun ?? startDate,
                    timezone: recurrence.timezone ?? "UTC",
                    status: RecurringStatus.ACTIVE,
                  },
                });
              ruleId = createdRule.id;
              nextRunAt = followingRun ?? createdRule.nextRunAt;
            }
          }

          if (ruleId) {
            data.recurringRule = { connect: { id: ruleId } };
            data.isRecurring = true;
          }

          const updated: TxModel = await tx.transaction.update({
            where: { id: input.id },
            data: data as Prisma.TransactionUpdateInput,
          });
          return { updated, ruleId, nextRunAt } as {
            updated: TxModel;
            ruleId?: string | null;
            nextRunAt?: Date | null;
          };
        },
      );

      if (typeof result.ruleId === "string" && result.nextRunAt) {
        await enqueueRecurringRun(result.ruleId, result.nextRunAt);
      }

      const updated: TxModel = result.updated;
      return {
        ...updated,
        amount: String(updated.amount),
        date: updated.date.toISOString(),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    }),

  uploadReceipt: protectedProcedure
    .input(
      z.object({
        transactionId: z.string().optional(),
        fileDataUrl: z.string().min(1),
        fileName: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const prisma = ctx.db;
      const userId = ctx.user.id;
      // Lazy import of server-side upload helper
      const { uploadImage } = await import("@/lib/shared/imagekit");

      const res = await uploadImage({
        file: input.fileDataUrl,
        fileName: input.fileName ?? `receipt_${Date.now()}`,
        // Store receipts in a dedicated folder for easier management
        folder: "Cashio-Uploads/Receipts",
      });
      const url = res?.url ?? null;

      if (input.transactionId) {
        // Ensure transaction belongs to user
        const existing = await prisma.transaction.findUnique({
          where: { id: input.transactionId },
        });
        if (existing?.userId !== userId)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Transaction not found",
          });
        await prisma.transaction.update({
          where: { id: input.transactionId },
          data: { receipt_url: url },
        });
      }

      return { url };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const prisma = ctx.db;
      const existing = await prisma.transaction.findUnique({
        where: { id: input.id },
      });
      if (existing?.userId !== ctx.user.id)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      await prisma.transaction.delete({ where: { id: input.id } });
      return { success: true };
    }),

  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string().min(1)).min(1) }))
    .mutation(async ({ ctx, input }) => {
      const prisma = ctx.db;
      const userId = ctx.user.id;

      // Verify all transactions belong to the user
      const existingTransactions = await prisma.transaction.findMany({
        where: { id: { in: input.ids }, userId },
        select: { id: true },
      });

      if (existingTransactions.length !== input.ids.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more transactions not found or do not belong to you",
        });
      }

      // Delete all transactions
      const result = await prisma.transaction.deleteMany({
        where: { id: { in: input.ids }, userId },
      });

      return { success: true, count: result.count };
    }),
});

export default transactionRouter;
