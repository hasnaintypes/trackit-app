"use client";

import React from "react";
import {
  Receipt,
  MoreHorizontal,
  Trash2,
  Users as UsersIcon,
  Percent,
  Hash,
  Equal,
  type LucideIcon,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { generateNamedAvatar } from "@/lib/shared/avatar";
import type { Expense, SplitMethod } from "@/types/expense";

const SPLIT_METHOD_CONFIG: Record<
  SplitMethod,
  { icon: React.ElementType; label: string }
> = {
  EQUAL: { icon: Equal, label: "Equal" },
  EXACT: { icon: Hash, label: "Exact" },
  PERCENTAGE: { icon: Percent, label: "Percent" },
  SHARES: { icon: UsersIcon, label: "Shares" },
};

interface ExpenseListProps {
  expenses: Expense[];
  isLoading?: boolean;
  formatAmount: (value: string | number) => string;
  formatDate: (date: string | Date) => string;
  onDelete: (id: string) => void;
}

function ExpenseListInner({
  expenses,
  isLoading,
  formatAmount,
  formatDate,
  onDelete,
}: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border p-3"
          >
            <div className="bg-muted h-10 w-10 animate-pulse rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <div className="bg-muted h-4 w-40 animate-pulse rounded" />
              <div className="bg-muted h-3 w-24 animate-pulse rounded" />
            </div>
            <div className="bg-muted h-5 w-20 animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
        <Receipt className="text-muted-foreground/40 mb-2 h-8 w-8" />
        <p className="text-muted-foreground text-sm font-medium">
          No expenses yet
        </p>
        <p className="text-muted-foreground/60 mt-1 text-xs">
          Add your first expense to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {expenses.map((expense) => {
        const splitConfig = SPLIT_METHOD_CONFIG[expense.splitMethod];
        const SplitIcon = splitConfig.icon;
        const categoryIconName = expense.category?.icon ?? "";
        const categoryColor = expense.category?.color ?? "#6366f1";
        const payer = expense.participants.find((p) => p.isPayer);
        const payerName = payer?.contact?.name ?? "You";

        // Resolve lucide icon by name (e.g. "shield" → Shield)
        const pascalName = categoryIconName
          .split("-")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join("");
        const CategoryIcon =
          (LucideIcons as unknown as Record<string, LucideIcon>)[pascalName] ??
          Receipt;

        return (
          <div
            key={expense.id}
            className="bg-card hover:bg-muted/30 group flex items-center gap-3 rounded-xl border p-3 transition-colors dark:border-white/10"
          >
            {/* Category icon */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: `${categoryColor}20`,
                color: categoryColor,
              }}
            >
              <CategoryIcon className="h-5 w-5" />
            </div>

            {/* Description + meta */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {expense.description}
              </p>
              <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                <span>{formatDate(expense.date)}</span>
                <span className="text-muted-foreground/40">·</span>
                <span>Paid by {payerName}</span>
                <Badge
                  variant="secondary"
                  className="gap-0.5 px-1 py-0 text-[10px]"
                >
                  <SplitIcon className="h-2.5 w-2.5" />
                  {splitConfig.label}
                </Badge>
              </div>
            </div>

            {/* Participant avatars */}
            <div className="hidden items-center gap-1 sm:flex">
              <div className="flex -space-x-1.5">
                {expense.participants.slice(0, 3).map((p) => {
                  const pName = p.contact?.name ?? "You";
                  const pAvatar =
                    p.contact?.avatarUrl ?? generateNamedAvatar(pName);
                  return (
                    <Avatar
                      key={p.id}
                      className={cn(
                        "border-background h-6 w-6 border",
                        p.isPayer && "ring-primary ring-1",
                      )}
                    >
                      <AvatarImage src={pAvatar} />
                      <AvatarFallback className="bg-muted text-[9px]">
                        {pName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
              </div>
              {expense.participants.length > 3 && (
                <span className="text-muted-foreground text-[10px]">
                  +{expense.participants.length - 3}
                </span>
              )}
            </div>

            {/* Amount */}
            <span className="text-sm font-semibold tabular-nums">
              {formatAmount(expense.amount)}
            </span>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onDelete(expense.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </div>
  );
}

export const ExpenseList = React.memo(ExpenseListInner);
