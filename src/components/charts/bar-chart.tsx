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
}

export function BarChart({
  data,
  config,
  dataKey,
  labelKey,
  className,
}: BarChartProps) {
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
          tickFormatter={(value) => `$${value}`}
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
