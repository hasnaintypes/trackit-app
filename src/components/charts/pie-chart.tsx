"use client";

import { Pie, PieChart as RechartsPieChart, Label } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface PieChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  dataKey: string;
  nameKey: string;
  className?: string;
  valueFormatter?: (value: number) => string;
}

export function PieChart({
  data,
  config,
  dataKey,
  nameKey,
  className,
  valueFormatter,
}: PieChartProps) {
  return (
    <ChartContainer config={config} className={className}>
      <RechartsPieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent nameKey={dataKey} hideLabel />}
        />
        <Pie
          data={data}
          innerRadius={60}
          dataKey={dataKey}
          nameKey={nameKey}
          strokeWidth={5}
          cornerRadius={8}
          paddingAngle={4}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                // Find top category
                const topCategory = [...data].sort(
                  (a, b) => (b[dataKey] as number) - (a[dataKey] as number),
                )[0];
                if (!topCategory) return null;

                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-xl font-bold"
                    >
                      {valueFormatter
                        ? valueFormatter(topCategory[dataKey] as number)
                        : `$${(topCategory[dataKey] as number).toFixed(0)}`}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 20}
                      className="fill-muted-foreground text-xs"
                    >
                      {topCategory[nameKey] as string}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  );
}
