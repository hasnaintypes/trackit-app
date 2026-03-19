"use client";

import React, { useMemo } from "react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { ChartContainer, type ChartConfig } from "@ui/chart";

interface BudgetRadialChartProps {
  percent: number;
  chartColor: string;
  spentLabel: string;
  limitLabel: string;
}

function BudgetRadialChartInner({
  percent,
  chartColor,
  spentLabel,
  limitLabel,
}: BudgetRadialChartProps) {
  const clamped = Math.min(percent, 100);
  const endAngle = (clamped / 100) * 360;

  const chartData = useMemo(
    () => [{ name: "spent", value: clamped, fill: chartColor }],
    [clamped, chartColor],
  );

  const chartConfig: ChartConfig = useMemo(
    () => ({ spent: { label: "Spent", color: chartColor } }),
    [chartColor],
  );

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[200px]"
    >
      <RadialBarChart
        data={chartData}
        endAngle={90 - endAngle}
        startAngle={90}
        innerRadius={80}
        outerRadius={140}
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-muted last:fill-background"
          polarRadius={[86, 74]}
        />
        <RadialBar dataKey="value" background />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
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
                      className="fill-foreground text-3xl font-bold"
                    >
                      {spentLabel}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 22}
                      className="fill-muted-foreground text-xs"
                    >
                      of {limitLabel}
                    </tspan>
                  </text>
                );
              }
              return null;
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}

export const BudgetRadialChart = React.memo(BudgetRadialChartInner);
