"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { AreaChart } from "@/components/charts/area-chart";
import { type ChartConfig } from "@/components/ui/chart";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface TransactionsAnalyticsProps {
  chartData: { date: string; income: number; expense: number }[];
  chartConfig: ChartConfig;
}

export function TransactionsAnalytics({
  chartData,
  chartConfig,
}: TransactionsAnalyticsProps) {
  // 1. Calculate totals dynamically so the UI isn't fake
  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, curr) => ({
        income: acc.income + curr.income,
        expense: acc.expense + curr.expense,
      }),
      { income: 0, expense: 0 },
    );
  }, [chartData]);

  const netBalance = totals.income - totals.expense;

  return (
    <Card className="border-border/50 bg-card/50 overflow-hidden shadow-sm backdrop-blur-sm">
      {/* Header Section */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">
            Financial Overview
          </CardTitle>
          <CardDescription>Income vs Expenses over time</CardDescription>
        </div>
        {/* Optional: Add a simple time range badge or dropdown here */}
        <div className="bg-secondary text-secondary-foreground border-border/50 hidden rounded-full border px-3 py-1 text-xs font-medium sm:block">
          Last 30 Days
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-4">
        {/* Metric Cards - This fills the empty space with useful data */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Net Balance Block */}
          <div className="bg-primary/5 border-primary/10 space-y-2 rounded-xl border p-4">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Wallet className="h-4 w-4" />
              <span>Net Balance</span>
            </div>
            <div className="text-2xl font-bold">
              ${netBalance.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              Total cash flow for this period
            </p>
          </div>

          {/* Income Block */}
          <div className="border-border/50 bg-background/50 space-y-2 rounded-xl border p-4">
            <div className="flex items-center gap-2 text-sm text-emerald-500">
              <TrendingUp className="h-4 w-4" />
              <span>Total Income</span>
            </div>
            <div className="text-2xl font-bold">
              ${totals.income.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-emerald-600/80">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              <span className="font-medium">+4.5%</span>{" "}
              {/* You can calculate this real-time if you have prev data */}
              <span className="text-muted-foreground ml-1">
                from last month
              </span>
            </div>
          </div>

          {/* Expense Block */}
          <div className="border-border/50 bg-background/50 space-y-2 rounded-xl border p-4">
            <div className="flex items-center gap-2 text-sm text-rose-500">
              <TrendingDown className="h-4 w-4" />
              <span>Total Expenses</span>
            </div>
            <div className="text-2xl font-bold">
              ${totals.expense.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-rose-600/80">
              <ArrowDownRight className="mr-1 h-3 w-3" />
              <span className="font-medium">-1.2%</span>
              <span className="text-muted-foreground ml-1">
                from last month
              </span>
            </div>
          </div>
        </div>

        {/* The Chart */}
        <div className="h-[300px] w-full">
          <AreaChart
            data={chartData}
            config={chartConfig}
            dataKeyIncome="income"
            dataKeyExpense="expense"
            labelKey="date"
          />
        </div>
      </CardContent>

      {/* Optional Footer for extra context */}
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing total visitors for the last 6 months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
