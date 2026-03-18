import { useMemo } from "react";
import { subMonths, format } from "date-fns";
import type { Transaction } from "@/types/transaction";

export function useBarChartData(
  transactions: Transaction[],
  rangeMonths: number,
): Array<{ date: string; amount: number }> {
  return useMemo(() => {
    const now = new Date();
    const barBucketKeys: string[] = [];
    const barBucketLookup: Record<string, number> = {};
    const barDisplayLabels: Record<string, string> = {};

    for (let i = rangeMonths - 1; i >= 0; i--) {
      const month = subMonths(now, i);
      const lookupKey = format(month, "yyyy-MM");
      const displayLabel = format(month, "MMM");
      barBucketKeys.push(lookupKey);
      barBucketLookup[lookupKey] = 0;
      barDisplayLabels[lookupKey] = displayLabel;
    }

    for (const tx of transactions) {
      if (tx.type === "DEBIT") {
        const amount = Math.abs(parseFloat(tx.amount));
        const barKey = format(new Date(tx.date), "yyyy-MM");
        if (barKey in barBucketLookup) {
          barBucketLookup[barKey]! += amount;
        }
      }
    }

    return barBucketKeys.map((key) => ({
      date: barDisplayLabels[key]!,
      amount: barBucketLookup[key]!,
    }));
  }, [transactions, rangeMonths]);
}
