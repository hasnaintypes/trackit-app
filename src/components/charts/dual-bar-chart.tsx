"use client";

import React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@ui/chart";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@/lib/utils";

interface DualBarChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  dataKeyIncome: string;
  dataKeyExpense: string;
  labelKey: string;
  className?: string;
  isLoading?: boolean;
  valueFormatter?: (value: number) => string;
}

function formatAxisValue(value: number): string {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
}

const TICK_STYLE = { fill: "hsl(var(--muted-foreground))", fontSize: 12 };

function DualBarChartInner({
  data,
  config,
  dataKeyIncome,
  dataKeyExpense,
  labelKey,
  className,
  isLoading,
  valueFormatter,
}: DualBarChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />;
  }

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
        <RechartsBarChart
          accessibilityLayer
          data={data}
          margin={{ left: 12, right: 12, top: 8, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey={labelKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={TICK_STYLE}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatAxisValue}
            tick={TICK_STYLE}
            width={50}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="dashed"
                formatter={(value, name, item) => {
                  const label = config[String(name)]?.label ?? String(name);
                  const color = item?.color ?? `var(--color-${String(name)})`;
                  return (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {valueFormatter
                            ? valueFormatter(Number(value))
                            : Number(value).toLocaleString()}
                        </span>
                      </div>
                    </>
                  );
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
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
