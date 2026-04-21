"use client";

import React, { useMemo } from "react";
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

interface BalanceItem {
  contactId: string | null;
  name: string;
  balance: number;
}

interface MemberBalancesChartProps {
  balances: BalanceItem[];
  isLoading?: boolean;
  formatAmount: (value: string | number) => string;
}

const POSITIVE_COLOR = "#10b981";
const NEGATIVE_COLOR = "#ef4444";
const TICK_STYLE = { fill: "hsl(var(--muted-foreground))", fontSize: 12 };

function formatAxisValue(value: number): string {
  if (Math.abs(value) >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
}

function MemberBalancesChartInner({
  balances,
  isLoading,
  formatAmount,
}: MemberBalancesChartProps) {
  const { data, config } = useMemo(() => {
    const chartData = balances.map((b) => ({
      name: b.name,
      balance: b.balance,
      fill: b.balance >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR,
    }));

    const chartConfig: ChartConfig = {
      balance: { label: "Balance" },
      positive: { label: "Owed to you", color: POSITIVE_COLOR },
      negative: { label: "You owe", color: NEGATIVE_COLOR },
    };

    return { data: chartData, config: chartConfig };
  }, [balances]);

  if (isLoading) {
    return <Skeleton className="h-full min-h-[250px] w-full rounded-xl" />;
  }

  if (!data.length) {
    return (
      <div className="flex h-full min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center backdrop-blur-sm">
        <p className="text-muted-foreground text-sm font-medium">
          No balance data yet.
        </p>
        <p className="text-muted-foreground/60 text-xs">
          Add expenses to see member balances.
        </p>
      </div>
    );
  }

  return (
    <ChartContainer
      config={config}
      className="h-full min-h-[250px] w-full [&_.recharts-responsive-container]:!h-full"
    >
      <RechartsBarChart
        accessibilityLayer
        data={data}
        margin={{ left: 2, right: 12, top: 8, bottom: 16 }}
      >
        <defs>
          <linearGradient id="balanceGradPos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={POSITIVE_COLOR} stopOpacity={1} />
            <stop offset="100%" stopColor={POSITIVE_COLOR} stopOpacity={0.4} />
          </linearGradient>
          <linearGradient id="balanceGradNeg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={NEGATIVE_COLOR} stopOpacity={0.4} />
            <stop offset="100%" stopColor={NEGATIVE_COLOR} stopOpacity={1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={12}
          axisLine={false}
          tick={TICK_STYLE}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={formatAxisValue}
          tick={TICK_STYLE}
          width={65}
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
                const memberName =
                  typeof itemPayload.name === "string" ? itemPayload.name : "";
                const bal = Number(value);
                const color = bal >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;
                return (
                  <>
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                      <span className="text-muted-foreground">
                        {memberName}
                      </span>
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {bal >= 0 ? "+" : ""}
                        {formatAmount(bal)}
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
            <div className="flex items-center justify-center gap-4 pt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: POSITIVE_COLOR }}
                />
                <span className="text-muted-foreground">Owed to you</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: NEGATIVE_COLOR }}
                />
                <span className="text-muted-foreground">You owe</span>
              </div>
            </div>
          )}
        />
        <Bar dataKey="balance" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((item, index) => (
            <Cell
              key={index}
              fill={
                item.balance >= 0
                  ? "url(#balanceGradPos)"
                  : "url(#balanceGradNeg)"
              }
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ChartContainer>
  );
}

export const MemberBalancesChart = React.memo(MemberBalancesChartInner);
