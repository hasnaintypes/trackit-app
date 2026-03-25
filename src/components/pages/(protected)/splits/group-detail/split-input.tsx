"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@ui/avatar";
import { Input } from "@ui/input";
import { Progress } from "@ui/progress";
import { Toggle } from "@ui/toggle";
import type { SplitMethod } from "@/types/expense";

const MEMBER_COLORS = [
  "#8b5cf6",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
];

export interface SplitParticipant {
  contactId: string | null;
  name: string;
  avatarUrl: string | null;
  isPayer: boolean;
  paidAmount: number;
  customValue?: number;
}

interface SplitInputProps {
  totalAmount: number;
  splitMethod: SplitMethod;
  participants: SplitParticipant[];
  onChange: (participants: SplitParticipant[]) => void;
  formatAmount: (value: string | number) => string;
}

function SplitInputInner({
  totalAmount,
  splitMethod,
  participants,
  onChange,
  formatAmount,
}: SplitInputProps) {
  const isReadOnly = splitMethod === "EQUAL";
  const count = participants.length || 1;

  const getOwedAmount = useCallback(
    (p: SplitParticipant, index: number): number => {
      switch (splitMethod) {
        case "EQUAL": {
          const base = Math.floor((totalAmount * 100) / count) / 100;
          const remainder =
            Math.round(totalAmount * 100) - Math.round(base * 100) * count;
          return index < remainder ? base + 0.01 : base;
        }
        case "EXACT":
          return p.customValue ?? 0;
        case "PERCENTAGE":
          return (
            Math.round(((p.customValue ?? 0) / 100) * totalAmount * 100) / 100
          );
        case "SHARES": {
          const totalShares = participants.reduce(
            (sum, pp) => sum + (pp.customValue ?? 1),
            0,
          );
          if (totalShares === 0) return 0;
          return (
            Math.round(
              ((p.customValue ?? 1) / totalShares) * totalAmount * 100,
            ) / 100
          );
        }
        default:
          return 0;
      }
    },
    [splitMethod, totalAmount, count, participants],
  );

  const getProgressValue = useCallback(
    (p: SplitParticipant, index: number): number => {
      if (totalAmount === 0) return 0;
      switch (splitMethod) {
        case "EQUAL":
          return 100 / count;
        case "EXACT":
          return totalAmount > 0
            ? ((p.customValue ?? 0) / totalAmount) * 100
            : 0;
        case "PERCENTAGE":
          return p.customValue ?? 0;
        case "SHARES": {
          const totalShares = participants.reduce(
            (sum, pp) => sum + (pp.customValue ?? 1),
            0,
          );
          return totalShares > 0
            ? ((p.customValue ?? 1) / totalShares) * 100
            : 0;
        }
        default:
          return (getOwedAmount(p, index) / totalAmount) * 100;
      }
    },
    [splitMethod, totalAmount, count, participants, getOwedAmount],
  );

  const handlePayerToggle = useCallback(
    (index: number) => {
      const updated = participants.map((p, i) => ({
        ...p,
        isPayer: i === index ? !p.isPayer : p.isPayer,
        paidAmount:
          i === index ? (!p.isPayer ? totalAmount : 0) : p.isPayer ? 0 : 0,
      }));
      // Recalculate: if only one payer, they pay the full amount
      const payerCount = updated.filter((p) => p.isPayer).length;
      if (payerCount === 1) {
        const payerIdx = updated.findIndex((p) => p.isPayer);
        updated[payerIdx]!.paidAmount = totalAmount;
      } else if (payerCount > 1) {
        const perPayer = Math.round((totalAmount / payerCount) * 100) / 100;
        updated.forEach((p) => {
          if (p.isPayer) p.paidAmount = perPayer;
        });
      }
      onChange(updated);
    },
    [participants, totalAmount, onChange],
  );

  const handleCustomValueChange = useCallback(
    (index: number, value: string) => {
      const num = parseFloat(value) || 0;
      const updated = participants.map((p, i) =>
        i === index ? { ...p, customValue: num } : p,
      );
      onChange(updated);
    },
    [participants, onChange],
  );

  const getInputLabel = (): string => {
    switch (splitMethod) {
      case "EXACT":
        return "Amount";
      case "PERCENTAGE":
        return "%";
      case "SHARES":
        return "Shares";
      default:
        return "";
    }
  };

  // Validation helpers
  const validationMessage = (): string | null => {
    if (splitMethod === "EXACT") {
      const sum = participants.reduce((s, p) => s + (p.customValue ?? 0), 0);
      const diff = Math.round((totalAmount - sum) * 100) / 100;
      if (diff !== 0) return `${diff > 0 ? "+" : ""}${diff} remaining`;
    }
    if (splitMethod === "PERCENTAGE") {
      const sum = participants.reduce((s, p) => s + (p.customValue ?? 0), 0);
      if (Math.round(sum) !== 100) return `${Math.round(100 - sum)}% remaining`;
    }
    return null;
  };

  const validation = validationMessage();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          Split Details
        </span>
        {validation && (
          <span className="text-destructive text-xs font-medium">
            {validation}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {participants.map((p, index) => {
          const owedAmount = getOwedAmount(p, index);
          const progressValue = getProgressValue(p, index);
          const color = MEMBER_COLORS[index % MEMBER_COLORS.length]!;

          return (
            <div key={p.contactId ?? "self"} className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                {/* Avatar */}
                <Avatar className="h-7 w-7">
                  <AvatarFallback
                    className="text-[10px] font-medium text-white"
                    style={{ backgroundColor: color }}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {p.name}
                </span>

                {/* Payer toggle */}
                <Toggle
                  size="sm"
                  pressed={p.isPayer}
                  onPressedChange={() => handlePayerToggle(index)}
                  className={cn(
                    "h-6 px-2 text-[10px]",
                    p.isPayer &&
                      "bg-primary/10 text-primary border-primary/30 border",
                  )}
                >
                  Paid
                </Toggle>

                {/* Custom value input */}
                {!isReadOnly && (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={p.customValue ?? ""}
                      onChange={(e) =>
                        handleCustomValueChange(index, e.target.value)
                      }
                      className="h-7 w-20 text-right text-xs"
                      placeholder={getInputLabel()}
                      min={0}
                      step={splitMethod === "SHARES" ? 1 : 0.01}
                    />
                    {splitMethod === "PERCENTAGE" && (
                      <span className="text-muted-foreground text-xs">%</span>
                    )}
                  </div>
                )}

                {/* Owed amount */}
                <span className="w-20 text-right text-sm font-semibold tabular-nums">
                  {formatAmount(owedAmount)}
                </span>
              </div>

              {/* Progress bar */}
              <Progress
                value={Math.min(progressValue, 100)}
                className="mt-2 h-1.5 [&>div]:transition-all [&>div]:duration-300"
                style={
                  {
                    "--progress-color": color,
                  } as React.CSSProperties
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const SplitInput = React.memo(SplitInputInner);
