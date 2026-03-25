"use client";

import React, { useMemo } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { BarChart } from "@/components/charts/bar-chart";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@ui/chart";
import type { Expense } from "@/types/expense";
import type { GroupMember } from "@/types/group";
import { Skeleton } from "@ui/skeleton";

const MEMBER_COLORS = ["#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];
const MIN_CATEGORIES_FOR_RADAR = 4;

interface SpendingRadarChartProps {
  expenses: Expense[];
  members: GroupMember[];
  isLoading?: boolean;
}

function SpendingRadarChartInner({
  expenses,
  members,
  isLoading,
}: SpendingRadarChartProps) {
  const {
    radarData,
    radarDataKeys,
    radarConfig,
    barData,
    barConfig,
    categoryCount,
  } = useMemo(() => {
    if (!expenses.length || !members.length) {
      return {
        radarData: [],
        radarDataKeys: [],
        radarConfig: {} as ChartConfig,
        barData: [],
        barConfig: {} as ChartConfig,
        categoryCount: 0,
      };
    }

    // Aggregate spending by category
    const categoryTotals = new Map<string, number>();
    const categoryMap = new Map<string, Map<string, number>>();

    for (const expense of expenses) {
      const category = expense.category?.name ?? "Other";
      categoryTotals.set(
        category,
        (categoryTotals.get(category) ?? 0) + expense.amount,
      );
      if (!categoryMap.has(category)) {
        categoryMap.set(category, new Map());
      }
      const memberMap = categoryMap.get(category)!;
      for (const p of expense.participants) {
        const key = p.contactId ?? "self";
        memberMap.set(key, (memberMap.get(key) ?? 0) + p.owedAmount);
      }
    }

    const catCount = categoryMap.size;

    // Build bar chart data (always computed for fallback)
    const barChartData = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({
        name,
        amount: Math.round(amount * 100) / 100,
      }));

    const barChartConfig: ChartConfig = {
      amount: { label: "Amount", color: "#6366f1" },
    };

    // Build radar chart data (only if enough categories)
    const memberKeys = members.map((m, i) => ({
      key: m.contactId ?? "self",
      name: m.contact?.name ?? "You",
      color: MEMBER_COLORS[i % MEMBER_COLORS.length]!,
      fillOpacity: 0.3,
    }));

    const radarChartData = Array.from(categoryMap.entries()).map(
      ([category, memberMap]) => {
        const row: Record<string, unknown> = { category };
        for (const mk of memberKeys) {
          row[mk.key] = Math.round((memberMap.get(mk.key) ?? 0) * 100) / 100;
        }
        return row;
      },
    );

    const radarChartConfig: ChartConfig = {};
    for (const mk of memberKeys) {
      radarChartConfig[mk.key] = { label: mk.name, color: mk.color };
    }

    return {
      radarData: radarChartData,
      radarDataKeys: memberKeys,
      radarConfig: radarChartConfig,
      barData: barChartData,
      barConfig: barChartConfig,
      categoryCount: catCount,
    };
  }, [expenses, members]);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />;
  }

  if (!barData.length) {
    return null;
  }

  // Show vertical bar chart when fewer categories, radar when enough
  if (categoryCount < MIN_CATEGORIES_FOR_RADAR) {
    return (
      <BarChart
        data={barData}
        config={barConfig}
        dataKey="amount"
        labelKey="name"
        className="h-[300px]"
      />
    );
  }

  return (
    <ChartContainer
      config={radarConfig}
      className="mx-auto aspect-square max-h-[350px]"
    >
      <RadarChart data={radarData}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <PolarAngleAxis dataKey="category" />
        <PolarGrid />
        {radarDataKeys.map((k) => (
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
  );
}

export const SpendingRadarChart = React.memo(SpendingRadarChartInner);
