import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { BudgetService } from "@/server/services/budgetService";
import { createBudgetSchema, updateBudgetSchema } from "@/validation/budget";

export const budgetRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.budget.findMany({
      where: { userId: ctx.user.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(createBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const budget = await ctx.db.budget.create({
        data: {
          userId: ctx.user.id,
          categoryId: input.categoryId,
          amount: input.amount,
          period: input.period,
          startDate: input.startDate,
          endDate: input.endDate,
        },
      });

      // Initial evaluation
      await BudgetService.reevaluateBudget(budget.id);

      return budget;
    }),

  update: protectedProcedure
    .input(updateBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const budget = await ctx.db.budget.update({
        where: { id: input.id, userId: ctx.user.id },
        data: {
          amount: input.amount,
          period: input.period,
          startDate: input.startDate,
          endDate: input.endDate,
        },
      });

      // Re-evaluate on update
      await BudgetService.reevaluateBudget(budget.id);

      return budget;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.budget.delete({
        where: { id: input.id, userId: ctx.user.id },
      });
    }),

  reevaluate: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await BudgetService.reevaluateBudget(input.id);
      return { success: true };
    }),
});
