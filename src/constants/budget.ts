export const BUDGET_THRESHOLDS = [
  {
    level: 100,
    flag: "threshold_100_alert_sent" as const,
    title: "Budget Limit Reached",
  },
  {
    level: 90,
    flag: "threshold_90_alert_sent" as const,
    title: "Budget Warning (90%)",
  },
  {
    level: 70,
    flag: "threshold_70_alert_sent" as const,
    title: "Budget Alert (70%)",
  },
];
