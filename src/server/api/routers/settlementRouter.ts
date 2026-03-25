import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createSettlementSchema,
  listSettlementsSchema,
} from "@/validation/settlement";
import { toNum } from "@shared/decimal";

export const settlementRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listSettlementsSchema)
    .query(async ({ ctx, input }) => {
      // Verify group ownership
      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        select: { userId: true },
      });
      if (!group || group.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      const { cursor, limit } = input;

      const settlements = await ctx.db.settlement.findMany({
        where: { groupId: input.groupId },
        orderBy: { date: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (settlements.length > limit) {
        const next = settlements.pop();
        nextCursor = next?.id;
      }

      return {
        settlements: settlements.map((s) => ({
          id: s.id,
          groupId: s.groupId,
          createdById: s.createdById,
          fromContactId: s.fromContactId,
          toContactId: s.toContactId,
          amount: toNum(s.amount),
          currency: s.currency,
          notes: s.notes,
          date: s.date.toISOString(),
          transactionId: s.transactionId,
          createdAt: s.createdAt.toISOString(),
        })),
        nextCursor,
      };
    }),

  create: protectedProcedure
    .input(createSettlementSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify group ownership
      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        select: { userId: true, currency: true },
      });
      if (!group || group.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      // from and to can't be the same
      if (input.fromContactId === input.toContactId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payer and payee cannot be the same person",
        });
      }

      const settlement = await ctx.db.$transaction(async (tx) => {
        // Optionally create a linked transaction (TRANSFER type)
        let transactionId: string | undefined;
        if (input.linkTransaction && input.accountId) {
          const txn = await tx.transaction.create({
            data: {
              userId: ctx.user.id,
              accountId: input.accountId,
              amount: input.amount,
              type: "TRANSFER",
              description: `Settlement in group`,
              date: input.date ?? new Date(),
              groupId: input.groupId,
            },
          });
          transactionId = txn.id;
        }

        return tx.settlement.create({
          data: {
            groupId: input.groupId,
            createdById: ctx.user.id,
            fromContactId: input.fromContactId,
            toContactId: input.toContactId,
            amount: input.amount,
            currency: input.currency ?? group.currency,
            notes: input.notes,
            date: input.date ?? new Date(),
            transactionId,
          },
        });
      });

      return {
        id: settlement.id,
        amount: toNum(settlement.amount),
        date: settlement.date.toISOString(),
        createdAt: settlement.createdAt.toISOString(),
      };
    }),
});
