import { describe, it, expect } from "vitest";
import {
  getLatestNotificationsSchema,
  markAsReadSchema,
} from "@/validation/notification";

describe("getLatestNotificationsSchema", () => {
  it("uses default limit of 10", () => {
    const result = getLatestNotificationsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts limit within range", () => {
    const result = getLatestNotificationsSchema.safeParse({ limit: 25 });
    expect(result.success).toBe(true);
  });

  it("rejects limit below 1", () => {
    const result = getLatestNotificationsSchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit above 50", () => {
    const result = getLatestNotificationsSchema.safeParse({ limit: 51 });
    expect(result.success).toBe(false);
  });
});

describe("markAsReadSchema", () => {
  it("accepts valid id", () => {
    const result = markAsReadSchema.safeParse({ id: "notif_123" });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    const result = markAsReadSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
