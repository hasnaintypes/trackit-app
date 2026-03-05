import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { AIService } from "@/server/services/aiService";
import {
  spendingInsightsSchema,
  scanReceiptSchema,
  categorizeTransactionsSchema,
} from "@/validation/ai";
import { checkRateLimit, AI_MAX } from "@/server/api/rateLimit";

export const aiRouter = createTRPCRouter({
  budgetRecommendations: protectedProcedure.mutation(async ({ ctx }) => {
    const { allowed } = checkRateLimit(ctx.user.id, "ai", AI_MAX);
    if (!allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded. Try again in a minute.",
      });
    }
    return AIService.generateBudgetRecommendations(ctx.user.id);
  }),

  spendingInsights: protectedProcedure
    .input(spendingInsightsSchema)
    .mutation(async ({ ctx, input }) => {
      const { allowed } = checkRateLimit(ctx.user.id, "ai", AI_MAX);
      if (!allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Try again in a minute.",
        });
      }
      return AIService.generateSpendingInsights(ctx.user.id, input.period);
    }),

  detectAnomalies: protectedProcedure.mutation(async ({ ctx }) => {
    const { allowed } = checkRateLimit(ctx.user.id, "ai", AI_MAX);
    if (!allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded. Try again in a minute.",
      });
    }
    return AIService.detectAnomalies(ctx.user.id);
  }),

  financialAdvice: protectedProcedure.mutation(async ({ ctx }) => {
    const { allowed } = checkRateLimit(ctx.user.id, "ai", AI_MAX);
    if (!allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded. Try again in a minute.",
      });
    }
    return AIService.getFinancialAdvice(ctx.user.id);
  }),

  scanReceipt: protectedProcedure
    .input(scanReceiptSchema)
    .mutation(async ({ ctx, input }) => {
      const { allowed } = checkRateLimit(ctx.user.id, "ai", AI_MAX);
      if (!allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Try again in a minute.",
        });
      }
      return AIService.scanReceiptWithAI({
        extractedText: input.extractedText ?? null,
        imageUrl: input.imageUrl ?? null,
        categories: input.categories ?? null,
      });
    }),

  categorizeTransactions: protectedProcedure
    .input(categorizeTransactionsSchema)
    .mutation(async ({ ctx, input }) => {
      const { allowed } = checkRateLimit(ctx.user.id, "ai", AI_MAX);
      if (!allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Try again in a minute.",
        });
      }
      return AIService.categorizeTransactionsWithAI(
        input.transactions,
        input.categories,
      );
    }),
});
