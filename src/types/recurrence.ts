export type RecurrenceConfig = {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval?: number | null;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  nextRunAt?: Date | string | null;
};
