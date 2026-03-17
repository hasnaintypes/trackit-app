import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import type { RecurrenceConfig } from "@/types/recurrence";

/**
 * Compute the next run time after the provided anchor (defaults to nextRunAt or startDate).
 * Returns null when the recurrence would exceed the configured end date.
 */
export function calculateNextRunAt(
  config: RecurrenceConfig,
  anchor?: Date | string,
): Date | null {
  const interval = config.interval && config.interval > 0 ? config.interval : 1;
  const base = anchor ?? config.nextRunAt ?? config.startDate;
  const from = base instanceof Date ? base : new Date(base);

  let next: Date;

  switch (config.frequency) {
    case "DAILY":
      next = addDays(from, interval);
      break;
    case "WEEKLY": {
      const desiredDow =
        typeof config.dayOfWeek === "number"
          ? config.dayOfWeek
          : from.getUTCDay();
      // Start from current week boundary and move forward interval weeks, landing on desiredDow
      const currentDow = from.getUTCDay();
      const daysUntil = (7 - currentDow + desiredDow) % 7 || 7;
      const target = addDays(from, daysUntil);
      next = addWeeks(target, interval - 1);
      break;
    }
    case "MONTHLY": {
      const candidate = addMonths(from, interval);
      if (typeof config.dayOfMonth === "number") {
        const safeDay = Math.min(
          Math.max(config.dayOfMonth, 1),
          daysInMonth(candidate.getUTCFullYear(), candidate.getUTCMonth()),
        );
        candidate.setUTCDate(safeDay);
      }
      next = candidate;
      break;
    }
    case "YEARLY":
    default: {
      const candidate = addYears(from, interval);
      next = candidate;
      break;
    }
  }

  if (config.endDate) {
    const end =
      config.endDate instanceof Date
        ? config.endDate
        : new Date(config.endDate);
    if (next > end) return null;
  }

  return next;
}

function daysInMonth(year: number, monthIndexZeroBased: number): number {
  return new Date(Date.UTC(year, monthIndexZeroBased + 1, 0)).getUTCDate();
}
