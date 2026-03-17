"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartConfig } from "@/components/ui/chart";

const PieChart = dynamic(
  () =>
    import("@/components/charts/pie-chart").then((m) => ({
      default: m.PieChart,
    })),
  { loading: () => <Skeleton className="h-[300px] w-full rounded-xl" /> },
);

interface SpendingByCategoryCardProps {
  pieChartData: Array<{ name: string; value: number; fill: string }>;
  pieChartConfig: ChartConfig;
  formatAmount: (value: number) => string;
}

function SpendingByCategoryCardInner({
  pieChartData,
  pieChartConfig,
  formatAmount,
}: SpendingByCategoryCardProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}
        >
          <PieChart
            data={pieChartData}
            config={pieChartConfig}
            dataKey="value"
            nameKey="name"
            className="mx-auto aspect-square max-h-[300px]"
            valueFormatter={(val) => formatAmount(val)}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
}

export const SpendingByCategoryCard = React.memo(SpendingByCategoryCardInner);
