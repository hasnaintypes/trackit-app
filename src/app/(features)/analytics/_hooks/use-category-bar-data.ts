import { useMemo } from "react";
import type { Transaction } from "@/types/transaction";
import type { ChartConfig } from "@ui/chart";

interface CategoryLike {
  id: string;
  name: string;
  color: string | null;
}

interface CategoryBarItem {
  [key: string]: unknown;
  category: string;
  amount: number;
  fill: string;
}

export function useCategoryBarData(
  transactions: Transaction[],
  categoryMap: Map<string, string>,
  categories: CategoryLike[],
): { data: CategoryBarItem[]; config: ChartConfig } {
  const data = useMemo(() => {
    const totals: Record<string, number> = {};

    for (const tx of transactions) {
      if (tx.type === "DEBIT") {
        const amount = Math.abs(parseFloat(tx.amount));
        const catName = tx.categoryId
          ? (categoryMap.get(tx.categoryId) ?? "Other")
          : "Uncategorized";
        totals[catName] = (totals[catName] ?? 0) + amount;
      }
    }

    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, amount], index) => {
        const category = categories.find((c) => c.name === name);
        const fill = category?.color ?? `var(--chart-${(index % 5) + 1})`;
        return { category: name, amount, fill };
      });
  }, [transactions, categoryMap, categories]);

  const config = useMemo(() => {
    const cfg: ChartConfig = {};
    for (const item of data) {
      // Sanitize key — CSS custom property names cannot contain / or &
      const key = item.category.replace(/[^a-zA-Z0-9-_]/g, "-");
      cfg[key] = { label: item.category, color: item.fill };
    }
    return cfg;
  }, [data]);

  return { data, config };
}
