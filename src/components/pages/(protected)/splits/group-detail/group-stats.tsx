"use client";

import React from "react";
import { Receipt, PieChart, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupStatsProps {
  totalSpent: number;
  yourShare: number;
  yourBalance: number;
  isLoading?: boolean;
  formatAmount: (value: string | number) => string;
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

function GroupStatsInner({
  totalSpent,
  yourShare,
  yourBalance,
  isLoading,
  formatAmount,
}: GroupStatsProps) {
  const stats = [
    {
      title: "Total Spent",
      value: formatAmount(totalSpent),
      subtitle: "Group total",
      icon: Receipt,
      iconBg:
        "bg-violet-100 text-violet-600 dark:bg-violet-900/60 dark:text-violet-400",
      chartColor: "#8b5cf6",
    },
    {
      title: "Your Share",
      value: formatAmount(yourShare),
      subtitle: "What you owe in total",
      icon: PieChart,
      iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-900/60 dark:text-sky-400",
      chartColor: "#0ea5e9",
    },
    {
      title: "Your Balance",
      value: formatAmount(Math.abs(yourBalance)),
      subtitle:
        yourBalance > 0
          ? "You are owed"
          : yourBalance < 0
            ? "You owe"
            : "All settled",
      prefix: yourBalance > 0 ? "+" : yourBalance < 0 ? "-" : "",
      icon: Wallet,
      iconBg:
        yourBalance >= 0
          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400"
          : "bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-400",
      changeColor:
        yourBalance > 0
          ? "text-emerald-600 dark:text-emerald-400"
          : yourBalance < 0
            ? "text-rose-600 dark:text-rose-400"
            : "",
      chartColor: yourBalance >= 0 ? "#10b981" : "#ef4444",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card relative overflow-hidden rounded-xl border px-6 py-5 shadow-md dark:border-white/10"
        >
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

export const GroupStats = React.memo(GroupStatsInner);
