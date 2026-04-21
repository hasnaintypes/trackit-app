import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter } from "@/server/api/trpc";
import { aiRateLimitedProcedure } from "@/server/api/trpc";
import { AIService } from "@/server/services/aiService";
import {
  spendingInsightsSchema,
  scanReceiptSchema,
  categorizeTransactionsSchema,
} from "@/validation/ai";

export const aiRouter = createTRPCRouter({
  budgetRecommendations: aiRateLimitedProcedure.mutation(async ({ ctx }) => {
    return AIService.generateBudgetRecommendations(ctx.user.id);
  }),

  spendingInsights: aiRateLimitedProcedure
    .input(spendingInsightsSchema)
    .mutation(async ({ ctx, input }) => {
      return AIService.generateSpendingInsights(ctx.user.id, input.period);
    }),

  detectAnomalies: aiRateLimitedProcedure.mutation(async ({ ctx }) => {
    return AIService.detectAnomalies(ctx.user.id);
  }),

  financialAdvice: aiRateLimitedProcedure.mutation(async ({ ctx }) => {
    return AIService.getFinancialAdvice(ctx.user.id);
  }),

  scanReceipt: aiRateLimitedProcedure
    .input(scanReceiptSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify category ownership if categories provided
      if (input.categories?.length) {
        const categoryIds = input.categories.map((c) => c.id);
        const owned = await ctx.db.category.findMany({
          where: { id: { in: categoryIds }, userId: ctx.user.id },
          select: { id: true },
        });
        if (owned.length !== categoryIds.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "One or more categories not found",
          });
        }
      }
      return AIService.scanReceiptWithAI({
        extractedText: input.extractedText ?? null,
        imageUrl: input.imageUrl ?? null,
        categories: input.categories ?? null,
      });
    }),

  categorizeTransactions: aiRateLimitedProcedure
    .input(categorizeTransactionsSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify category ownership
      const categoryIds = input.categories.map((c) => c.id);
      const owned = await ctx.db.category.findMany({
        where: { id: { in: categoryIds }, userId: ctx.user.id },
        select: { id: true },
      });
      if (owned.length !== categoryIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more categories not found",
        });
      }
      return AIService.categorizeTransactionsWithAI(
        input.transactions,
        input.categories,
      );
    }),

  parseExpense: aiRateLimitedProcedure
    .input(
      z.object({
        text: z.string().min(1),
        groupId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const contacts = await ctx.db.contact.findMany({
        where: { userId: ctx.user.id },
        select: { name: true },
      });
      return AIService.parseExpenseFromText(
        input.text,
        contacts.map((c) => c.name),
      );
    }),

  groupInsights: aiRateLimitedProcedure
    .input(z.object({ groupId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        select: { userId: true },
      });
      if (group?.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
      }
      return AIService.generateGroupInsights(input.groupId, ctx.user.id);
    }),

  suggestSplit: aiRateLimitedProcedure
    .input(
      z.object({
        groupId: z.string().min(1),
        description: z.string().min(1),
        amount: z.number().min(0.01),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        select: { userId: true },
      });
      if (group?.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Group not found" });
      }
      return AIService.suggestSplit(
        input.groupId,
        input.description,
        input.amount,
      );
    }),
});
