import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { toNum } from "@shared/decimal";
import { SplitService } from "@/server/services/splitService";

export const overviewRouter = createTRPCRouter({
  /**
   * Server-side stats: total balance, income, expense, date ranges, % changes.
   */
  stats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = ctx.db;

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));

    // Total balance from all bank accounts
    const balanceAgg = await db.bankAccount.aggregate({
      where: { userId },
      _sum: { balance: true },
    });
    const totalBalance = toNum(balanceAgg._sum.balance);

    // All-time income and expense totals + earliest dates
    const [allTimeIncome, allTimeExpense] = await Promise.all([
      db.transaction.aggregate({
        where: { userId, type: "CREDIT" },
        _sum: { amount: true },
        _min: { date: true },
        _max: { date: true },
      }),
      db.transaction.aggregate({
        where: { userId, type: "DEBIT" },
        _sum: { amount: true },
        _min: { date: true },
        _max: { date: true },
      }),
    ]);

    // Current and previous month income/expense
    const [curMonthIncome, curMonthExpense, prevMonthIncome, prevMonthExpense] =
      await Promise.all([
        db.transaction.aggregate({
          where: {
            userId,
            type: "CREDIT",
            date: { gte: currentMonthStart, lte: currentMonthEnd },
          },
          _sum: { amount: true },
        }),
        db.transaction.aggregate({
          where: {
            userId,
            type: "DEBIT",
            date: { gte: currentMonthStart, lte: currentMonthEnd },
          },
          _sum: { amount: true },
        }),
        db.transaction.aggregate({
          where: {
            userId,
            type: "CREDIT",
            date: { gte: prevMonthStart, lte: prevMonthEnd },
          },
          _sum: { amount: true },
        }),
        db.transaction.aggregate({
          where: {
            userId,
            type: "DEBIT",
            date: { gte: prevMonthStart, lte: prevMonthEnd },
          },
          _sum: { amount: true },
        }),
      ]);

    const totalIncome = toNum(allTimeIncome._sum.amount);
    const totalExpense = toNum(allTimeExpense._sum.amount);

    const formatDateRange = (minDate: Date | null, maxDate: Date | null) => {
      if (!minDate) return "No data yet";
      const end = maxDate ?? now;
      return `${format(minDate, "d MMM")} - ${format(end, "d MMM yyyy")}`;
    };

    const calcChange = (current: number, previous: number): number | null => {
      if (previous === 0) return current > 0 ? 100 : null;
      return Math.round(((current - previous) / previous) * 100);
    };

    const curIncome = toNum(curMonthIncome._sum.amount);
    const curExpense = toNum(curMonthExpense._sum.amount);
    const prevInc = toNum(prevMonthIncome._sum.amount);
    const prevExp = toNum(prevMonthExpense._sum.amount);

    // Earliest and latest across all transactions
    const earliestDate =
      allTimeIncome._min.date && allTimeExpense._min.date
        ? allTimeIncome._min.date < allTimeExpense._min.date
          ? allTimeIncome._min.date
          : allTimeExpense._min.date
        : (allTimeIncome._min.date ?? allTimeExpense._min.date);
    const latestDate =
      allTimeIncome._max.date && allTimeExpense._max.date
        ? allTimeIncome._max.date > allTimeExpense._max.date
          ? allTimeIncome._max.date
          : allTimeExpense._max.date
        : (allTimeIncome._max.date ?? allTimeExpense._max.date);

    return {
      balance: {
        title: "Total Balance",
        dateRange: formatDateRange(earliestDate, latestDate),
        value: totalBalance.toString(),
        changePercent: calcChange(
          totalBalance,
          totalBalance - (curIncome - curExpense),
        ),
        changeLabel: "Last Month",
      },
      income: {
        title: "Total Income",
        dateRange: formatDateRange(allTimeIncome._min.date, latestDate),
        value: totalIncome.toString(),
        changePercent: calcChange(curIncome, prevInc),
        changeLabel: "Last Month",
      },
      spending: {
        title: "Total Spending",
        dateRange: formatDateRange(allTimeExpense._min.date, latestDate),
        value: totalExpense.toString(),
        changePercent: calcChange(curExpense, prevExp),
        changeLabel: "Last Month",
      },
    };
  }),

  /**
   * Monthly income + expense totals for the area chart.
   */
  balanceOverview: protectedProcedure
    .input(
      z
        .object({ months: z.number().min(1).max(24).default(6) })
        .default(() => ({ months: 6 })),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = ctx.db;
      const monthsBack = input.months;

      const startDate = startOfMonth(subMonths(new Date(), monthsBack - 1));

      // Pre-fill all months so months with zero transactions still appear
      const monthlyMap = new Map<
        string,
        { month: string; year: number; income: number; expense: number }
      >();

      for (let i = 0; i < monthsBack; i++) {
        const d = subMonths(new Date(), monthsBack - 1 - i);
        const key = format(d, "yyyy-MM");
        monthlyMap.set(key, {
          month: format(d, "MMM"),
          year: d.getFullYear(),
          income: 0,
          expense: 0,
        });
      }

      // Fetch transactions with minimal select and aggregate in JS
      const transactions = await db.transaction.findMany({
        where: { userId, date: { gte: startDate } },
        select: { date: true, type: true, amount: true },
      });

      for (const tx of transactions) {
        const key = format(tx.date, "yyyy-MM");
        const bucket = monthlyMap.get(key);
        if (bucket) {
          const amt = Math.abs(toNum(tx.amount));
          if (tx.type === "CREDIT") {
            bucket.income += amt;
          } else if (tx.type === "DEBIT") {
            bucket.expense += amt;
          }
        }
      }

      return Array.from(monthlyMap.values());
    }),

  /**
   * Category spending breakdown for the radial chart.
   */
  spendingBreakdown: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = ctx.db;
    const now = new Date();

    // Weekly, monthly, yearly spending totals
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = startOfMonth(now);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [weeklyAgg, monthlyAgg, yearlyAgg] = await Promise.all([
      db.transaction.aggregate({
        where: { userId, type: "DEBIT", date: { gte: weekAgo } },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { userId, type: "DEBIT", date: { gte: monthStart } },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { userId, type: "DEBIT", date: { gte: yearStart } },
        _sum: { amount: true },
      }),
    ]);

    // Category breakdown — all-time DEBIT transactions grouped by category
    const categorySpending = await db.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: "DEBIT" },
      _sum: { amount: true },
    });

    // Fetch category details for the ones that have spending
    const categoryIds = categorySpending
      .map((c) => c.categoryId)
      .filter((id): id is string => id !== null);

    const categories =
      categoryIds.length > 0
        ? await db.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true, color: true },
          })
        : [];

    const categoryLookup = new Map(categories.map((c) => [c.id, c]));

    const totalSpending = categorySpending.reduce(
      (sum, c) => sum + Math.abs(toNum(c._sum.amount)),
      0,
    );

    const breakdown = categorySpending
      .map((c) => {
        const amount = Math.abs(toNum(c._sum.amount));
        const cat = c.categoryId ? categoryLookup.get(c.categoryId) : null;
        return {
          name: cat?.name ?? "Uncategorized",
          color: cat?.color ?? null,
          amount,
          percentage:
            totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return {
      weekly: toNum(weeklyAgg._sum.amount),
      monthly: toNum(monthlyAgg._sum.amount),
      yearly: toNum(yearlyAgg._sum.amount),
      total: totalSpending,
      categories: breakdown,
    };
  }),

  splitSummary: protectedProcedure.query(async ({ ctx }) => {
    const groups = await ctx.db.group.findMany({
      where: { userId: ctx.user.id, isArchived: false },
      select: { id: true },
    });

    let youOwe = 0;
    let youAreOwed = 0;

    for (const group of groups) {
      const balances = await SplitService.calculateGroupBalances(
        group.id,
        ctx.user.id,
        ctx.db,
      );
      const selfBalance = balances.get("self") ?? 0;

      if (selfBalance < 0) {
        youOwe += Math.abs(selfBalance);
      } else if (selfBalance > 0) {
        youAreOwed += selfBalance;
      }
    }

    return {
      youOwe: Math.round(youOwe * 100) / 100,
      youAreOwed: Math.round(youAreOwed * 100) / 100,
      unsettledGroups: groups.length,
    };
  }),
});
