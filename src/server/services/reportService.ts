import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { ReportType, ReportStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { startOfMonth, endOfMonth, format } from "date-fns";
import type { MonthlySummaryData, BudgetExceededData } from "@/types/report";
import { toNum } from "@/lib/shared/decimal";

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
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Invalid period format: ${period}. Expected YYYY-MM`,
      });
    }

    const periodStart = startOfMonth(new Date(year, month - 1));
    const periodEnd = endOfMonth(new Date(year, month - 1));

    const where: Prisma.TransactionWhereInput = {
      userId,
      date: {
        gte: periodStart,
        lte: periodEnd,
      },
    };

    const [categoryGroups, incomeAgg, expenseAgg, transactionCount, budgets] =
      await Promise.all([
        db.transaction.groupBy({
          by: ["categoryId"],
          where: { ...where, type: "DEBIT" },
          _sum: { amount: true },
        }),
        db.transaction.aggregate({
          where: { ...where, type: "CREDIT" },
          _sum: { amount: true },
        }),
        db.transaction.aggregate({
          where: { ...where, type: "DEBIT" },
          _sum: { amount: true },
        }),
        db.transaction.count({ where }),
        db.budget.findMany({
          where: { userId },
          select: {
            amount: true,
            spentAmount: true,
            category: { select: { name: true } },
          },
        }),
      ]);

    const categoryIds = categoryGroups
      .map((g) => g.categoryId)
      .filter((id): id is string => id !== null);

    const categories =
      categoryIds.length > 0
        ? await db.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true },
          })
        : [];

    const categoryNameMap = new Map(categories.map((c) => [c.id, c.name]));

    const categorySpending: Record<string, number> = {};
    for (const group of categoryGroups) {
      const name = group.categoryId
        ? (categoryNameMap.get(group.categoryId) ?? "Uncategorized")
        : "Uncategorized";
      categorySpending[name] =
        (categorySpending[name] ?? 0) + toNum(group._sum.amount);
    }

    const budgetStatus = budgets.map((b) => ({
      category: b.category.name,
      limit: toNum(b.amount),
      spent: toNum(b.spentAmount),
      percentage: (toNum(b.spentAmount) / toNum(b.amount)) * 100,
    }));

    const totalIncome = toNum(incomeAgg._sum.amount);
    const totalExpenses = toNum(expenseAgg._sum.amount);

    const reportData: MonthlySummaryData = {
      period,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      transactionCount,
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
      select: {
        id: true,
        userId: true,
        amount: true,
        spentAmount: true,
        category: { select: { name: true } },
      },
    });

    if (budget?.userId !== userId) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
    }

    const spent = toNum(budget.spentAmount);
    const limit = toNum(budget.amount);

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
      select: {
        id: true,
        userId: true,
        type: true,
        period: true,
        status: true,
        data: true,
        generatedAt: true,
        sentAt: true,
        emailSentTo: true,
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
