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
      <RechartsBarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={labelKey}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value: string | number) => value.toString()}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tickFormatter={(value: number) =>
            valueFormatter ? valueFormatter(value) : `$${value}`
          }
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar
          dataKey={dataKey}
          fill={`var(--color-${dataKey})`}
          radius={[4, 4, 0, 0]}
        />
      </RechartsBarChart>
    </ChartContainer>
  );
}
