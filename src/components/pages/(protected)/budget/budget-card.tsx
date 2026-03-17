"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useFormatter } from "@/hooks/use-formatter";
import type { Currency } from "@prisma/client";

export interface BudgetCardProps {
  id: string;
  name: string;
  icon?: string | null;
  amount: number;
  spent: number;
  period: string; // e.g. "MONTHLY"
  currency?: Currency;
}

function BudgetCardInner({
  name,
  icon,
  amount,
  spent,
  period,
  currency = "USD",
}: BudgetCardProps) {
  const { formatAmount } = useFormatter();
  const percent = amount > 0 ? Math.min((spent / amount) * 100, 100) : 0;
  const isOverBudget = spent > amount;
  const isWarning = !isOverBudget && percent > 85;

  let statusColor = "bg-primary";
  let statusText = "On Track";
  let statusIcon = <CheckCircle2 className="h-3 w-3" />;

  if (isOverBudget) {
    statusColor = "bg-destructive";
    statusText = "Over Budget";
    statusIcon = <AlertTriangle className="h-3 w-3" />;
  } else if (isWarning) {
    statusColor = "bg-yellow-500";
    statusText = "Warning";
    statusIcon = <AlertTriangle className="h-3 w-3" />;
  }

  return (
    <Card
      className="group relative overflow-hidden border-l-4 transition-all hover:shadow-lg"
      style={{
        borderLeftColor: isOverBudget
          ? "hsl(var(--destructive))"
          : isWarning
            ? "#eab308"
            : "hsl(var(--primary))",
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-2xl">{icon ?? ""}</span>
          <span>{name}</span>
        </CardTitle>
        <Badge
          variant={isOverBudget ? "destructive" : "secondary"}
          className={cn(
            "gap-1 font-medium",
            isWarning &&
              !isOverBudget &&
              "bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25",
          )}
        >
          {statusIcon} {statusText}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold tracking-tight">
              {formatAmount(spent, currency)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs font-medium tracking-wider uppercase">
              of {formatAmount(amount, currency)} {period.toLowerCase()} limit
            </p>
          </div>
          <div className="text-right">
            <span
              className={cn(
                "text-xl font-bold",
                isOverBudget ? "text-destructive" : "text-primary",
              )}
            >
              {percent.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="bg-secondary relative h-3 w-full overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full w-full flex-1 transition-all duration-500 ease-in-out",
              statusColor,
            )}
            style={{ transform: `translateX(-${100 - (percent || 0)}%)` }}
          />
        </div>

        <div className="text-muted-foreground mt-4 flex justify-between text-xs">
          <span>
            Remaining: {formatAmount(Math.max(amount - spent, 0), currency)}
          </span>
          <span>Reset: End of period</span>
        </div>
      </CardContent>
    </Card>
  );
}

export const BudgetCard = React.memo(BudgetCardInner);
