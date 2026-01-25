import { db } from "@/server/db";
import { ReportType, ReportStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { startOfMonth, endOfMonth, format } from "date-fns";
import type { MonthlySummaryData, BudgetExceededData } from "@/types/report";

export class ReportService {
  /**
   * Generate a monthly summary report for a user
   */
  static async generateMonthlySummary(userId: string, period: string) {
    // period format: "2026-01"
    const [year, month] = period.split("-").map(Number);

    if (
      year === undefined ||
      month === undefined ||
      isNaN(year) ||
      isNaN(month)
    ) {
      throw new Error(`Invalid period format: ${period}. Expected YYYY-MM`);
    }

    const periodStart = startOfMonth(new Date(year, month - 1));
    const periodEnd = endOfMonth(new Date(year, month - 1));

    // Get all transactions for the period
    const transactions = await db.transaction.findMany({
      where: {
        userId,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        category: true,
      },
      orderBy: { date: "desc" },
    });

    // Calculate spending by category
    const categorySpending = transactions
      .filter((t) => t.type === "DEBIT")
      .reduce(
        (acc, t) => {
          const categoryName = t.category?.name ?? "Uncategorized";
          const amount =
            typeof t.amount === "object" && "toNumber" in t.amount
              ? t.amount.toNumber()
              : Number(t.amount);

          acc[categoryName] = (acc[categoryName] ?? 0) + amount;
          return acc;
        },
        {} as Record<string, number>,
      );

    // Get budget status
    const budgets = await db.budget.findMany({
      where: { userId },
      include: { category: true },
    });

    const budgetStatus = budgets.map((b) => ({
      category: b.category.name,
      limit:
        typeof b.amount === "object" && "toNumber" in b.amount
          ? b.amount.toNumber()
          : Number(b.amount),
      spent:
        typeof b.spentAmount === "object" && "toNumber" in b.spentAmount
          ? b.spentAmount.toNumber()
          : Number(b.spentAmount),
      percentage:
        ((typeof b.spentAmount === "object" && "toNumber" in b.spentAmount
          ? b.spentAmount.toNumber()
          : Number(b.spentAmount)) /
          (typeof b.amount === "object" && "toNumber" in b.amount
            ? b.amount.toNumber()
            : Number(b.amount))) *
        100,
    }));

    const totalIncome = transactions
      .filter((t) => t.type === "CREDIT")
      .reduce(
        (sum, t) =>
          sum +
          (typeof t.amount === "object" && "toNumber" in t.amount
            ? t.amount.toNumber()
            : Number(t.amount)),
        0,
      );

    const totalExpenses = transactions
      .filter((t) => t.type === "DEBIT")
      .reduce(
        (sum, t) =>
          sum +
          (typeof t.amount === "object" && "toNumber" in t.amount
            ? t.amount.toNumber()
            : Number(t.amount)),
        0,
      );

    const reportData: MonthlySummaryData = {
      period,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      categorySpending,
      budgetStatus,
      topCategories: Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, amount]) => ({ name, amount })),
    };

    // Create report record
    const report = await db.report.create({
      data: {
        userId,
        type: ReportType.MONTHLY_SUMMARY,
        period,
        status: ReportStatus.PENDING,
        data: reportData as unknown as Prisma.InputJsonValue,
      },
    });

    return { report, data: reportData };
  }

  /**
   * Generate a budget exceeded report
   */
  static async generateBudgetExceededReport(userId: string, budgetId: string) {
    const budget = await db.budget.findUnique({
      where: { id: budgetId },
      include: { category: true },
    });

    if (!budget || budget.userId !== userId) {
      throw new Error("Budget not found");
    }

    const spent =
      typeof budget.spentAmount === "object" && "toNumber" in budget.spentAmount
        ? budget.spentAmount.toNumber()
        : Number(budget.spentAmount);

    const limit =
      typeof budget.amount === "object" && "toNumber" in budget.amount
        ? budget.amount.toNumber()
        : Number(budget.amount);

    const reportData: BudgetExceededData = {
      budgetId: budget.id,
      categoryName: budget.category.name,
      limit,
      spent,
      exceeded: spent - limit,
      percentage: (spent / limit) * 100,
      period: format(new Date(), "yyyy-MM"),
    };

    const report = await db.report.create({
      data: {
        userId,
        type: ReportType.BUDGET_EXCEEDED,
        period: format(new Date(), "yyyy-MM"),
        status: ReportStatus.PENDING,
        data: reportData as unknown as Prisma.InputJsonValue,
      },
    });

    return { report, data: reportData };
  }

  /**
   * Get all reports for a user
   */
  static async getReports(
    userId: string,
    filters?: { type?: ReportType; limit?: number },
  ) {
    return db.report.findMany({
      where: {
        userId,
        ...(filters?.type && { type: filters.type }),
      },
      orderBy: { generatedAt: "desc" },
      take: filters?.limit ?? 50,
    });
  }

  /**
   * Mark a report as sent
   */
  static async markAsSent(reportId: string, emailSentTo: string) {
    return db.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.SENT,
        sentAt: new Date(),
        emailSentTo,
      },
    });
  }

  /**
   * Mark a report as failed
   */
  static async markAsFailed(reportId: string) {
    return db.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.FAILED,
      },
    });
  }
}
