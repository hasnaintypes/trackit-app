import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import type { RecurrenceConfig } from "@/types/recurrence";

/**
 * Compute the next run time after the provided anchor (defaults to nextRunAt or startDate).
 * Returns null when the recurrence would exceed the configured end date.
 */
export function calculateNextRunAt(
  config: RecurrenceConfig,
  anchor?: Date | string,
  _depth = 0,
): Date | null {
  // Guard against infinite recursion from skipped dates
  if (_depth > 100) return null;

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
      const currentDow = from.getUTCDay();
      const daysUntil = (7 - currentDow + desiredDow) % 7 || 7;
      const target = addDays(from, daysUntil);
      next = addWeeks(target, interval - 1);
      break;
    }

    case "SEMI_MONTHLY": {
      next = computeSemiMonthly(from, config.dayOfMonth, config.semiMonthlyDay);
      break;
    }

    case "MONTHLY": {
      if (config.lastDayOfMonth) {
        // Always land on the last day of the target month
        const candidate = addMonths(from, interval);
        const lastDay = daysInMonth(
          candidate.getUTCFullYear(),
          candidate.getUTCMonth(),
        );
        candidate.setUTCDate(lastDay);
        next = candidate;
      } else if (
        typeof config.weekOfMonth === "number" &&
        typeof config.dayOfWeek === "number"
      ) {
        // Nth weekday pattern (e.g., "2nd Tuesday")
        next = computeNthWeekday(
          from,
          interval,
          config.weekOfMonth,
          config.dayOfWeek,
        );
      } else {
        // Standard monthly with specific day
        const candidate = addMonths(from, interval);
        if (typeof config.dayOfMonth === "number") {
          const safeDay = Math.min(
            Math.max(config.dayOfMonth, 1),
            daysInMonth(candidate.getUTCFullYear(), candidate.getUTCMonth()),
          );
          candidate.setUTCDate(safeDay);
        }
        next = candidate;
      }
      break;
    }

    case "YEARLY":
    default: {
      next = addYears(from, interval);
      break;
    }
  }

  // Check end date
  if (config.endDate) {
    const end =
      config.endDate instanceof Date
        ? config.endDate
        : new Date(config.endDate);
    if (next > end) return null;
  }

  // Handle overrides (skipped/rescheduled dates)
  if (config.overrides) {
    const overrides = config.overrides;
    const key = formatDateKey(next);

    // If this date was skipped, recurse to find the next valid date
    if (overrides.skipped?.includes(key)) {
      return calculateNextRunAt(config, next, _depth + 1);
    }

    // If this date was rescheduled, return the new date
    if (overrides.rescheduled?.[key]) {
      return new Date(overrides.rescheduled[key]);
    }
  }

  return next;
}

/**
 * Compute the next semi-monthly date.
 * Alternates between dayOfMonth (first) and semiMonthlyDay (second).
 */
function computeSemiMonthly(
  from: Date,
  day1?: number | null,
  day2?: number | null,
): Date {
  const firstDay = day1 ?? 1;
  const secondDay = day2 ?? 15;

  const year = from.getUTCFullYear();
  const month = from.getUTCMonth();
  const currentDate = from.getUTCDate();

  // Determine the next occurrence: either day2 in current month, or day1 in next month
  const maxDaysCurrent = daysInMonth(year, month);
  const safeFirst = Math.min(firstDay, maxDaysCurrent);
  const safeSecond = Math.min(secondDay, maxDaysCurrent);

  if (currentDate < safeFirst) {
    // Next is first day this month
    return new Date(Date.UTC(year, month, safeFirst));
  } else if (currentDate < safeSecond) {
    // Next is second day this month
    return new Date(Date.UTC(year, month, safeSecond));
  } else {
    // Next is first day next month
    const nextMonth = month + 1;
    const nextYear = nextMonth > 11 ? year + 1 : year;
    const normalizedMonth = nextMonth % 12;
    const maxDaysNext = daysInMonth(nextYear, normalizedMonth);
    return new Date(
      Date.UTC(nextYear, normalizedMonth, Math.min(firstDay, maxDaysNext)),
    );
  }
}

/**
 * Compute the Nth weekday of a target month.
 * weekOfMonth: 1-4 = ordinal, 5 = last occurrence of that weekday.
 */
function computeNthWeekday(
  from: Date,
  interval: number,
  weekOfMonth: number,
  dayOfWeek: number,
): Date {
  const target = addMonths(from, interval);
  const year = target.getUTCFullYear();
  const month = target.getUTCMonth();

  if (weekOfMonth === 5) {
    // Last occurrence of dayOfWeek in the month
    const lastDay = daysInMonth(year, month);
    const lastDate = new Date(Date.UTC(year, month, lastDay));
    const lastDow = lastDate.getUTCDay();
    const diff = (lastDow - dayOfWeek + 7) % 7;
    return new Date(Date.UTC(year, month, lastDay - diff));
  }

  // Nth occurrence (1-4)
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const firstDow = firstOfMonth.getUTCDay();
  const daysUntilTarget = (dayOfWeek - firstDow + 7) % 7;
  const nthDay = 1 + daysUntilTarget + (weekOfMonth - 1) * 7;

  // Clamp to month bounds
  const maxDays = daysInMonth(year, month);
  if (nthDay > maxDays) {
    // Fallback to last occurrence if Nth doesn't exist
    const lastDate = new Date(Date.UTC(year, month, maxDays));
    const lastDow = lastDate.getUTCDay();
    const diff = (lastDow - dayOfWeek + 7) % 7;
    return new Date(Date.UTC(year, month, maxDays - diff));
  }

  return new Date(Date.UTC(year, month, nthDay));
}

/** Format a Date as YYYY-MM-DD for override key comparison */
export function formatDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysInMonth(year: number, monthIndexZeroBased: number): number {
  return new Date(Date.UTC(year, monthIndexZeroBased + 1, 0)).getUTCDate();
}
