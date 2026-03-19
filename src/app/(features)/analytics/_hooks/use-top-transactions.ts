import { useMemo } from "react";
import type { Transaction } from "@/types/transaction";

interface CategoryLike {
  id: string;
  name: string;
  color: string | null;
  icon?: string | null;
}

export interface TopTransaction {
  id: string;
  description: string;
  amount: string;
  type: Transaction["type"];
  date: string;
  categoryName: string;
  categoryColor: string | null;
  categoryIcon: string | null;
}

export function useTopTransactions(
  transactions: Transaction[],
  categoryMap: Map<string, string>,
  categories: CategoryLike[],
): TopTransaction[] {
  return useMemo(() => {
    const colorMap = new Map<string, string | null>();
    const iconMap = new Map<string, string | null>();
    for (const c of categories) {
      colorMap.set(c.id, c.color);
      iconMap.set(c.id, c.icon ?? null);
    }

    // Show only DEBIT (expenses) so salary doesn't dominate.
    // Pick the top 5 by absolute amount.
    return transactions
      .filter((tx) => tx.type === "DEBIT")
      .sort(
        (a, b) =>
          Math.abs(parseFloat(b.amount)) - Math.abs(parseFloat(a.amount)),
      )
      .slice(0, 5)
      .map((tx) => ({
        id: tx.id,
        description: tx.description ?? "No description",
        amount: tx.amount,
        type: tx.type,
        date: tx.date,
        categoryName: tx.categoryId
          ? (categoryMap.get(tx.categoryId) ?? "Uncategorized")
          : "Uncategorized",
        categoryColor: tx.categoryId
          ? (colorMap.get(tx.categoryId) ?? null)
          : null,
        categoryIcon: tx.categoryId
          ? (iconMap.get(tx.categoryId) ?? null)
          : null,
      }));
  }, [transactions, categoryMap, categories]);
}
