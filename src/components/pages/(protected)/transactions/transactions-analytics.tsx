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
import { useFormatter } from "@/hooks/use-formatter";

interface TransactionsAnalyticsProps {
  chartData: { date: string; income: number; expense: number }[];
  chartConfig: ChartConfig;
}

export function TransactionsAnalytics({
  chartData,
  chartConfig,
}: TransactionsAnalyticsProps) {
  const { formatAmount } = useFormatter();

  // 1. Calculate totals and trends
  const analytics = useMemo(() => {
    const totalIncome = chartData.reduce((acc, curr) => acc + curr.income, 0);
    const totalExpense = chartData.reduce((acc, curr) => acc + curr.expense, 0);

    // Split data in half to calculate a trend if we don't have previous month data
    const midPoint = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, midPoint);
    const secondHalf = chartData.slice(midPoint);

    const firstHalfIncome = firstHalf.reduce(
      (acc, curr) => acc + curr.income,
      0,
    );
    const secondHalfIncome = secondHalf.reduce(
      (acc, curr) => acc + curr.income,
      0,
    );
    const incomeTrend =
      firstHalfIncome > 0
        ? ((secondHalfIncome - firstHalfIncome) / firstHalfIncome) * 100
        : 0;

    const firstHalfExpense = firstHalf.reduce(
      (acc, curr) => acc + curr.expense,
      0,
    );
    const secondHalfExpense = secondHalf.reduce(
      (acc, curr) => acc + curr.expense,
      0,
    );
    const expenseTrend =
      firstHalfExpense > 0
        ? ((secondHalfExpense - firstHalfExpense) / firstHalfExpense) * 100
        : 0;

    const netTrend = (incomeTrend + expenseTrend) / 2;

    return {
      totals: { income: totalIncome, expense: totalExpense },
      incomeTrend,
      expenseTrend,
      netTrend,
      netBalance: totalIncome - totalExpense,
    };
  }, [chartData]);

  const { totals, incomeTrend, expenseTrend, netTrend, netBalance } = analytics;

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
            <div className="text-2xl font-bold">{formatAmount(netBalance)}</div>
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
              {formatAmount(totals.income)}
            </div>
            <div className="flex items-center text-xs text-emerald-600/80">
              {incomeTrend >= 0 ? (
                <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3 text-rose-500" />
              )}
              <span className="font-medium">
                {incomeTrend >= 0 ? "+" : ""}
                {incomeTrend.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">
                vs previous period
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
              {formatAmount(totals.expense)}
            </div>
            <div className="flex items-center text-xs text-rose-600/80">
              {expenseTrend >= 0 ? (
                <ArrowUpRight className="mr-1 h-3 w-3 text-rose-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3 text-rose-500" />
              )}
              <span className="font-medium">
                {expenseTrend >= 0 ? "+" : ""}
                {expenseTrend.toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">
                vs previous period
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

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {netTrend >= 0 ? "Income trending up" : "Spending trend shifting"}{" "}
              by {Math.abs(netTrend).toFixed(1)}% this period{" "}
              {netTrend >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing total volume for the last {chartData.length} days
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
