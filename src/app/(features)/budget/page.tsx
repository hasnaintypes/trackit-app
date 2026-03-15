"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { api } from "@/trpc/react";
import { toNum } from "@/lib/shared/decimal";
import { Loader2, Wallet } from "lucide-react";
import { BudgetCard } from "@/components/pages/(protected)/budget/budget-card";
import { CreateBudgetDialog } from "@/components/pages/(protected)/budget/create-budget-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartConfig } from "@/components/ui/chart";

const GenericRadarChart = dynamic(
  () =>
    import("@/components/charts/radar-chart").then((m) => ({
      default: m.GenericRadarChart,
    })),
  { loading: () => <Skeleton className="h-[300px] w-full rounded-xl" /> },
);

export default function BudgetPage() {
  const { data: budgets, isLoading } = api.budget.all.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const budgetList = budgets ?? [];

  // Transform data for Radar Chart
  const chartData = budgetList.slice(0, 6).map((b) => ({
    category: b.category.name,
    budget: toNum(b.amount),
    spent: toNum(b.spentAmount),
  }));

  const radarConfig = {
    budget: {
      label: "Budget",
      color: "hsl(var(--primary))",
    },
    spent: {
      label: "Spent",
      color: "hsl(var(--destructive))",
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget & Goals</h1>
          <p className="text-muted-foreground mt-2">
            Manage your spending limits and track your financial health.
          </p>
        </div>
        <CreateBudgetDialog />
      </div>

      {budgetList.length === 0 ? (
        <div className="bg-muted/20 flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <div className="bg-primary/10 mb-4 rounded-full p-4">
            <Wallet className="text-primary h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold">No Budgets Yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            Create your first budget to start tracking your expenses and get
            alerted when you&apos;re close to your limits.
          </p>
          <div className="mt-6">
            <CreateBudgetDialog />
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content: Budget Cards */}
          <div className="space-y-6 lg:col-span-2">
            <h2 className="text-xl font-semibold tracking-tight">
              Active Budgets
            </h2>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
              {budgetList.map((b) => (
                <BudgetCard
                  key={b.id}
                  id={b.id}
                  name={b.category.name}
                  icon={b.category.icon}
                  amount={toNum(b.amount)}
                  spent={toNum(b.spentAmount)}
                  period={b.period}
                />
              ))}
            </div>
          </div>

          {/* Sidebar: Analytics */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold tracking-tight">Analytics</h2>
            <Suspense
              fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}
            >
              <GenericRadarChart
                title="Spending Distribution"
                description="Budget v/s Actual Spending"
                data={chartData}
                indexKey="category"
                dataKeys={[
                  {
                    key: "budget",
                    name: "Budget Limit",
                    color: "var(--color-budget)",
                    fillOpacity: 0.2,
                  },
                  {
                    key: "spent",
                    name: "Actual Spent",
                    color: "var(--color-spent)",
                    fillOpacity: 0.5,
                  },
                ]}
                config={radarConfig}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
