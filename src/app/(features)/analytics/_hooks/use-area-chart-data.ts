import { useMemo } from "react";
import { subMonths, format } from "date-fns";
import type { Transaction } from "@/types/transaction";

export type ChartGranularity = "daily" | "monthly";

interface ChartDataPoint {
  [key: string]: unknown;
  date: string;
  displayDate: string;
  income: number;
  expense: number;
}

export function useAreaChartData(
  transactions: Transaction[],
  rangeMonths: number,
  granularity: ChartGranularity = "daily",
): ChartDataPoint[] {
  return useMemo(() => {
    const now = new Date();
    const cutoff = subMonths(now, rangeMonths);

    const isMonthly = granularity === "monthly";
    const buckets: Record<
      string,
      { sortKey: string; displayDate: string; income: number; expense: number }
    > = {};

    for (const tx of transactions) {
      const txDate = new Date(tx.date);
      if (txDate < cutoff) continue;

      const amt = Math.abs(parseFloat(tx.amount));
      const sortKey = isMonthly
        ? format(txDate, "yyyy-MM")
        : format(txDate, "yyyy-MM-dd");
      const displayDate = isMonthly
        ? format(txDate, "MMM yyyy")
        : format(txDate, "MMM dd");

      buckets[sortKey] ??= { sortKey, displayDate, income: 0, expense: 0 };
      const bucket = buckets[sortKey];
      if (bucket) {
        if (tx.type === "CREDIT") bucket.income += amt;
        else if (tx.type === "DEBIT") bucket.expense += amt;
      }
    }

    return Object.values(buckets)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ displayDate, income, expense }) => ({
        date: displayDate,
        displayDate,
        income,
        expense,
      }));
  }, [transactions, rangeMonths, granularity]);
}
