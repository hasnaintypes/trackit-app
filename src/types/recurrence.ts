export type RecurringOverrides = {
  skipped: string[]; // ISO date strings of skipped occurrences
  rescheduled: Record<string, string>; // original ISO date → new ISO date
};

export type RecurrenceConfig = {
  frequency: "DAILY" | "WEEKLY" | "SEMI_MONTHLY" | "MONTHLY" | "YEARLY";
  interval?: number | null;
  dayOfMonth?: number | null;
  semiMonthlyDay?: number | null;
  dayOfWeek?: number | null;
  weekOfMonth?: number | null;
  lastDayOfMonth?: boolean | null;
  overrides?: RecurringOverrides | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  nextRunAt?: Date | string | null;
};
