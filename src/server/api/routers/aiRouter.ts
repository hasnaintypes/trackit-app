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
});
