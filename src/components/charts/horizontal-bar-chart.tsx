"use client";

import React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@ui/chart";
import { Skeleton } from "@ui/skeleton";

interface HorizontalBarChartProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  dataKey: string;
  labelKey: string;
  className?: string;
  isLoading?: boolean;
  valueFormatter?: (value: number) => string;
}

function truncateLabel(value: string, maxLen = 14): string {
  return value.length > maxLen ? `${value.slice(0, maxLen)}…` : value;
}

const TICK_STYLE = { fill: "hsl(var(--muted-foreground))", fontSize: 12 };

function HorizontalBarChartInner({
  data,
  config,
  dataKey,
  labelKey,
  className,
  isLoading,
  valueFormatter,
}: HorizontalBarChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />;
  }

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
        layout="vertical"
        margin={{ left: 8, right: 32, top: 8, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey={labelKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v: string) => truncateLabel(v)}
          tick={TICK_STYLE}
          width={110}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, _name, _item, _index, payload) => {
                const itemPayload = payload as unknown as Record<
                  string,
                  unknown
                >;
                const rawLabel = itemPayload[labelKey];
                const categoryName =
                  typeof rawLabel === "string" ? rawLabel : "";
                const fillColor =
                  typeof itemPayload.fill === "string"
                    ? itemPayload.fill
                    : undefined;
                return (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: fillColor }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                      <span className="text-muted-foreground">
                        {categoryName}
                      </span>
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
        <ChartLegend
          content={() => (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-3 text-xs">
              {data.map((item, index) => {
                const rawName = item[labelKey];
                const name = typeof rawName === "string" ? rawName : "";
                const fill =
                  typeof item.fill === "string" && item.fill
                    ? item.fill
                    : `var(--chart-${(index % 5) + 1})`;
                return (
                  <div key={index} className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: fill }}
                    />
                    <span className="text-muted-foreground">{name}</span>
                  </div>
                );
              })}
            </div>
          )}
        />
        <Bar dataKey={dataKey} radius={[0, 5, 5, 0]} maxBarSize={28}>
          {data.map((item, index) => {
            const fill =
              typeof item.fill === "string" && item.fill
                ? item.fill
                : `var(--chart-${(index % 5) + 1})`;
            return <Cell key={index} fill={fill} />;
          })}
        </Bar>
      </RechartsBarChart>
    </ChartContainer>
  );
}

export const HorizontalBarChart = React.memo(HorizontalBarChartInner);
