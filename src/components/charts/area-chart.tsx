"use client";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface AreaChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  dataKeyIncome: string;
  dataKeyExpense: string;
  labelKey: string;
  className?: string;
  valueFormatter?: (value: number) => string;
}

function formatAxisValue(value: number): string {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
}

export function AreaChart({
  data,
  config,
  dataKeyIncome,
  dataKeyExpense,
  labelKey,
  className,
  valueFormatter,
}: AreaChartProps) {
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
          margin={{
            left: 12,
            right: 12,
            top: 8,
            bottom: 0,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey={labelKey}
            tickLine={false}
            axisLine={false}
            tickMargin={12}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={formatAxisValue}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            width={45}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="dot"
                formatter={
                  valueFormatter
                    ? (value) => valueFormatter(Number(value))
                    : undefined
                }
              />
            }
          />
          <defs>
            <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-income)"
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor="var(--color-income)"
                stopOpacity={0.05}
              />
            </linearGradient>
            <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-expense)"
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor="var(--color-expense)"
                stopOpacity={0.05}
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
