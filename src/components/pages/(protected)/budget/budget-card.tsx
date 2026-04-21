"use client";

import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Info } from "lucide-react";
import { useFormatter } from "@/hooks/use-formatter";
import type { Currency } from "@prisma/client";

import { BudgetRadialChart } from "./budget-radial-chart";
import { BudgetStatusBadge, getBudgetStatus } from "./budget-status-badge";
import { CategoryIcon } from "./category-icon";

export interface BudgetCardProps {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  amount: number;
  spent: number;
  period: string;
  currency?: Currency;
}

const PERIOD_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
  CUSTOM: "Custom",
};

const PERIOD_DAYS: Record<string, number> = {
  DAILY: 1,
  WEEKLY: 7,
  MONTHLY: 30,
  YEARLY: 365,
};

function BudgetCardInner({
  name,
  icon,
  color,
  amount,
  spent,
  period,
  currency = "USD",
}: BudgetCardProps) {
  const { formatAmount } = useFormatter();
  const percent = amount > 0 ? (spent / amount) * 100 : 0;
  const isOverBudget = spent > amount;
  const remaining = Math.max(amount - spent, 0);
  const status = getBudgetStatus(percent, isOverBudget, color);

  // Daily spending pace
  const periodDays = PERIOD_DAYS[period] ?? 30;
  const dailyBudget = amount / periodDays;
  const dailyActual = spent / periodDays;
  const isOverPace = dailyActual > dailyBudget;

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="flex flex-col">
        {/* Header: category + badge */}
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-0">
          <CategoryIcon icon={icon} color={color} name={name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold">{name}</p>
            <p className="text-muted-foreground text-xs">
              {PERIOD_LABELS[period] ?? period} Budget
            </p>
          </div>
          <BudgetStatusBadge percent={percent} isOver={isOverBudget} />
        </CardHeader>

        {/* Chart */}
        <CardContent className="flex-1 px-4 pt-2 pb-0">
          <BudgetRadialChart
            percent={percent}
            chartColor={status.chartColor}
            spentLabel={formatAmount(spent, currency)}
            limitLabel={formatAmount(amount, currency)}
          />
        </CardContent>

        {/* Stats footer */}
        <CardFooter className="flex-col gap-3 pt-0 pb-5">
          {/* Spent vs Remaining */}
          <div className="grid w-full grid-cols-2 gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-muted/50 cursor-default rounded-lg px-3 py-2">
                  <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                    Spent
                  </p>
                  <p
                    className={cn(
                      "text-base font-bold tabular-nums",
                      isOverBudget && "text-red-600 dark:text-red-400",
                    )}
                  >
                    {formatAmount(spent, currency)}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {percent.toFixed(1)}% of your{" "}
                {(PERIOD_LABELS[period] ?? period).toLowerCase()} limit
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-muted/50 cursor-default rounded-lg px-3 py-2">
                  <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                    {isOverBudget ? "Over by" : "Remaining"}
                  </p>
                  <p
                    className={cn(
                      "text-base font-bold tabular-nums",
                      isOverBudget
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {formatAmount(
                      isOverBudget ? spent - amount : remaining,
                      currency,
                    )}
                  </p>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {isOverBudget
                  ? `You've exceeded your limit by ${(percent - 100).toFixed(1)}%`
                  : `${(100 - percent).toFixed(1)}% of your budget is still available`}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Daily pace insight */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex w-full cursor-default items-center gap-2 rounded-lg border px-3 py-2">
                {isOverPace ? (
                  <TrendingUp className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                )}
                <span className="text-muted-foreground flex-1 text-xs">
                  Avg. {formatAmount(dailyActual, currency)}/day
                </span>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Info className="h-3 w-3" />
                  {formatAmount(dailyBudget, currency)}/day target
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[220px] text-xs">
              {isOverPace
                ? `You're spending ${formatAmount(dailyActual - dailyBudget, currency)} more per day than your target. Consider reducing daily spending.`
                : `You're ${formatAmount(dailyBudget - dailyActual, currency)} under your daily target. Great pace!`}
            </TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}

export const BudgetCard = React.memo(BudgetCardInner);
