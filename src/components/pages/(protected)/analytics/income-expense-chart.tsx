"use client";

import React, { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { AreaChartIcon, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Skeleton } from "@ui/skeleton";
import type { ChartConfig } from "@ui/chart";

type ChartVariant = "area" | "bar";

const AreaChart = dynamic(
  () =>
    import("@/components/charts/area-chart").then((m) => ({
      default: m.AreaChart,
    })),
  { loading: () => <Skeleton className="h-[300px] w-full rounded-xl" /> },
);

const DualBarChart = dynamic(
  () =>
    import("@/components/charts/dual-bar-chart").then((m) => ({
      default: m.DualBarChart,
    })),
  { loading: () => <Skeleton className="h-[300px] w-full rounded-xl" /> },
);

const CHART_OPTIONS: {
  value: ChartVariant;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "area",
    label: "Area",
    icon: <AreaChartIcon className="size-3.5" />,
  },
  { value: "bar", label: "Bar", icon: <BarChart3 className="size-3.5" /> },
];

interface IncomeExpenseChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  rangeLabel: string;
  valueFormatter?: (value: number) => string;
}

export const IncomeExpenseChart = React.memo(function IncomeExpenseChart({
  data,
  config,
  rangeLabel,
  valueFormatter,
}: IncomeExpenseChartProps) {
  const [chartType, setChartType] = useState<ChartVariant>("area");

  const sharedProps = {
    data,
    config,
    dataKeyIncome: "income",
    dataKeyExpense: "expense",
    labelKey: "date",
    className: "h-[300px] w-full",
    valueFormatter,
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div className="space-y-1">
          <CardTitle>Income vs Expenses</CardTitle>
          <CardDescription>Showing trends for {rangeLabel}</CardDescription>
        </div>
        <Select
          value={chartType}
          onValueChange={(v) => setChartType(v as ChartVariant)}
        >
          <SelectTrigger className="h-8 w-auto gap-1.5 rounded-lg px-3 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {CHART_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  {opt.icon}
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <Suspense
          fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}
        >
          {chartType === "bar" ? (
            <DualBarChart {...sharedProps} />
          ) : (
            <AreaChart {...sharedProps} />
          )}
        </Suspense>
      </CardContent>
    </Card>
  );
});
