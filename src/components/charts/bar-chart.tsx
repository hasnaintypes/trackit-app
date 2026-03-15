"use client";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface BarChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  dataKey: string;
  labelKey: string;
  className?: string;
  valueFormatter?: (value: number) => string;
}

function formatAxisValue(value: number): string {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
}

export function BarChart({
  data,
  config,
  dataKey,
  labelKey,
  className,
  valueFormatter,
}: BarChartProps) {
  const hasData = data.some(
    (item) => typeof item[dataKey] === "number" && Number(item[dataKey]) > 0,
  );

  if (!data.length || !hasData) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2">
          <p className="text-muted-foreground text-sm font-medium">
            No spending data available yet.
          </p>
          <p className="text-muted-foreground/60 text-xs">
            Add some transactions to see your spending overview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ChartContainer config={config} className={className}>
      <RechartsBarChart
        accessibilityLayer
        data={data}
        margin={{ left: 2, right: 12, top: 8, bottom: 0 }}
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={`var(--color-${dataKey})`}
              stopOpacity={1}
            />
            <stop
              offset="100%"
              stopColor={`var(--color-${dataKey})`}
              stopOpacity={0.4}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey={labelKey}
          tickLine={false}
          tickMargin={12}
          axisLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={valueFormatter ?? formatAxisValue}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          width={65}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={
                valueFormatter
                  ? (value) => valueFormatter(Number(value))
                  : undefined
              }
            />
          }
        />
        <Bar
          dataKey={dataKey}
          fill="url(#barGradient)"
          radius={[6, 6, 0, 0]}
          maxBarSize={48}
        />
      </RechartsBarChart>
    </ChartContainer>
  );
}
