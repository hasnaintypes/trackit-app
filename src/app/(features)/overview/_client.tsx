"use client";

import React, { useMemo, useCallback, useState } from "react";
import { api } from "@/trpc/react";
import { invalidateTransactions } from "@/trpc/invalidation";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useOverviewStats } from "./_hooks/use-overview-stats";
import { useBarChartData } from "./_hooks/use-bar-chart-data";
import { usePieChartData } from "./_hooks/use-pie-chart-data";
import { StatsCards } from "@/components/pages/(protected)/overview/stats-cards";
import { RecentTransactions } from "@/components/pages/(protected)/overview/recent-transactions";
import {
  SpendingOverviewCard,
  type DateRange,
} from "@/components/pages/(protected)/overview/spending-overview-card";
import { SpendingByCategoryCard } from "@/components/pages/(protected)/overview/spending-by-category-card";
import { useFormatter } from "@/hooks/use-formatter";
import type { Transaction } from "@/types/transaction";

export default function OverviewPageClient() {
  const { formatAmount } = useFormatter();
  const [barRange, setBarRange] = useState<DateRange>("6");

  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { listQuery, remove } = useTransactions();
  const { allFlat, categoryMap } = useCategories();
  const utils = api.useUtils();

  const handleEditTransaction = useCallback((_transaction: Transaction) => {
    // TODO: wire up transaction edit dialog
  }, []);

  const handleDeleteTransactions = useCallback(
    async (ids: string[]) => {
      try {
        await Promise.all(ids.map((id) => remove.mutateAsync({ id })));
        await invalidateTransactions(utils);
      } catch {
        // deletion errors are surfaced by the mutation's own error state
      }
    },
    [remove, utils],
  );

  const { data: txData, isLoading: txLoading } = listQuery({ limit: 100 });

  const transactions = useMemo(
    () => txData?.transactions ?? [],
    [txData?.transactions],
  );

  const rangeMonths = parseInt(barRange);

  const statsData = useOverviewStats(accounts, transactions);
  const barChartData = useBarChartData(transactions, rangeMonths);
  const categories = useMemo(() => allFlat.data ?? [], [allFlat.data]);
  const { pieChartData, pieChartConfig } = usePieChartData(
    transactions,
    categoryMap,
    categories,
  );

  return (
    <div className="space-y-8">
      <StatsCards
        balance={statsData.balance}
        income={statsData.income}
        spending={statsData.spending}
        isLoading={accountsLoading || txLoading}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <SpendingOverviewCard
          barChartData={barChartData}
          barRange={barRange}
          onBarRangeChange={setBarRange}
          formatAmount={formatAmount}
        />
        <SpendingByCategoryCard
          pieChartData={pieChartData}
          pieChartConfig={pieChartConfig}
          formatAmount={formatAmount}
        />
      </div>

      <RecentTransactions
        transactions={transactions}
        isLoading={txLoading}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransactions}
        onView={handleEditTransaction}
      />
    </div>
  );
}
