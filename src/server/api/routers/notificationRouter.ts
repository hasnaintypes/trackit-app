import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { NotificationService } from "@/server/services/notificationService";
import {
  getLatestNotificationsSchema,
  markAsReadSchema,
} from "@/validation/notification";

export const notificationRouter = createTRPCRouter({
  getLatest: protectedProcedure
    .input(getLatestNotificationsSchema)
    .query(async ({ ctx, input }) => {
      return NotificationService.getLatestNotifications(
        ctx.user.id,
        input.limit,
      );
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    return NotificationService.getUnreadCount(ctx.user.id);
  }),

  markAsRead: protectedProcedure
    .input(markAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      return NotificationService.markAsRead(input.id, ctx.user.id);
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    return NotificationService.markAllAsRead(ctx.user.id);
  }),
});
