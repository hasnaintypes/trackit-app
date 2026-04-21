"use client";

import React from "react";
import { Receipt, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityFeedItem {
  type: "expense" | "settlement";
  id: string;
  date: string;
  amount: number;
  description?: string;
  notes?: string | null;
  createdByName?: string;
  [key: string]: unknown;
}

interface ActivityFeedProps {
  items: ActivityFeedItem[];
  isLoading?: boolean;
  formatAmount: (value: string | number) => string;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function ActivityFeedInner({
  items,
  isLoading,
  formatAmount,
}: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-2">
            <div className="bg-muted h-8 w-8 animate-pulse rounded-lg" />
            <div className="flex-1 space-y-1">
              <div className="bg-muted h-3.5 w-40 animate-pulse rounded" />
              <div className="bg-muted h-3 w-20 animate-pulse rounded" />
            </div>
            <div className="bg-muted h-4 w-16 animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center text-sm">
        No activity yet.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const isExpense = item.type === "expense";
        return (
          <div
            key={item.id}
            className="hover:bg-muted/30 flex items-center gap-3 rounded-lg p-2 transition-colors"
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                isExpense
                  ? "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
                  : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
              )}
            >
              {isExpense ? (
                <Receipt className="h-4 w-4" />
              ) : (
                <ArrowLeftRight className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {item.description ?? item.notes ?? "Settlement"}
              </p>
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <span>{formatRelativeDate(item.date)}</span>
                {item.createdByName && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <span>by {item.createdByName}</span>
                  </>
                )}
                <span className="text-muted-foreground/40">·</span>
                <span>{isExpense ? "Shared expense" : "Payment"}</span>
              </div>
            </div>
            <span
              className={cn(
                "shrink-0 text-sm font-semibold tabular-nums",
                isExpense
                  ? "text-foreground"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {!isExpense && "+"}
              {formatAmount(item.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export const ActivityFeed = React.memo(ActivityFeedInner);
