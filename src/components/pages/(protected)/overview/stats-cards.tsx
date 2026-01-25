"use client";

import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { useFormatter } from "@/hooks/use-formatter";

interface StatsCardsProps {
  totalBalance: string;
  totalIncome: string;
  totalExpense: string;
  isLoading?: boolean;
}

export function StatsCards({
  totalBalance,
  totalIncome,
  totalExpense,
  isLoading,
}: StatsCardsProps) {
  const { formatAmount } = useFormatter();

  const stats = [
    {
      title: "Total Balance",
      value: formatAmount(totalBalance),
      icon: Wallet,
      description: "Across all accounts",
      color: "text-blue-600",
    },
    {
      title: "Income",
      value: formatAmount(totalIncome),
      icon: ArrowUpRight,
      description: "In selected period",
      color: "text-green-600",
    },
    {
      title: "Expenses",
      value: formatAmount(totalExpense),
      icon: ArrowDownRight,
      description: "In selected period",
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="bg-muted h-7 w-24 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold">{stat.value}</div>
            )}
            <p className="text-muted-foreground text-xs">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
