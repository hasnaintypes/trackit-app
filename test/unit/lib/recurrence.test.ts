import { describe, it, expect } from "vitest";
import { calculateNextRunAt } from "@/lib/recurrence";

describe("calculateNextRunAt", () => {
  it("advances daily by 1 day", () => {
    const result = calculateNextRunAt({
      frequency: "DAILY",
      startDate: new Date("2024-01-15"),
    });
    expect(result).toBeInstanceOf(Date);
    expect(result!.toISOString().slice(0, 10)).toBe("2024-01-16");
  });

  it("advances daily by custom interval", () => {
    const result = calculateNextRunAt({
      frequency: "DAILY",
      interval: 3,
      startDate: new Date("2024-01-15"),
    });
    expect(result!.toISOString().slice(0, 10)).toBe("2024-01-18");
  });

  it("advances weekly", () => {
    const result = calculateNextRunAt({
      frequency: "WEEKLY",
      startDate: new Date("2024-01-15"), // Monday
    });
    expect(result).toBeInstanceOf(Date);
    // Should be 7 days later
    const diffDays =
      (result!.getTime() - new Date("2024-01-15").getTime()) /
      (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(7);
  });

  it("advances monthly", () => {
    const result = calculateNextRunAt({
      frequency: "MONTHLY",
      startDate: new Date("2024-01-15"),
    });
    expect(result!.getUTCMonth()).toBe(1); // February
  });

  it("advances monthly with dayOfMonth", () => {
    const result = calculateNextRunAt({
      frequency: "MONTHLY",
      dayOfMonth: 28,
      startDate: new Date("2024-01-15"),
    });
    expect(result!.getUTCDate()).toBe(28);
  });

  it("clamps dayOfMonth for short months", () => {
    const result = calculateNextRunAt({
      frequency: "MONTHLY",
      dayOfMonth: 31,
      startDate: new Date("2024-01-15"),
    });
    // February 2024 has 29 days (leap year)
    expect(result!.getUTCDate()).toBeLessThanOrEqual(29);
  });

  it("advances yearly", () => {
    const result = calculateNextRunAt({
      frequency: "YEARLY",
      startDate: new Date("2024-01-15"),
    });
    expect(result!.getUTCFullYear()).toBe(2025);
  });

  it("returns null when next date exceeds endDate", () => {
    const result = calculateNextRunAt({
      frequency: "DAILY",
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-01-15"),
    });
    expect(result).toBeNull();
  });

  it("uses anchor parameter when provided", () => {
    const result = calculateNextRunAt(
      {
        frequency: "DAILY",
        startDate: new Date("2024-01-01"),
      },
      new Date("2024-06-15"),
    );
    expect(result!.toISOString().slice(0, 10)).toBe("2024-06-16");
  });

  it("uses nextRunAt from config as base", () => {
    const result = calculateNextRunAt({
      frequency: "DAILY",
      startDate: new Date("2024-01-01"),
      nextRunAt: new Date("2024-03-10"),
    });
    expect(result!.toISOString().slice(0, 10)).toBe("2024-03-11");
  });

  it("handles string dates for startDate", () => {
    const result = calculateNextRunAt({
      frequency: "DAILY",
      startDate: "2024-01-15",
    });
    expect(result).toBeInstanceOf(Date);
  });

  it("handles null interval as 1", () => {
    const result = calculateNextRunAt({
      frequency: "DAILY",
      interval: null,
      startDate: new Date("2024-01-15"),
    });
    expect(result!.toISOString().slice(0, 10)).toBe("2024-01-16");
  });
});
