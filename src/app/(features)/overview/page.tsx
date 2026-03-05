"use client";

import React, { useMemo, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { api } from "@/trpc/react";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { OverviewHeader } from "@/components/pages/(protected)/overview/overview-header";
import { StatsCards } from "@/components/pages/(protected)/overview/stats-cards";
import { RecentTransactions } from "@/components/pages/(protected)/overview/recent-transactions";
import { BarChart } from "@/components/charts/bar-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionForm from "@/components/forms/transaction/transaction-form";
import { subDays, subMonths, format, startOfDay, startOfHour } from "date-fns";
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

  // Use effect for redirect logic to avoid "flash" if possible,
  // or at least handle it before data loads
  useEffect(() => {
    if (!settingsLoading && settings?.display.defaultView) {
      const defaultView = settings.display.defaultView;
      if (defaultView === DefaultView.TRANSACTIONS) {
        router.replace("/transactions");
      } else if (defaultView === DefaultView.NETWORTH) {
        router.replace("/reports"); // Assuming net worth is in reports
      } else if (defaultView === DefaultView.PORTFOLIO) {
        router.replace("/accounts"); // Fallback or portfolio if exists
      }
    }
  }, [settings, settingsLoading, router]);

  const { user } = useUser();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { listQuery } = useTransactions();
  const { allFlat, categoryMap } = useCategories();

  const utils = api.useUtils();

  const [period, setPeriod] = useState("last30");
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
      // Invalidate both transactions and accounts so stats update immediately
      await Promise.all([
        utils.transaction.list.invalidate(),
        utils.account.list.invalidate(),
      ]);
    } catch (err) {
      console.error("Failed to delete transactions:", err);
    }
  };

  // Calculate date range based on period - stabilize with startOfHour
  const dateRange = useMemo(() => {
    const end = startOfHour(new Date());
    let start;
    switch (period) {
      case "last7":
        start = startOfDay(subDays(new Date(), 7));
        break;
      case "last30":
        start = startOfDay(subDays(new Date(), 30));
        break;
      case "last90":
        start = startOfDay(subDays(new Date(), 90));
        break;
      case "year":
        start = startOfDay(subDays(new Date(), 365));
        break;
      default:
        start = startOfDay(subDays(new Date(), 30));
    }
    return { start, end };
  }, [period]);

  // Fetch transactions for the selected period
  const { data: txData, isLoading: txLoading } = listQuery({
    startDate: dateRange.start.toISOString(),
    endDate: dateRange.end.toISOString(),
    limit: 100, // Reasonable limit for dashboard stats/charts
  });

  const transactions = useMemo(
    () => txData?.transactions ?? [],
    [txData?.transactions],
  );

  // 1. Calculate Stats
  const stats = useMemo(() => {
    const totalBalance = accounts.reduce(
      (acc, curr) => acc + parseFloat(curr.balance),
      0,
    );

    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      const amount = Math.abs(parseFloat(tx.amount));
      if (tx.type === "CREDIT") {
        income += amount;
      } else if (tx.type === "DEBIT") {
        expense += amount;
      }
    });

    return {
      totalBalance: totalBalance.toString(),
      totalIncome: income.toString(),
      totalExpense: expense.toString(),
    };
  }, [accounts, transactions]);

  // 2. Prepare Bar Chart Data (Daily breakdown)
  const barChartData = useMemo(() => {
    const buckets: Record<string, number> = {};
    const isYear = period === "year";

    // Initialize buckets based on period
    if (isYear) {
      for (let i = 0; i < 12; i++) {
        const d = format(subMonths(new Date(), i), "MMM yyyy");
        buckets[d] = 0;
      }
    } else {
      const daysCount = period === "last7" ? 7 : period === "last90" ? 90 : 30;
      for (let i = 0; i < daysCount; i++) {
        const d = format(subDays(new Date(), i), "MMM dd");
        buckets[d] = 0;
      }
    }

    transactions.forEach((tx) => {
      if (tx.type === "DEBIT") {
        const date = new Date(tx.date);
        const label = isYear
          ? format(date, "MMM yyyy")
          : format(date, "MMM dd");

        if (buckets[label] !== undefined) {
          buckets[label] += Math.abs(parseFloat(tx.amount));
        }
      }
    });

    return Object.entries(buckets)
      .map(([date, amount]) => ({ date, amount }))
      .reverse();
  }, [transactions, period]);

  const barChartConfig = {
    amount: {
      label: "Expenses",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  // 3. Prepare Pie Chart Data (Category breakdown)
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
      // Find the category object to get its mapped color
      const category = categories.find((c) => c.name === name);
      const fill = category?.color ?? `var(--chart-${(index % 5) + 1})`;

      return {
        name,
        value,
        fill,
      };
    });
  }, [transactions, allFlat.data, categoryMap]);

  const pieChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    pieChartData.forEach((item, _index) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      };
    });
    return config;
  }, [pieChartData]);

  return (
    <div className="container mx-auto max-w-7xl flex-1 space-y-8 px-4 py-8 pt-6 sm:px-6 lg:px-8">
      <OverviewHeader
        userName={user?.name}
        period={period}
        onPeriodChange={setPeriod}
        onAddTransaction={() => setIsTxFormOpen(true)}
      />

      <StatsCards
        totalBalance={stats.totalBalance}
        totalIncome={stats.totalIncome}
        totalExpense={stats.totalExpense}
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

      <TransactionForm
        open={isTxFormOpen}
        onOpenChange={(open) => {
          setIsTxFormOpen(open);
          if (!open) setSelectedTransaction(null);
        }}
        initialValues={
          selectedTransaction
            ? {
                ...selectedTransaction,
                paymentMethod: selectedTransaction.paymentMethod ?? undefined,
                categoryId: selectedTransaction.categoryId ?? undefined,
                notes: selectedTransaction.notes ?? undefined,
                description: selectedTransaction.description ?? undefined,
                receipt_url: selectedTransaction.receipt_url ?? undefined,
              }
            : null
        }
      />
    </div>
  );
}
