"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, TrendingDown } from "lucide-react";
import { Button } from "@ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/pages/(protected)/budget/category-icon";
import type { TopTransaction } from "@/app/(features)/analytics/_hooks/use-top-transactions";

interface TopTransactionsCardProps {
  transactions: TopTransaction[];
  isLoading?: boolean;
  formatAmount: (amount: number | string) => string;
  formatDate: (date: Date | string) => string;
}

const FALLBACK_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444"];

export const TopTransactionsCard = React.memo(function TopTransactionsCard({
  transactions,
  isLoading,
  formatAmount,
  formatDate,
}: TopTransactionsCardProps) {
  return (
    <Card className="col-span-full lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="text-muted-foreground size-4" />
            Top Expenses
          </CardTitle>
          <CardDescription>Your biggest spending items</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link href="/transactions">
            See all
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg px-3 py-3"
              >
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex h-[280px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              No expenses yet.
            </p>
            <p className="text-muted-foreground/60 mt-1 text-xs">
              Your biggest expenses will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx, i) => {
              const color =
                tx.categoryColor ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];

              return (
                <div
                  key={tx.id}
                  className={cn(
                    "hover:bg-muted/50 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  )}
                >
                  <CategoryIcon
                    icon={tx.categoryIcon}
                    color={color}
                    name={tx.categoryName}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm leading-tight font-medium">
                      {tx.description}
                    </p>
                    <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                      <span
                        className="inline-block size-2 rounded-full"
                        style={{ backgroundColor: color ?? undefined }}
                      />
                      <span>{tx.categoryName}</span>
                      <span>&middot;</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-red-500 tabular-nums">
                    -{formatAmount(Math.abs(parseFloat(tx.amount)))}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
