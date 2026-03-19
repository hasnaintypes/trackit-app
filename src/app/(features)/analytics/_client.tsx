"use client";

import React, { useMemo, useState } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useFormatter } from "@/hooks/use-formatter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import type { ChartConfig } from "@ui/chart";
import { CalendarDays } from "lucide-react";
import { useCategoryBarData } from "./_hooks/use-category-bar-data";
import { useTopTransactions } from "./_hooks/use-top-transactions";
import { useAreaChartData } from "./_hooks/use-area-chart-data";
import { CategoryBarCard } from "@/components/pages/(protected)/analytics/category-bar-card";
import { TopTransactionsCard } from "@/components/pages/(protected)/analytics/top-transactions-card";
import { IncomeExpenseChart } from "@/components/pages/(protected)/analytics/income-expense-chart";

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
  const { formatAmount, formatDate } = useFormatter();
  const { listQuery } = useTransactions();
  const { categoryMap, allFlat } = useCategories();
  const [dateRange, setDateRange] = useState<DateRange>("6");

  const rangeMonths = parseInt(dateRange, 10);

  const { data: txData, isLoading } = listQuery({ limit: 100 });
  const transactions = useMemo(
    () => txData?.transactions ?? [],
    [txData?.transactions],
  );

  const flatCategories = useMemo(() => allFlat.data ?? [], [allFlat.data]);

  const { data: barData, config: barConfig } = useCategoryBarData(
    transactions,
    categoryMap,
    flatCategories,
  );

  const topTransactions = useTopTransactions(
    transactions,
    categoryMap,
    flatCategories,
  );
  const areaChartData = useAreaChartData(transactions, rangeMonths);

  const rangeLabel =
    DATE_RANGE_OPTIONS.find((opt) => opt.value === dateRange)?.label ??
    "the selected period";

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

      {/* Row 1: Bar chart + Top transactions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <CategoryBarCard
          data={barData}
          config={barConfig}
          valueFormatter={(val) => formatAmount(val)}
        />
        <TopTransactionsCard
          transactions={topTransactions}
          isLoading={isLoading}
          formatAmount={formatAmount}
          formatDate={formatDate}
        />
      </div>

      {/* Row 2: Area chart */}
      <IncomeExpenseChart
        data={areaChartData}
        config={areaConfig}
        rangeLabel={rangeLabel}
        valueFormatter={(val) => formatAmount(val)}
      />
    </div>
  );
}
