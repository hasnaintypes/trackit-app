import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createLogger } from "@/lib/logging";

const logger = createLogger("transactionRouter");
import type {
  Prisma,
  Transaction as TxModel,
  RecurringRule as RecurringRuleModel,
} from "@prisma/client";
import { RecurringStatus } from "@prisma/client";
import { calculateNextRunAt } from "@/lib/recurrence";
import {
  enqueueRecurringRun,
  emitTransactionProcessed,
} from "@/lib/inngest/events";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionListInput,
} from "@/validation/transaction";
import type { RecurrenceInputStrict } from "@/types/transaction";

export const transactionRouter = createTRPCRouter({
  list: protectedProcedure
    .input(transactionListInput)
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
        const dateFilter: Prisma.DateTimeFilter = {};
        if (input.startDate) dateFilter.gte = new Date(input.startDate);
        if (input.endDate) dateFilter.lte = new Date(input.endDate);
        where.date = dateFilter;
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
                frequency: t.recurringRule.frequency,
                nextRunAt: t.recurringRule.nextRunAt.toISOString(),
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
        where: { id: input.id, userId: ctx.user.id },
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
      if (!t) return null;
      return {
        ...t,
        amount: String(t.amount),
        date: t.date.toISOString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        recurringRule: t.recurringRule
          ? {
              frequency: t.recurringRule.frequency,
              nextRunAt: t.recurringRule.nextRunAt.toISOString(),
            }
          : null,
      };
    }),

  create: protectedProcedure
    .input(createTransactionSchema)
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

          // Update account balance
          const balanceDelta =
            input.type === "CREDIT"
              ? parseFloat(input.amount)
              : -parseFloat(input.amount);
          await tx.bankAccount.update({
            where: { id: input.accountId },
            data: { balance: { increment: balanceDelta } },
          });

          return { created: createdTx, rule: newRule };
        },
      );

      if (rule?.nextRunAt) {
        await enqueueRecurringRun(rule.id, rule.nextRunAt);
      }

      await emitTransactionProcessed({
        userId,
        transactionId: created.id,
        accountId: created.accountId,
        categoryId: input.categoryId ?? null,
        date: initialDate,
      });

      return {
        ...created,
        amount: String(created.amount),
        date: created.date.toISOString(),
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    }),

  update: protectedProcedure
    .input(updateTransactionSchema)
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
          const data: Prisma.TransactionUpdateInput = {};
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

          const updated = await tx.transaction.update({
            where: { id: input.id },
            data,
          });

          // Update account balance if amount or type changed
          const oldAmount = Number(existing.amount);
          const newAmount =
            input.amount !== undefined ? parseFloat(input.amount) : oldAmount;
          const oldType = existing.type;
          const newType = input.type ?? oldType;
          const oldEffect = oldType === "CREDIT" ? oldAmount : -oldAmount;
          const newEffect = newType === "CREDIT" ? newAmount : -newAmount;
          const delta = newEffect - oldEffect;
          if (delta !== 0) {
            const accountId = input.accountId ?? existing.accountId;
            await tx.bankAccount.update({
              where: { id: accountId },
              data: { balance: { increment: delta } },
            });
          }

          return { updated, ruleId, nextRunAt };
        },
      );

      if (typeof result.ruleId === "string" && result.nextRunAt) {
        await enqueueRecurringRun(result.ruleId, result.nextRunAt);
      }

      await emitTransactionProcessed({
        userId: ctx.user.id,
        transactionId: result.updated.id,
        accountId: result.updated.accountId,
        categoryId: result.updated.categoryId ?? null,
        date: result.updated.date,
      });

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
        fileDataUrl: z.string().min(1).max(10_000_000), // ~7.5MB base64 limit
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
        folder: "Trackit-Uploads/Receipts",
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
      // Reverse the balance effect before deleting
      const balanceRevert =
        existing.type === "CREDIT"
          ? -Number(existing.amount)
          : Number(existing.amount);
      await prisma.$transaction([
        prisma.bankAccount.update({
          where: { id: existing.accountId },
          data: { balance: { increment: balanceRevert } },
        }),
        prisma.transaction.delete({ where: { id: input.id } }),
      ]);
      return { success: true };
    }),

  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string().min(1)).min(1) }))
    .mutation(async ({ ctx, input }) => {
      const prisma = ctx.db;
      const userId = ctx.user.id;

      // Verify all transactions belong to the user and get balance info
      const existingTransactions = await prisma.transaction.findMany({
        where: { id: { in: input.ids }, userId },
        select: { id: true, amount: true, type: true, accountId: true },
      });

      if (existingTransactions.length !== input.ids.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more transactions not found or do not belong to you",
        });
      }

      // Calculate balance adjustments per account
      const balanceAdjustments: Record<string, number> = {};
      for (const tx of existingTransactions) {
        const revert =
          tx.type === "CREDIT" ? -Number(tx.amount) : Number(tx.amount);
        balanceAdjustments[tx.accountId] =
          (balanceAdjustments[tx.accountId] ?? 0) + revert;
      }

      // Delete all transactions and update balances in a single transaction
      const balanceUpdates = Object.entries(balanceAdjustments).map(
        ([accountId, delta]) =>
          prisma.bankAccount.update({
            where: { id: accountId },
            data: { balance: { increment: delta } },
          }),
      );

      await prisma.$transaction([
        ...balanceUpdates,
        prisma.transaction.deleteMany({
          where: { id: { in: input.ids }, userId },
        }),
      ]);

      return { success: true, count: existingTransactions.length };
    }),

  bulkCreate: protectedProcedure
    .input(
      z.object({
        accountId: z.string().min(1),
        transactions: z.array(
          z.object({
            amount: z.string().min(1),
            type: z.enum(["DEBIT", "CREDIT", "TRANSFER"]),
            description: z.string().nullable().optional(),
            notes: z.string().nullable().optional(),
            date: z.string().optional(),
            categoryId: z.string().nullable().optional(),
            categoryName: z.string().nullable().optional(),
            paymentMethod: z
              .enum([
                "CARD",
                "CASH",
                "BANK_TRANSFER",
                "AUTO_DEBIT",
                "UPI",
                "OTHER",
              ])
              .optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const prisma = ctx.db;

      // Verify account ownership
      const account = await prisma.bankAccount.findUnique({
        where: { id: input.accountId, userId },
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found or access denied",
        });
      }

      const transactionsToProcess = [...input.transactions];

      // Identify transactions that need AI categorization
      const needsCategorizationIndices = transactionsToProcess
        .map((tx, idx) => (tx.categoryId ? null : idx))
        .filter((idx): idx is number => idx !== null);

      if (needsCategorizationIndices.length > 0) {
        const categories = await prisma.category.findMany({
          where: { userId },
          include: { children: true },
        });

        if (categories.length > 0) {
          const { AIService } = await import("@/server/services/aiService");

          const categoriesForAI = categories.flatMap((cat) => [
            {
              id: cat.id,
              name: cat.name,
              type: cat.type as "INCOME" | "EXPENSE" | "TRANSFER",
            },
            ...(cat.children?.map((sub) => ({
              id: sub.id,
              name: sub.name,
              type: sub.type as "INCOME" | "EXPENSE" | "TRANSFER",
              parentCategoryId: cat.id,
            })) ?? []),
          ]);

          const BATCH_SIZE = 50;
          for (
            let i = 0;
            i < needsCategorizationIndices.length;
            i += BATCH_SIZE
          ) {
            const batchIndices = needsCategorizationIndices.slice(
              i,
              i + BATCH_SIZE,
            );
            const batchTransactions = batchIndices.map((idx) => {
              const tx = transactionsToProcess[idx]!;
              return {
                index: idx,
                description: tx.description ?? "Untitled",
                amount: tx.amount,
                type: tx.type,
                date: tx.date,
                notes: tx.categoryName
                  ? tx.notes
                    ? `${tx.notes} (Category: ${tx.categoryName})`
                    : `Category: ${tx.categoryName}`
                  : (tx.notes ?? undefined),
              };
            });

            try {
              const aiResult = await AIService.categorizeTransactionsWithAI(
                batchTransactions,
                categoriesForAI,
              );

              aiResult.results.forEach(
                (res: { index: number; categoryId: string }) => {
                  const tx = transactionsToProcess[res.index];
                  if (tx) {
                    tx.categoryId = res.categoryId;
                  }
                },
              );
            } catch (err) {
              logger.error("AI Categorization batch error", {
                error: err instanceof Error ? err.message : String(err),
              });
            }
          }
        }
      }

      // Calculate total balance impact
      let totalBalanceDelta = 0;
      for (const tx of transactionsToProcess) {
        const amount = parseFloat(tx.amount);
        totalBalanceDelta += tx.type === "CREDIT" ? amount : -amount;
      }

      const created = await prisma.$transaction([
        ...transactionsToProcess.map((tx) =>
          prisma.transaction.create({
            data: {
              userId,
              accountId: input.accountId,
              amount: tx.amount,
              type: tx.type,
              description: tx.description ?? null,
              notes: tx.notes ?? null,
              date: tx.date ? new Date(tx.date) : new Date(),
              categoryId: tx.categoryId ?? null,
              paymentMethod: tx.paymentMethod ?? null,
            },
          }),
        ),
        prisma.bankAccount.update({
          where: { id: input.accountId },
          data: { balance: { increment: totalBalanceDelta } },
        }),
      ]);

      // Remove the bankAccount update result from the array
      const createdTransactions = created.slice(0, -1) as TxModel[];

      // Trigger budget evaluation and threshold checks for all created transactions
      await Promise.all(
        createdTransactions.map((tx) =>
          emitTransactionProcessed({
            userId,
            transactionId: tx.id,
            accountId: tx.accountId,
            categoryId: tx.categoryId ?? null,
            date: tx.date,
          }),
        ),
      );

      return {
        success: true,
        count: createdTransactions.length,
      };
    }),
});

export default transactionRouter;
