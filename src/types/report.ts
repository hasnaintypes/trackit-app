export interface MonthlySummaryData {
  period: string;
  periodStart: string;
  periodEnd: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  transactionCount: number;
  categorySpending: Record<string, number>;
  budgetStatus: Array<{
    category: string;
    limit: number;
    spent: number;
    percentage: number;
  }>;
  topCategories: Array<{
    name: string;
    amount: number;
  }>;
}

export interface BudgetExceededData {
  budgetId: string;
  categoryName: string;
  limit: number;
  spent: number;
  exceeded: number;
  percentage: number;
  period: string;
}

export type ReportData = MonthlySummaryData | BudgetExceededData;
