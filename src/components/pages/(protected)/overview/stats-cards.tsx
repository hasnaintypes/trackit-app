"use client";

import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormatter } from "@/hooks/use-formatter";

interface StatCardData {
  title: string;
  dateRange: string;
  value: string;
  changePercent: number | null;
  changeLabel: string;
}

interface StatsCardsProps {
  balance: StatCardData;
  income: StatCardData;
  spending: StatCardData;
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
      {/* Bars */}
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
      {/* Trend line */}
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

export function StatsCards({
  balance,
  income,
  spending,
  isLoading,
}: StatsCardsProps) {
  const { formatAmount } = useFormatter();

  const stats = [
    {
      ...balance,
      formattedValue: formatAmount(balance.value),
      icon: Wallet,
      iconBg:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400",
      changeColor: "text-emerald-600 dark:text-emerald-400",
      chartColor: "#3b82f6",
    },
    {
      ...income,
      formattedValue: formatAmount(income.value),
      icon: ArrowUpRight,
      iconBg:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400",
      changeColor: "text-emerald-600 dark:text-emerald-400",
      chartColor: "#10b981",
    },
    {
      ...spending,
      formattedValue: formatAmount(spending.value),
      icon: ArrowDownRight,
      iconBg:
        "bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-400",
      changeColor: "text-rose-600 dark:text-rose-400",
      chartColor: "#f43f5e",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card relative overflow-hidden rounded-xl border px-6 py-5 shadow-md dark:border-white/10"
        >
          {/* Header: Title + Date + Icon Badge */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground text-sm font-semibold">
                {stat.title}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {stat.dateRange}
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

          {/* Value + Chart */}
          <div className="mt-5 flex items-end justify-between">
            <div>
              {isLoading ? (
                <div className="bg-muted h-9 w-32 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold tracking-tight">
                  {stat.formattedValue}
                </p>
              )}

              {/* Percentage change */}
              {isLoading ? (
                <div className="bg-muted mt-2 h-4 w-24 animate-pulse rounded" />
              ) : stat.changePercent !== null ? (
                <p
                  className={cn(
                    "mt-1.5 text-sm font-medium",
                    stat.changePercent >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  {stat.changePercent >= 0 ? "+" : ""}
                  {stat.changePercent}% {stat.changeLabel}
                </p>
              ) : null}
            </div>

            {/* Decorative chart */}
            <DecorativeChart color={stat.chartColor} />
          </div>
        </div>
      ))}
    </div>
  );
}
