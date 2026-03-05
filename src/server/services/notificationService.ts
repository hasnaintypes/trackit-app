import { db } from "@/server/db";
import { Prisma, type NotificationType } from "@prisma/client";
import { createLogger } from "@/lib/logging";

const logger = createLogger("notificationService");

export class NotificationService {
  static async createNotification(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Prisma.JsonValue;
  }) {
    const { userId, type, title, message, metadata } = params;

    // 1. Create in-app notification
    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: (metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });

    // 2. Queue Email if enabled in preferences
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true, notificationPrefs: true },
      });

      if (user?.email && user.notificationPrefs) {
        const prefs = user.notificationPrefs;
        let shouldEmail = false;

        switch (type) {
          case "BUDGET_ALERT":
            shouldEmail = prefs.emailBalanceAlerts;
            break;
          case "TRANSACTION_RECURRING":
            shouldEmail = prefs.emailTransactions;
            break;
          case "SYSTEM_ALERT":
            shouldEmail = prefs.emailSecurity; // Mapping system alerts to security/important
            break;
          default:
            shouldEmail = false;
        }

        if (shouldEmail) {
          const { enqueueEmail } = await import("@/lib/inngest/events");
          await enqueueEmail({
            to: user.email,
            subject: title,
            body: message, // In a real app, we'd use a template here
          });
        }
      }
    } catch (error) {
      logger.error("Failed to enqueue email notification", {
        error: error instanceof Error ? error.message : String(error),
      });
      // Silently fail so we don't break the main transaction flow
    }

    return notification;
  }

  static async markAsRead(notificationId: string, userId: string) {
    return db.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async getLatestNotifications(userId: string, limit = 10) {
    return db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  static async getUnreadCount(userId: string) {
    return db.notification.count({
      where: { userId, isRead: false },
    });
  }
}
