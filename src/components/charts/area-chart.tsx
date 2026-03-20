"use client";

import React from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
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

interface AreaChartProps {
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

function AreaChartInner({
  data,
  config,
  dataKeyIncome,
  dataKeyExpense,
  labelKey,
  className,
  isLoading,
  valueFormatter,
}: AreaChartProps) {
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
        <RechartsAreaChart
          data={data}
          margin={{ left: 12, right: 12, top: 8, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey={labelKey}
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            minTickGap={32}
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
                indicator="dot"
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
          <defs>
            <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-income)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-income)"
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-expense)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-expense)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <Area
            dataKey={dataKeyIncome}
            type="monotone"
            fill="url(#fillIncome)"
            stroke="var(--color-income)"
            strokeWidth={2}
          />
          <Area
            dataKey={dataKeyExpense}
            type="monotone"
            fill="url(#fillExpense)"
            stroke="var(--color-expense)"
            strokeWidth={2}
          />
        </RechartsAreaChart>
      </ChartContainer>
    </div>
  );
}

export const AreaChart = React.memo(AreaChartInner);
