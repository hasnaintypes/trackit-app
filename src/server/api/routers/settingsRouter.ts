import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  updateNotificationsSchema,
  updateDisplaySchema,
  updateRegionalSchema,
} from "@/validation/settings";
import { toNum } from "@shared/decimal";

export const settingsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Fetch all related settings in parallel
    const [preferences, display, notifications] = await Promise.all([
      ctx.db.userPreferences.upsert({
        where: { userId },
        update: {},
        create: { userId },
      }),
      ctx.db.displaySettings.upsert({
        where: { userId },
        update: {},
        create: { userId },
      }),
      ctx.db.notificationPreferences.upsert({
        where: { userId },
        update: {},
        create: { userId },
      }),
    ]);

    // Convert Decimal fields to numbers so they serialize across RSC → Client boundary
    return {
      preferences,
      display,
      notifications: {
        ...notifications,
        lowBalanceThreshold: notifications.lowBalanceThreshold
          ? toNum(notifications.lowBalanceThreshold)
          : null,
        largeTransactionThreshold: notifications.largeTransactionThreshold
          ? toNum(notifications.largeTransactionThreshold)
          : null,
      },
    };
  }),

  updateNotifications: protectedProcedure
    .input(updateNotificationsSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.notificationPreferences.upsert({
        where: { userId: ctx.user.id },
        update: input,
        create: { userId: ctx.user.id, ...input },
      });
    }),

  completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.db.user.update({
      where: { id: ctx.user.id },
      data: { hasCompletedOnboarding: true },
    });
  }),

  updateDisplay: protectedProcedure
    .input(updateDisplaySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.displaySettings.upsert({
        where: { userId: ctx.user.id },
        update: input,
        create: { userId: ctx.user.id, ...input },
      });
    }),

  updateRegional: protectedProcedure
    .input(updateRegionalSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userPreferences.upsert({
        where: { userId: ctx.user.id },
        update: input,
        create: { userId: ctx.user.id, ...input },
      });
    }),
});
