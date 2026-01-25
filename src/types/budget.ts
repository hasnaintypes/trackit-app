export type BudgetPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" | "CUSTOM";

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: string; // decimal as string
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date | null;
  spentAmount: string; // decimal as string
  threshold_70_alert_sent: boolean;
  threshold_90_alert_sent: boolean;
  threshold_100_alert_sent: boolean;
  createdAt: Date;
  updatedAt: Date;
}
