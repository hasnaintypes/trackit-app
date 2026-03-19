"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import { Skeleton } from "@ui/skeleton";
import type { ChartConfig } from "@ui/chart";

const HorizontalBarChart = dynamic(
  () =>
    import("@/components/charts/horizontal-bar-chart").then((m) => ({
      default: m.HorizontalBarChart,
    })),
  { loading: () => <Skeleton className="h-[300px] w-full rounded-xl" /> },
);

interface CategoryBarCardProps {
  data: Record<string, unknown>[];
  config: ChartConfig;
  valueFormatter?: (value: number) => string;
}

export const CategoryBarCard = React.memo(function CategoryBarCard({
  data,
  config,
  valueFormatter,
}: CategoryBarCardProps) {
  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader>
        <CardTitle>Top Spending Categories</CardTitle>
        <CardDescription>Where your money goes</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}
        >
          <HorizontalBarChart
            data={data}
            config={config}
            dataKey="amount"
            labelKey="category"
            className="h-[300px] w-full"
            valueFormatter={valueFormatter}
          />
        </Suspense>
      </CardContent>
    </Card>
  );
});
