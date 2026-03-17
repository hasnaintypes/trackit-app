"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface RadarChartProps {
  title: string;
  description?: string;
  data: Record<string, unknown>[];
  dataKeys: {
    key: string;
    name: string;
    color: string;
    fillOpacity?: number;
  }[];
  indexKey: string;
  config: ChartConfig;
  className?: string;
}

export function GenericRadarChart({
  title,
  description,
  data,
  dataKeys,
  indexKey,
  config,
  className,
}: RadarChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader className="items-center pb-4">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[350px]"
        >
          <RadarChart data={data}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis dataKey={indexKey} />
            <PolarGrid />
            {dataKeys.map((k) => (
              <Radar
                key={k.key}
                name={k.name}
                dataKey={k.key}
                fill={k.color}
                fillOpacity={k.fillOpacity ?? 0.6}
                stroke={k.color}
              />
            ))}
            <ChartLegend className="mt-8" content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
