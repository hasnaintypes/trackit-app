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
    .mutation(async ({ input }) => {
      return AIService.scanReceiptWithAI({
        extractedText: input.extractedText ?? null,
        imageUrl: input.imageUrl ?? null,
        categories: input.categories ?? null,
      });
    }),

  categorizeTransactions: aiRateLimitedProcedure
    .input(categorizeTransactionsSchema)
    .mutation(async ({ input }) => {
      return AIService.categorizeTransactionsWithAI(
        input.transactions,
        input.categories,
      );
    }),
});
