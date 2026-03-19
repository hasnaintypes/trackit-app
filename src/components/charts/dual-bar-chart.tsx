"use client";

import React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@ui/chart";
import { cn } from "@/lib/utils";

interface DualBarChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  dataKeyIncome: string;
  dataKeyExpense: string;
  labelKey: string;
  className?: string;
  valueFormatter?: (value: number) => string;
}

function DualBarChartInner({
  data,
  config,
  dataKeyIncome,
  dataKeyExpense,
  labelKey,
  className,
  valueFormatter,
}: DualBarChartProps) {
  if (!data?.length) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2">
          <p className="text-muted-foreground text-sm font-medium">
            No data available for the current filters.
          </p>
          <p className="text-muted-foreground/60 text-xs">
            Add some transactions to see your spending trends.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <ChartContainer config={config} className="h-[300px] w-full">
        <RechartsBarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={labelKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value: string) => value.slice(0, 3)}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="dashed"
                formatter={
                  valueFormatter
                    ? (value) => valueFormatter(Number(value))
                    : undefined
                }
              />
            }
          />
          <Bar dataKey={dataKeyIncome} fill="var(--color-income)" radius={4} />
          <Bar
            dataKey={dataKeyExpense}
            fill="var(--color-expense)"
            radius={4}
          />
        </RechartsBarChart>
      </ChartContainer>
    </div>
  );
}

export const DualBarChart = React.memo(DualBarChartInner);
