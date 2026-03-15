import { db } from "@/server/db";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { NotificationService } from "./notificationService";
import { NotificationType, type BudgetPeriod } from "@prisma/client";
import { toNum } from "@/lib/shared/decimal";

export class BudgetService {
  /**
   * Evaluates budgets associated with a category (or its parent) based on a new transaction.
   * Note: This always evaluates for the CURRENT time to keep the dashboard "spentAmount" cache fresh for the user's current view.
   */
  static async evaluateBudgets(params: {
    userId: string;
    categoryId: string;
    date: Date;
  }) {
    const { userId, categoryId } = params;

    // 1. Find the category and its parent to support rollup
    const category = await db.category.findUnique({
      where: { id: categoryId },
      include: { parent: true },
    });

    if (!category || category.userId !== userId) return;

    // 2. Identify relevant budgets (on this category OR its parent)
    const budgetIds = await db.budget.findMany({
      where: {
        userId,
        OR: [
          { categoryId: category.id },
          category.parentCategoryId
            ? { categoryId: category.parentCategoryId }
            : {},
        ],
      },
      select: { id: true },
    });

    // 3. Trigger evaluation for each relevant budget in parallel
    await Promise.all(budgetIds.map((b) => this.reevaluateBudget(b.id)));
  }

  /**
   * Recalculates spent amount for a specific budget and triggers alerts.
   * Always calculates for the CURRENT active period (Now).
   */
  static async reevaluateBudget(budgetId: string) {
    const budget = await db.budget.findUnique({
      where: { id: budgetId },
      include: { category: { include: { children: true } } },
    });

    if (!budget) return;

    // Calculate current period window based on TODAY
    const now = new Date();
    const { start, end, periodKey } = this.getBudgetWindow(
      budget.period,
      now,
      budget.startDate,
      budget.endDate,
    );

    // Get all relevant category IDs (including subcategories if budget is on parent)
    const categoryIds = [
      budget.categoryId,
      ...budget.category.children.map((c) => c.id),
    ];

    // Calculate sum of expenses
    const aggregate = await db.transaction.aggregate({
      where: {
        userId: budget.userId,
        categoryId: { in: categoryIds },
        type: "DEBIT", // Expenses only
        date: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const spent = toNum(aggregate._sum.amount);

    // Update budget spentAmount cache
    await db.budget.update({
      where: { id: budgetId },
      data: { spentAmount: spent },
    });

    // Threshold checks — pass the already-loaded budget to avoid a redundant fetch
    await this.checkThresholds(budget, spent, toNum(budget.amount), periodKey);
  }

  /**
   * Helper to determine start/end dates and unique key for various budget periods.
   */
  private static getBudgetWindow(
    period: BudgetPeriod,
    referenceDate: Date,
    startDate: Date,
    endDate?: Date | null,
  ) {
    let start: Date, end: Date, periodKey: string;

    switch (period) {
      case "WEEKLY":
        // Week starting Sunday (default common) - can be adjusted if UserPreferences were available here
        start = startOfWeek(referenceDate);
        end = endOfWeek(referenceDate);
        periodKey = format(start, "yyyy-'W'ww");
        break;

      case "MONTHLY":
        start = startOfMonth(referenceDate);
        end = endOfMonth(referenceDate);
        periodKey = format(start, "yyyy-MM");
        break;

      case "YEARLY":
        start = startOfYear(referenceDate);
        end = endOfYear(referenceDate);
        periodKey = format(start, "yyyy");
        break;

      case "DAILY":
        start = new Date(referenceDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(referenceDate);
        end.setHours(23, 59, 59, 999);
        periodKey = format(start, "yyyy-MM-dd");
        break;

      case "CUSTOM":
      default:
        if (endDate) {
          start = startDate;
          end = endDate;
          periodKey = `custom-${startDate.getTime()}-${end.getTime()}`;
        } else {
          // Fallback to monthly
          start = startOfMonth(referenceDate);
          end = endOfMonth(referenceDate);
          periodKey = format(start, "yyyy-MM");
        }
        break;
    }

    return { start, end, periodKey };
  }

  private static async checkThresholds(
    budget: NonNullable<Awaited<ReturnType<typeof db.budget.findUnique>>>,
    spent: number,
    total: number,
    periodKey: string,
  ) {
    const budgetId = budget.id;

    // Atomically reset flags if period changed
    if (budget.last_alert_period !== periodKey) {
      const resetResult = await db.budget.updateMany({
        where: { id: budgetId, last_alert_period: { not: periodKey } },
        data: {
          last_alert_period: periodKey,
          threshold_70_alert_sent: false,
          threshold_90_alert_sent: false,
          threshold_100_alert_sent: false,
        },
      });
      if (resetResult.count > 0) {
        budget.threshold_70_alert_sent = false;
        budget.threshold_90_alert_sent = false;
        budget.threshold_100_alert_sent = false;
      }
    }

    if (total <= 0) return;
    const percent = (spent / total) * 100;

    const thresholds = [
      {
        level: 100,
        flag: "threshold_100_alert_sent" as const,
        title: "Budget Limit Reached",
      },
      {
        level: 90,
        flag: "threshold_90_alert_sent" as const,
        title: "Budget Warning (90%)",
      },
      {
        level: 70,
        flag: "threshold_70_alert_sent" as const,
        title: "Budget Alert (70%)",
      },
    ];

    for (const t of thresholds) {
      if (percent >= t.level) {
        // Atomically set the flag only if not already set
        const updated = await db.budget.updateMany({
          where: { id: budgetId, [t.flag]: false },
          data: { [t.flag]: true },
        });
        // If count is 0, another process already handled this threshold
        if (updated.count === 0) continue;

        // Send Notification
        await NotificationService.createNotification({
          userId: budget.userId,
          type: NotificationType.BUDGET_ALERT,
          title: t.title,
          message: `You have spent ${percent.toFixed(1)}% of your ${toNum(budget.amount).toFixed(2)} budget for this period (${periodKey}).`,
          metadata: { budgetId: budget.id },
        });

        // Emit event for email worker
        const { inngest } = await import("@/lib/inngest/client");
        const { BUDGET_THRESHOLD_REACHED_EVENT } = await import(
          "@/lib/inngest/events"
        );
        await inngest.send({
          name: BUDGET_THRESHOLD_REACHED_EVENT,
          data: {
            budgetId: budget.id,
            userId: budget.userId,
            threshold: t.level,
          },
        });

        break; // Only fire the highest crossed threshold at a time
      }
    }
  }

  /**
   * Check if a single transaction exceeds the user's "Large Transaction" threshold
   */
  static async checkLargeTransaction(
    userId: string,
    amount: number,
    description: string,
  ) {
    const prefs = await db.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!prefs?.largeTransactionThreshold || !prefs.emailLargeTransactions)
      return;

    const threshold = toNum(prefs.largeTransactionThreshold);
    if (amount >= threshold) {
      await NotificationService.createNotification({
        userId,
        type: NotificationType.SYSTEM_ALERT,
        title: "Large Transaction Detected",
        message: `A transaction for ${amount.toFixed(2)} (${description}) exceeds your set threshold of ${threshold.toFixed(2)}.`,
      });
    }
  }

  /**
   * Check if an account balance has fallen below the user's "Low Balance" threshold
   */
  static async checkLowBalance(userId: string, accountId: string) {
    const [prefs, account] = await Promise.all([
      db.notificationPreferences.findUnique({ where: { userId } }),
      db.bankAccount.findUnique({ where: { id: accountId } }),
    ]);

    if (!prefs?.lowBalanceThreshold || !prefs.emailLowBalanceAlerts || !account)
      return;

    const threshold = toNum(prefs.lowBalanceThreshold);
    const balance = toNum(account.balance);

    if (balance <= threshold) {
      await NotificationService.createNotification({
        userId,
        type: NotificationType.BUDGET_ALERT,
        title: "Low Balance Warning",
        message: `Your account "${account.name}" balance of ${balance.toFixed(2)} is below your threshold of ${threshold.toFixed(2)}.`,
        metadata: { accountId },
      });
    }
  }
}
