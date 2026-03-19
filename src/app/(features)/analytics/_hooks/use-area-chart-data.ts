import { useMemo } from "react";
import { subMonths, format } from "date-fns";
import type { Transaction } from "@/types/transaction";

export function useAreaChartData(
  transactions: Transaction[],
  rangeMonths: number,
): Array<{
  date: string;
  displayDate: string;
  income: number;
  expense: number;
}> {
  return useMemo(() => {
    const now = new Date();
    const cutoff = subMonths(now, rangeMonths);

    const buckets: Record<
      string,
      { sortKey: string; displayDate: string; income: number; expense: number }
    > = {};

    for (const tx of transactions) {
      const txDate = new Date(tx.date);
      if (txDate < cutoff) continue;

      const amt = Math.abs(parseFloat(tx.amount));
      const sortKey = format(txDate, "yyyy-MM-dd");
      const displayDate = format(txDate, "MMM dd");

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
  }, [transactions, rangeMonths]);
}
