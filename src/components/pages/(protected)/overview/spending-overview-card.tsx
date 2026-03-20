"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Skeleton } from "@ui/skeleton";
import type { ChartConfig } from "@ui/chart";

const BarChart = dynamic(
  () =>
    import("@/components/charts/bar-chart").then((m) => ({
      default: m.BarChart,
    })),
  { loading: () => <Skeleton className="h-[300px] w-full rounded-xl" /> },
);

export type DateRange = "3" | "6" | "12";

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
];

const barChartConfig = {
  amount: {
    label: "Expenses",
    color: "#6366f1",
  },
} satisfies ChartConfig;

interface SpendingOverviewCardProps {
  barChartData: Array<{ date: string; amount: number }>;
  barRange: DateRange;
  onBarRangeChange: (value: DateRange) => void;
  isLoading?: boolean;
  formatAmount: (value: number) => string;
}

function SpendingOverviewCardInner({
  barChartData,
  barRange,
  onBarRangeChange,
  isLoading,
  formatAmount,
}: SpendingOverviewCardProps) {
  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Spending Overview</CardTitle>
        <Select
          value={barRange}
          onValueChange={(v) => onBarRangeChange(v as DateRange)}
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
        <Suspense
          fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}
        >
          <BarChart
            data={barChartData}
            config={barChartConfig}
            dataKey="amount"
            labelKey="date"
            className="h-[300px] w-full"
            isLoading={isLoading}
            valueFormatter={(val) => formatAmount(val)}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
}

export const SpendingOverviewCard = React.memo(SpendingOverviewCardInner);
