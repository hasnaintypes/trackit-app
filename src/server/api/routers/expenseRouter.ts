import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesSchema,
} from "@/validation/expense";
import { SplitService } from "@/server/services/splitService";
import { toNum } from "@shared/decimal";

export const expenseRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listExpensesSchema)
    .query(async ({ ctx, input }) => {
      // Verify group ownership
      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        select: { userId: true },
      });
      if (group?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      const { cursor, limit } = input;

      const expenses = await ctx.db.expense.findMany({
        where: { groupId: input.groupId },
        select: {
          id: true,
          groupId: true,
          createdById: true,
          description: true,
          notes: true,
          amount: true,
          currency: true,
          categoryId: true,
          date: true,
          receiptUrl: true,
          splitMethod: true,
          isSettlement: true,
          transactionId: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
          participants: {
            select: {
              id: true,
              expenseId: true,
              contactId: true,
              isPayer: true,
              paidAmount: true,
              owedAmount: true,
              contact: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { date: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (expenses.length > limit) {
        const next = expenses.pop();
        nextCursor = next?.id;
      }

      return {
        expenses: expenses.map((e) => ({
          ...e,
          amount: toNum(e.amount),
          date: e.date.toISOString(),
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
          participants: e.participants.map((p) => ({
            ...p,
            paidAmount: toNum(p.paidAmount),
            owedAmount: toNum(p.owedAmount),
          })),
        })),
        nextCursor,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const expense = await ctx.db.expense.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          groupId: true,
          createdById: true,
          description: true,
          notes: true,
          amount: true,
          currency: true,
          categoryId: true,
          date: true,
          receiptUrl: true,
          splitMethod: true,
          isSettlement: true,
          transactionId: true,
          createdAt: true,
          updatedAt: true,
          group: {
            select: { userId: true, name: true },
          },
          category: {
            select: { id: true, name: true, icon: true, color: true },
          },
          participants: {
            select: {
              id: true,
              expenseId: true,
              contactId: true,
              isPayer: true,
              paidAmount: true,
              owedAmount: true,
              contact: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
          },
        },
      });

      if (expense?.group.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      return {
        ...expense,
        amount: toNum(expense.amount),
        date: expense.date.toISOString(),
        createdAt: expense.createdAt.toISOString(),
        updatedAt: expense.updatedAt.toISOString(),
        participants: expense.participants.map((p) => ({
          ...p,
          paidAmount: toNum(p.paidAmount),
          owedAmount: toNum(p.owedAmount),
        })),
      };
    }),

  create: protectedProcedure
    .input(createExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify group ownership
      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        select: { userId: true, currency: true },
      });
      if (group?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      // Verify category belongs to user if provided
      if (input.categoryId) {
        const category = await ctx.db.category.findUnique({
          where: { id: input.categoryId },
          select: { userId: true },
        });
        if (category?.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Category not found",
          });
        }
      }

      // Calculate split amounts
      const splitResults = SplitService.calculateSplit(
        input.amount,
        input.participants.map((p) => ({
          contactId: p.contactId,
          customValue: p.customValue,
        })),
        input.splitMethod,
      );

      // Build participant data with payer info
      const participantData = input.participants.map((p, i) => {
        const splitResult = splitResults[i]!;
        return {
          contactId: p.contactId,
          isPayer: p.isPayer,
          paidAmount: p.isPayer ? p.paidAmount : 0,
          owedAmount: splitResult.owedAmount,
        };
      });

      // Validate that total paid = expense amount
      const totalPaid = participantData.reduce(
        (sum, p) => sum + p.paidAmount,
        0,
      );
      if (Math.round(totalPaid * 100) !== Math.round(input.amount * 100)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Total paid (${totalPaid}) must equal expense amount (${input.amount})`,
        });
      }

      const expense = await ctx.db.$transaction(async (tx) => {
        // Optionally create a linked transaction
        let transactionId: string | undefined;
        if (input.linkTransaction && input.accountId) {
          const txn = await tx.transaction.create({
            data: {
              userId: ctx.user.id,
              accountId: input.accountId,
              amount: input.amount,
              type: "DEBIT",
              description: `Split: ${input.description}`,
              date: input.date ?? new Date(),
              categoryId: input.categoryId,
              groupId: input.groupId,
            },
          });
          transactionId = txn.id;
        }

        const created = await tx.expense.create({
          data: {
            groupId: input.groupId,
            createdById: ctx.user.id,
            description: input.description,
            notes: input.notes,
            amount: input.amount,
            currency: input.currency ?? group.currency,
            categoryId: input.categoryId,
            date: input.date ?? new Date(),
            receiptUrl: input.receiptUrl,
            splitMethod: input.splitMethod,
            transactionId,
            participants: {
              createMany: {
                data: participantData,
              },
            },
          },
          select: {
            id: true,
            description: true,
            amount: true,
            date: true,
            createdAt: true,
          },
        });

        return created;
      });

      return {
        id: expense.id,
        description: expense.description,
        amount: toNum(expense.amount),
        date: expense.date.toISOString(),
        createdAt: expense.createdAt.toISOString(),
      };
    }),

  update: protectedProcedure
    .input(updateExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.expense.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          amount: true,
          splitMethod: true,
          group: { select: { userId: true } },
        },
      });

      if (existing?.group.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      const { id, participants, ...data } = input;
      const newAmount = data.amount ?? toNum(existing.amount);
      const newMethod = data.splitMethod ?? existing.splitMethod;

      await ctx.db.$transaction(async (tx) => {
        // Update the expense fields
        await tx.expense.update({
          where: { id },
          data,
        });

        // If participants changed, recalculate splits
        if (participants) {
          const splitResults = SplitService.calculateSplit(
            newAmount,
            participants.map((p) => ({
              contactId: p.contactId,
              customValue: p.customValue,
            })),
            newMethod,
          );

          // Delete old participants and create new ones
          await tx.expenseParticipant.deleteMany({
            where: { expenseId: id },
          });

          await tx.expenseParticipant.createMany({
            data: participants.map((p, i) => ({
              expenseId: id,
              contactId: p.contactId,
              isPayer: p.isPayer,
              paidAmount: p.isPayer ? p.paidAmount : 0,
              owedAmount: splitResults[i]!.owedAmount,
            })),
          });
        }
      });

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const expense = await ctx.db.expense.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          transactionId: true,
          group: { select: { userId: true } },
        },
      });

      if (expense?.group.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      await ctx.db.$transaction(async (tx) => {
        // Delete the expense (cascades to participants)
        await tx.expense.delete({ where: { id: input.id } });

        // Also delete the linked transaction if one exists
        if (expense.transactionId) {
          await tx.transaction
            .delete({
              where: { id: expense.transactionId },
            })
            .catch(() => {
              // Transaction may have been deleted already
            });
        }
      });

      return { success: true };
    }),
});
