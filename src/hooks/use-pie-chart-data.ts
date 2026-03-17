import { useMemo } from "react";
import type { Transaction } from "@/types/transaction";
import type { ChartConfig } from "@/components/ui/chart";

interface PieChartItem {
  name: string;
  value: number;
  fill: string;
}

interface CategoryLike {
  name: string;
  color: string | null;
}

export function usePieChartData(
  transactions: Transaction[],
  categoryMap: Map<string, string>,
  categories: CategoryLike[],
): { pieChartData: PieChartItem[]; pieChartConfig: ChartConfig } {
  const pieChartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    for (const tx of transactions) {
      if (tx.type === "DEBIT") {
        const amount = Math.abs(parseFloat(tx.amount));
        const catName = tx.categoryId
          ? (categoryMap.get(tx.categoryId) ?? "Other")
          : "Uncategorized";
        categoryTotals[catName] = (categoryTotals[catName] ?? 0) + amount;
      }
    }

    return Object.entries(categoryTotals).map(([name, value], index) => {
      const category = categories.find((c) => c.name === name);
      const fill = category?.color ?? `var(--chart-${(index % 5) + 1})`;
      return { name, value, fill };
    });
  }, [transactions, categoryMap, categories]);

  const pieChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    for (const item of pieChartData) {
      config[item.name] = { label: item.name, color: item.fill };
    }
    return config;
  }, [pieChartData]);

  return { pieChartData, pieChartConfig };
}
