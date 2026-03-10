"use client";

import { createLogger } from "@/lib/logging";
import React, { useMemo, useState } from "react";

const logger = createLogger("overview-page");
import { api } from "@/trpc/react";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { StatsCards } from "@/components/pages/(protected)/overview/stats-cards";
import { RecentTransactions } from "@/components/pages/(protected)/overview/recent-transactions";
import { BarChart } from "@/components/charts/bar-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import type { ChartConfig } from "@/components/ui/chart";
import type { Transaction } from "@/types/transaction";

import { DefaultView } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSettings } from "@/hooks/use-settings";
import { useEffect } from "react";

import { useFormatter } from "@/hooks/use-formatter";

export default function OverviewPage() {
  const { formatAmount } = useFormatter();
  const router = useRouter();
  const { settings, isLoading: settingsLoading } = useSettings();

  useEffect(() => {
    if (!settingsLoading && settings?.display.defaultView) {
      const defaultView = settings.display.defaultView;
      if (defaultView === DefaultView.TRANSACTIONS) {
        router.replace("/transactions");
      } else if (defaultView === DefaultView.NETWORTH) {
        router.replace("/reports");
      } else if (defaultView === DefaultView.PORTFOLIO) {
        router.replace("/accounts");
      }
    }
  }, [settings, settingsLoading, router]);

  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { listQuery } = useTransactions();
  const { allFlat, categoryMap } = useCategories();

  const utils = api.useUtils();

  const [isTxFormOpen, setIsTxFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const { remove } = useTransactions();

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTxFormOpen(true);
  };

  const handleDeleteTransactions = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => remove.mutateAsync({ id })));
      await Promise.all([
        utils.transaction.list.invalidate(),
        utils.account.list.invalidate(),
      ]);
    } catch (err) {
      logger.error("Failed to delete transactions", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  // Fetch all transactions (no date filter) for overview stats
  const { data: txData, isLoading: txLoading } = listQuery({
    limit: 500,
  });

  const transactions = useMemo(
    () => txData?.transactions ?? [],
    [txData?.transactions],
  );

  // Compute stats with date ranges and percentage changes
  const statsData = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));

    // Total balance from accounts
    const totalBalance = accounts.reduce(
      (acc, curr) => acc + parseFloat(curr.balance),
      0,
    );

    // Find date range of all transactions
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;

    let totalIncome = 0;
    let totalExpense = 0;
    let currentMonthIncome = 0;
    let currentMonthExpense = 0;
    let prevMonthIncome = 0;
    let prevMonthExpense = 0;

    // Track earliest income/expense dates
    let earliestIncomeDate: Date | null = null;
    let earliestExpenseDate: Date | null = null;

    transactions.forEach((tx) => {
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
    });

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
        changePercent: calcChange(totalBalance, totalBalance - (currentMonthIncome - currentMonthExpense)),
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

  // Bar Chart Data — last 30 days of spending
  const barChartData = useMemo(() => {
    const buckets: Record<string, number> = {};
    const now = new Date();

    for (let i = 0; i < 30; i++) {
      const d = format(new Date(now.getTime() - i * 86400000), "MMM dd");
      buckets[d] = 0;
    }

    transactions.forEach((tx) => {
      if (tx.type === "DEBIT") {
        const label = format(new Date(tx.date), "MMM dd");
        if (buckets[label] !== undefined) {
          buckets[label] += Math.abs(parseFloat(tx.amount));
        }
      }
    });

    return Object.entries(buckets)
      .map(([date, amount]) => ({ date, amount }))
      .reverse();
  }, [transactions]);

  const barChartConfig = {
    amount: {
      label: "Expenses",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  // Pie Chart Data — category breakdown
  const pieChartData = useMemo(() => {
    const categories = allFlat.data ?? [];
    const categoriesMap: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (tx.type === "DEBIT") {
        const catName = tx.categoryId
          ? (categoryMap.get(tx.categoryId) ?? "Other")
          : "Uncategorized";
        categoriesMap[catName] =
          (categoriesMap[catName] ?? 0) + Math.abs(parseFloat(tx.amount));
      }
    });

    return Object.entries(categoriesMap).map(([name, value], index) => {
      const category = categories.find((c) => c.name === name);
      const fill = category?.color ?? `var(--chart-${(index % 5) + 1})`;
      return { name, value, fill };
    });
  }, [transactions, allFlat.data, categoryMap]);

  const pieChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    pieChartData.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      };
    });
    return config;
  }, [pieChartData]);

  return (
    <div className="space-y-8">
      <StatsCards
        balance={statsData.balance}
        income={statsData.income}
        spending={statsData.spending}
        isLoading={accountsLoading || txLoading}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <BarChart
              data={barChartData}
              config={barChartConfig}
              dataKey="amount"
              labelKey="date"
              className="h-[300px] w-full"
              valueFormatter={(val) => formatAmount(val)}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={pieChartData}
              config={pieChartConfig}
              dataKey="value"
              nameKey="name"
              className="mx-auto aspect-square max-h-[300px]"
              valueFormatter={(val) => formatAmount(val)}
            />
          </CardContent>
        </Card>
      </div>

      <RecentTransactions
        transactions={transactions}
        isLoading={txLoading}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransactions}
        onView={handleEditTransaction}
      />
    </div>
  );
}
