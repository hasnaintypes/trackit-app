"use client";

import React, { useMemo } from "react";
import { HorizontalBarChart } from "@/components/charts/horizontal-bar-chart";
import type { ChartConfig } from "@ui/chart";

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

function MemberBalancesChartInner({
  balances,
  isLoading,
  formatAmount,
}: MemberBalancesChartProps) {
  const { data, config } = useMemo(() => {
    const chartData = balances.map((b) => ({
      name: b.name,
      balance: Math.abs(b.balance),
      fill: b.balance >= 0 ? "#10b981" : "#ef4444",
    }));

    const chartConfig: ChartConfig = {
      balance: { label: "Balance" },
    };

    return { data: chartData, config: chartConfig };
  }, [balances]);

  return (
    <HorizontalBarChart
      data={data}
      config={config}
      dataKey="balance"
      labelKey="name"
      isLoading={isLoading}
      valueFormatter={(v) => formatAmount(v)}
      hideLegend
      className="h-[200px]"
    />
  );
}

export const MemberBalancesChart = React.memo(MemberBalancesChartInner);
