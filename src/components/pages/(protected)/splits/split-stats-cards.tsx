"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormatter } from "@/hooks/use-formatter";

interface SplitStatsCardsProps {
  youOwe: number;
  youAreOwed: number;
  isLoading?: boolean;
}

function DecorativeChart({ color }: { color: string }) {
  return (
    <svg
      className="h-12 w-16"
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="28"
        width="8"
        height="20"
        rx="2"
        fill={color}
        opacity="0.3"
      />
      <rect
        x="14"
        y="18"
        width="8"
        height="30"
        rx="2"
        fill={color}
        opacity="0.45"
      />
      <rect
        x="26"
        y="24"
        width="8"
        height="24"
        rx="2"
        fill={color}
        opacity="0.35"
      />
      <rect
        x="38"
        y="10"
        width="8"
        height="38"
        rx="2"
        fill={color}
        opacity="0.55"
      />
      <rect
        x="50"
        y="4"
        width="8"
        height="44"
        rx="2"
        fill={color}
        opacity="0.7"
      />
      <path
        d="M6 30 L18 20 L30 26 L42 12 L54 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}

function SplitStatsCardsInner({
  youOwe,
  youAreOwed,
  isLoading,
}: SplitStatsCardsProps) {
  const { formatAmount } = useFormatter();
  const netBalance = youAreOwed - youOwe;

  const stats = [
    {
      title: "You Owe",
      value: formatAmount(youOwe),
      subtitle: youOwe > 0 ? "Settle up to clear" : "All settled up!",
      icon: ArrowUpRight,
      iconBg:
        "bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-400",
      chartColor: "#f43f5e",
    },
    {
      title: "You Are Owed",
      value: formatAmount(youAreOwed),
      subtitle: youAreOwed > 0 ? "Pending from friends" : "No pending amounts",
      icon: ArrowDownRight,
      iconBg:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400",
      chartColor: "#10b981",
    },
    {
      title: "Net Balance",
      value: formatAmount(Math.abs(netBalance)),
      subtitle:
        netBalance > 0
          ? "You're owed overall"
          : netBalance < 0
            ? "You owe overall"
            : "All squared up",
      prefix: netBalance > 0 ? "+" : netBalance < 0 ? "-" : "",
      icon: Wallet,
      iconBg:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400",
      chartColor: "#3b82f6",
      changeColor:
        netBalance > 0
          ? "text-emerald-600 dark:text-emerald-400"
          : netBalance < 0
            ? "text-rose-600 dark:text-rose-400"
            : "",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card relative overflow-hidden rounded-xl border px-6 py-5 shadow-md dark:border-white/10"
        >
          {/* Header: Title + Subtitle + Icon Badge */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground text-sm font-semibold">
                {stat.title}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {stat.subtitle}
              </p>
            </div>
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                stat.iconBg,
              )}
            >
              <stat.icon className="h-5 w-5" />
            </div>
          </div>

          {/* Value + Decorative Chart */}
          <div className="mt-5 flex items-end justify-between">
            <div>
              {isLoading ? (
                <div className="bg-muted h-9 w-32 animate-pulse rounded" />
              ) : (
                <p
                  className={cn(
                    "text-3xl font-bold tracking-tight",
                    "changeColor" in stat && stat.changeColor,
                  )}
                >
                  {"prefix" in stat && stat.prefix
                    ? `${stat.prefix}${stat.value}`
                    : stat.value}
                </p>
              )}
            </div>

            <DecorativeChart color={stat.chartColor} />
          </div>
        </div>
      ))}
    </div>
  );
}

export const SplitStatsCards = React.memo(SplitStatsCardsInner);
