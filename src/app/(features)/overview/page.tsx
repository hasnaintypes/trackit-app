"use client";

import React, { useMemo, useCallback, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { subMonths, format, startOfMonth, endOfMonth } from "date-fns";
import type { ChartConfig } from "@/components/ui/chart";
import type { Transaction } from "@/types/transaction";
import { DefaultView } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSettings } from "@/hooks/use-settings";
import { useEffect } from "react";
import { useFormatter } from "@/hooks/use-formatter";
import { CalendarDays } from "lucide-react";

const barChartConfig = {
  amount: {
    label: "Expenses",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type DateRange = "3" | "6" | "12";

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
];

export default function OverviewPage() {
  const { formatAmount } = useFormatter();
  const router = useRouter();
  const { settings, isLoading: settingsLoading } = useSettings();
  const [barRange, setBarRange] = useState<DateRange>("6");

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
  const { listQuery, remove } = useTransactions();
  const { allFlat, categoryMap } = useCategories();
  const utils = api.useUtils();

  const handleEditTransaction = useCallback((_transaction: Transaction) => {
    // TODO: wire up transaction edit dialog
  }, []);

  const handleDeleteTransactions = useCallback(
    async (ids: string[]) => {
      try {
        await Promise.all(ids.map((id) => remove.mutateAsync({ id })));
        await Promise.all([
          utils.transaction.list.invalidate(),
          utils.account.list.invalidate(),
          utils.budget.all.invalidate(),
        ]);
      } catch {
        // deletion errors are surfaced by the mutation's own error state
      }
    },
    [remove, utils.transaction.list, utils.account.list, utils.budget.all],
  );

  const { data: txData, isLoading: txLoading } = listQuery({ limit: 100 });

  const transactions = useMemo(
    () => txData?.transactions ?? [],
    [txData?.transactions],
  );

  const rangeMonths = parseInt(barRange);

  // Stats data: depends only on accounts and transactions
  const statsData = useMemo(() => {
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

  // Bar chart data: depends on transactions and rangeMonths
  const barChartData = useMemo(() => {
    const now = new Date();
    const barBucketKeys: string[] = [];
    const barBucketLookup: Record<string, number> = {};
    const barDisplayLabels: Record<string, string> = {};

    for (let i = rangeMonths - 1; i >= 0; i--) {
      const month = subMonths(now, i);
      const lookupKey = format(month, "yyyy-MM");
      const displayLabel = format(month, "MMM");
      barBucketKeys.push(lookupKey);
      barBucketLookup[lookupKey] = 0;
      barDisplayLabels[lookupKey] = displayLabel;
    }

    for (const tx of transactions) {
      if (tx.type === "DEBIT") {
        const amount = Math.abs(parseFloat(tx.amount));
        const barKey = format(new Date(tx.date), "yyyy-MM");
        if (barKey in barBucketLookup) {
          barBucketLookup[barKey]! += amount;
        }
      }
    }

    return barBucketKeys.map((key) => ({
      date: barDisplayLabels[key]!,
      amount: barBucketLookup[key]!,
    }));
  }, [transactions, rangeMonths]);

  // Pie chart data: depends on transactions, categoryMap, and category list
  const pieChartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    for (const tx of transactions) {
      if (tx.type === "DEBIT") {
        const amount = Math.abs(parseFloat(tx.amount));
        const catName = tx.categoryId
          ? (categoryMap.get(tx.categoryId) ?? "Other")
          : "Uncategorized";
        categoryTotals[catName] = (categoryTotals[catName] ?? 0) + amount;
      }
    }

    const categories = allFlat.data ?? [];
    return Object.entries(categoryTotals).map(([name, value], index) => {
      const category = categories.find((c) => c.name === name);
      const fill = category?.color ?? `var(--chart-${(index % 5) + 1})`;
      return { name, value, fill };
    });
  }, [transactions, categoryMap, allFlat.data]);

  const pieChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    for (const item of pieChartData) {
      config[item.name] = { label: item.name, color: item.fill };
    }
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Spending Overview</CardTitle>
            <Select
              value={barRange}
              onValueChange={(v) => setBarRange(v as DateRange)}
            >
              <SelectTrigger className="h-8 w-auto gap-1.5 rounded-lg px-3 text-xs">
                <CalendarDays className="size-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
