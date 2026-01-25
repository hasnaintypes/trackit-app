import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { AIService } from "@/server/services/aiService";
import {
  spendingInsightsSchema,
  scanReceiptSchema,
  categorizeTransactionsSchema,
} from "@/validation/ai";

export const aiRouter = createTRPCRouter({
  budgetRecommendations: protectedProcedure.query(async ({ ctx }) => {
    return AIService.generateBudgetRecommendations(ctx.user.id);
  }),

  spendingInsights: protectedProcedure
    .input(spendingInsightsSchema)
    .query(async ({ ctx, input }) => {
      return AIService.generateSpendingInsights(ctx.user.id, input.period);
    }),

  detectAnomalies: protectedProcedure.query(async ({ ctx }) => {
    return AIService.detectAnomalies(ctx.user.id);
  }),

  financialAdvice: protectedProcedure.query(async ({ ctx }) => {
    return AIService.getFinancialAdvice(ctx.user.id);
  }),

  scanReceipt: protectedProcedure
    .input(scanReceiptSchema)
    .mutation(async ({ input }) => {
      return AIService.scanReceiptWithAI({
        extractedText: input.extractedText ?? null,
        imageUrl: input.imageUrl ?? null,
        categories: input.categories ?? null,
      });
    }),

  categorizeTransactions: protectedProcedure
    .input(categorizeTransactionsSchema)
    .mutation(async ({ input }) => {
      return AIService.categorizeTransactionsWithAI(
        input.transactions,
        input.categories,
      );
    }),
});
