"use client";

import { Pie, PieChart as RechartsPieChart } from "recharts";
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
}

export function PieChart({
  data,
  config,
  dataKey,
  nameKey,
  className,
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
          {/* <LabelList
            dataKey={nameKey}
            stroke="none"
            fontSize={12}
            fontWeight={500}
            fill="currentColor"
            // Only show labels for slices that have a value
            formatter={(value: string) => {
              const item = data.find((d) => d[nameKey] === value);
              return item && item[dataKey] > 0 ? value : "";
            }}
          /> */}
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  );
}
