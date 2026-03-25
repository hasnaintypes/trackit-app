"use client";

import React from "react";
import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Progress } from "@ui/progress";

interface BalanceItem {
  contactId: string | null;
  name: string;
  avatarUrl: string | null;
  balance: number;
}

interface BalanceSummaryProps {
  balances: BalanceItem[];
  isLoading?: boolean;
  formatAmount: (value: string | number) => string;
}

function BalanceSummaryInner({
  balances,
  isLoading,
  formatAmount,
}: BalanceSummaryProps) {
  const maxAbs = Math.max(...balances.map((b) => Math.abs(b.balance)), 1);

  return (
    <Card className="shadow-md dark:border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Scale className="h-4 w-4" />
          Balances
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                <div className="bg-muted h-2 w-full animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        ) : balances.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No expenses yet. Add an expense to see balances.
          </p>
        ) : (
          <div className="space-y-4">
            {balances.map((item) => {
              const pct = (Math.abs(item.balance) / maxAbs) * 100;
              const isPositive = item.balance >= 0;
              return (
                <div key={item.contactId ?? "self"} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-muted text-[10px] font-medium">
                          {item.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        isPositive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400",
                      )}
                    >
                      {isPositive ? "+" : "-"}
                      {formatAmount(Math.abs(item.balance))}
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className={cn(
                      "h-2",
                      isPositive
                        ? "[&>div]:bg-emerald-500"
                        : "[&>div]:bg-rose-500",
                    )}
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const BalanceSummary = React.memo(BalanceSummaryInner);
