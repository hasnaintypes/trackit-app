"use client";

import React from "react";
import { api } from "@/trpc/react";
import { Wallet } from "lucide-react";
import { BudgetCard } from "@/components/pages/(protected)/budget/budget-card";
import { CreateBudgetDialog } from "@/components/pages/(protected)/budget/create-budget-dialog";
import { BudgetSkeleton } from "@skeletons/budget-skeleton";

export default function BudgetPageClient() {
  const { data: budgets, isLoading } = api.budget.all.useQuery();

  if (isLoading) {
    return <BudgetSkeleton />;
  }

  const budgetList = budgets ?? [];

  return (
    <div className="animate-in fade-in-50 flex flex-col space-y-12 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Budget & Goals
          </h1>
          <p className="text-muted-foreground mt-1">
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
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {budgetList.map((b) => (
            <BudgetCard
              key={b.id}
              id={b.id}
              name={b.category.name}
              icon={b.category.icon}
              color={b.category.color}
              amount={b.amount}
              spent={b.spentAmount}
              period={b.period}
            />
          ))}
        </div>
      )}
    </div>
  );
}
