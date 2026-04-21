"use client";

import React from "react";
import { Badge } from "@ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

type BudgetStatus = "on-track" | "warning" | "over-budget";

const STATUS_CONFIG: Record<
  BudgetStatus,
  {
    label: string;
    badgeClass: string;
    chartColor: string;
    tooltip: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  "on-track": {
    label: "On Track",
    badgeClass:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    chartColor: "hsl(160 60% 45%)",
    tooltip: "Spending is within your budget. Keep it up!",
    Icon: CheckCircle2,
  },
  warning: {
    label: "Warning",
    badgeClass:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    chartColor: "hsl(38 92% 50%)",
    tooltip: "You've used over 70% of this budget. Consider slowing down.",
    Icon: AlertTriangle,
  },
  "over-budget": {
    label: "Over Budget",
    badgeClass:
      "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
    chartColor: "hsl(0 72% 51%)",
    tooltip: "You've exceeded your budget limit for this period.",
    Icon: ShieldAlert,
  },
};

export function getBudgetStatus(
  percent: number,
  isOver: boolean,
  categoryColor?: string | null,
) {
  if (isOver) return STATUS_CONFIG["over-budget"];
  if (percent >= 70) return { ...STATUS_CONFIG.warning };
  return {
    ...STATUS_CONFIG["on-track"],
    chartColor: categoryColor ?? STATUS_CONFIG["on-track"].chartColor,
  };
}

export function getStatusKey(percent: number, isOver: boolean): BudgetStatus {
  if (isOver) return "over-budget";
  if (percent >= 70) return "warning";
  return "on-track";
}

function BudgetStatusBadgeInner({
  percent,
  isOver,
}: {
  percent: number;
  isOver: boolean;
}) {
  const key = getStatusKey(percent, isOver);
  const config = STATUS_CONFIG[key];
  const StatusIcon = config.Icon;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 cursor-default gap-1 text-[10px]",
              config.badgeClass,
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px] text-xs">
          {config.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const BudgetStatusBadge = React.memo(BudgetStatusBadgeInner);
