"use client";

import React, { useMemo } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { AreaChart } from "@/components/charts/area-chart";
import { PieChart } from "@/components/charts/pie-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import { format } from "date-fns";
import { useFormatter } from "@/hooks/use-formatter";
import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AnalyticsPage() {
  const { formatAmount } = useFormatter();
  const { listQuery } = useTransactions();
  const { allFlat, categoryMap } = useCategories();

  const { data: txData } = listQuery({ limit: 500 });
  const transactions = useMemo(
    () => txData?.transactions ?? [],
    [txData?.transactions],
  );

  // Totals
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((tx) => {
      const amt = Math.abs(parseFloat(tx.amount));
      if (tx.type === "CREDIT") income += amt;
      else if (tx.type === "DEBIT") expense += amt;
    });
    return { income, expense, net: income - expense };
  }, [transactions]);

  // Area chart — daily income vs expense
  const areaChartData = useMemo(() => {
    const buckets: Record<
      string,
      { date: string; income: number; expense: number }
    > = {};
    transactions.forEach((tx) => {
      const amt = Math.abs(parseFloat(tx.amount));
      const label = format(new Date(tx.date), "MMM dd");
      buckets[label] ??= { date: label, income: 0, expense: 0 };
      if (tx.type === "CREDIT") buckets[label].income += amt;
      else if (tx.type === "DEBIT") buckets[label].expense += amt;
    });
    return Object.values(buckets).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [transactions]);

  const areaConfig = {
    income: { label: "Income", color: "#3b82f6" },
    expense: { label: "Expense", color: "#06b6d4" },
  } satisfies ChartConfig;

  // Pie chart — spending by category
  const pieChartData = useMemo(() => {
    const categories = allFlat.data ?? [];
    const map: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.type === "DEBIT") {
        const catName = tx.categoryId
          ? (categoryMap.get(tx.categoryId) ?? "Other")
          : "Uncategorized";
        map[catName] = (map[catName] ?? 0) + Math.abs(parseFloat(tx.amount));
      }
    });
    return Object.entries(map).map(([name, value], index) => {
      const cat = categories.find((c) => c.name === name);
      const fill = cat?.color ?? `var(--chart-${(index % 5) + 1})`;
      return { name, value, fill };
    });
  }, [transactions, allFlat.data, categoryMap]);

  const pieConfig = useMemo(() => {
    const config: ChartConfig = {};
    pieChartData.forEach((item) => {
      config[item.name] = { label: item.name, color: item.fill };
    });
    return config;
  }, [pieChartData]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Visualize your income, expenses, and spending patterns
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Net Balance</p>
              <p className="text-xl font-bold">{formatAmount(totals.net)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Income</p>
              <p className="text-xl font-bold">{formatAmount(totals.income)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-400">
              <ArrowDownRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Expenses</p>
              <p className="text-xl font-bold">
                {formatAmount(totals.expense)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={areaChartData}
              config={areaConfig}
              dataKeyIncome="income"
              dataKeyExpense="expense"
              labelKey="date"
              className="h-[350px] w-full"
              valueFormatter={(val) => formatAmount(val)}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={pieChartData}
              config={pieConfig}
              dataKey="value"
              nameKey="name"
              className="mx-auto aspect-square max-h-[350px]"
              valueFormatter={(val) => formatAmount(val)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
