"use client";

import React, { Suspense, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "@ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import type { ChartConfig } from "@ui/chart";
import { subMonths, format } from "date-fns";
import { useFormatter } from "@/hooks/use-formatter";
import { CalendarDays } from "lucide-react";

const AreaChart = dynamic(
  () =>
    import("@/components/charts/area-chart").then((m) => ({
      default: m.AreaChart,
    })),
  { loading: () => <Skeleton className="h-[400px] w-full rounded-xl" /> },
);

type DateRange = "3" | "6" | "12";

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
];

const areaConfig = {
  income: { label: "Income", color: "#3b82f6" },
  expense: { label: "Expense", color: "#06b6d4" },
} satisfies ChartConfig;

export default function AnalyticsPageClient() {
  const { formatAmount } = useFormatter();
  const { listQuery } = useTransactions();
  const [dateRange, setDateRange] = useState<DateRange>("6");

  const { data: txData } = listQuery({ limit: 100 });
  const transactions = useMemo(
    () => txData?.transactions ?? [],
    [txData?.transactions],
  );

  const areaChartData = useMemo(() => {
    const now = new Date();
    const rangeMonths = parseInt(dateRange, 10);
    const cutoff = subMonths(now, rangeMonths);

    const buckets: Record<
      string,
      { date: string; income: number; expense: number }
    > = {};
    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (txDate < cutoff) return;

      const amt = Math.abs(parseFloat(tx.amount));
      const label = format(txDate, "MMM dd");
      buckets[label] ??= { date: label, income: 0, expense: 0 };
      if (tx.type === "CREDIT") buckets[label].income += amt;
      else if (tx.type === "DEBIT") buckets[label].expense += amt;
    });
    return Object.values(buckets).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [transactions, dateRange]);

  return (
    <div className="animate-in fade-in-50 flex flex-col space-y-12 duration-500">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize your income, expenses, and spending patterns
          </p>
        </div>
        <Select
          value={dateRange}
          onValueChange={(v) => setDateRange(v as DateRange)}
        >
          <SelectTrigger className="h-9 w-auto gap-1.5 rounded-lg px-3 text-xs shadow-sm">
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
      </div>

      {/* Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4 sm:px-6">
          <Suspense
            fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}
          >
            <AreaChart
              data={areaChartData}
              config={areaConfig}
              dataKeyIncome="income"
              dataKeyExpense="expense"
              labelKey="date"
              className="h-[300px] w-full"
              valueFormatter={(val) => formatAmount(val)}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
