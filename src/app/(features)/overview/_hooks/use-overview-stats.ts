import { useMemo } from "react";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import type { ApiBankAccount } from "@/types/account";
import type { Transaction } from "@/types/transaction";

interface StatCard {
  title: string;
  dateRange: string;
  value: string;
  changePercent: number | null;
  changeLabel: string;
}

export interface OverviewStats {
  balance: StatCard;
  income: StatCard;
  spending: StatCard;
}

export function useOverviewStats(
  accounts: ApiBankAccount[],
  transactions: Transaction[],
): OverviewStats {
  return useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));

    const totalBalance = accounts.reduce(
      (acc, curr) => acc + parseFloat(curr.balance),
      0,
    );
    let totalIncome = 0;
    let totalExpense = 0;
    let currentMonthIncome = 0;
    let currentMonthExpense = 0;
    let prevMonthIncome = 0;
    let prevMonthExpense = 0;
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;
    let earliestIncomeDate: Date | null = null;
    let earliestExpenseDate: Date | null = null;

    for (const tx of transactions) {
      const amount = Math.abs(parseFloat(tx.amount));
      const txDate = new Date(tx.date);

      if (!earliestDate || txDate < earliestDate) earliestDate = txDate;
      if (!latestDate || txDate > latestDate) latestDate = txDate;

      if (tx.type === "CREDIT") {
        totalIncome += amount;
        if (!earliestIncomeDate || txDate < earliestIncomeDate)
          earliestIncomeDate = txDate;
        if (txDate >= currentMonthStart && txDate <= currentMonthEnd)
          currentMonthIncome += amount;
        if (txDate >= prevMonthStart && txDate <= prevMonthEnd)
          prevMonthIncome += amount;
      } else if (tx.type === "DEBIT") {
        totalExpense += amount;
        if (!earliestExpenseDate || txDate < earliestExpenseDate)
          earliestExpenseDate = txDate;
        if (txDate >= currentMonthStart && txDate <= currentMonthEnd)
          currentMonthExpense += amount;
        if (txDate >= prevMonthStart && txDate <= prevMonthEnd)
          prevMonthExpense += amount;
      }
    }

    const formatDateRange = (start: Date | null, end: Date | null) => {
      if (!start) return "No data yet";
      const endDate = end ?? now;
      return `${format(start, "d MMM")} - ${format(endDate, "d MMM yyyy")}`;
    };

    const calcChange = (current: number, previous: number): number | null => {
      if (previous === 0) return current > 0 ? 100 : null;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      balance: {
        title: "Total Balance",
        dateRange: formatDateRange(earliestDate, latestDate),
        value: totalBalance.toString(),
        changePercent: calcChange(
          totalBalance,
          totalBalance - (currentMonthIncome - currentMonthExpense),
        ),
        changeLabel: "Last Month",
      },
      income: {
        title: "Total Income",
        dateRange: formatDateRange(earliestIncomeDate, latestDate),
        value: totalIncome.toString(),
        changePercent: calcChange(currentMonthIncome, prevMonthIncome),
        changeLabel: "Last Month",
      },
      spending: {
        title: "Total Spending",
        dateRange: formatDateRange(earliestExpenseDate, latestDate),
        value: totalExpense.toString(),
        changePercent: calcChange(currentMonthExpense, prevMonthExpense),
        changeLabel: "Last Month",
      },
    };
  }, [accounts, transactions]);
}
