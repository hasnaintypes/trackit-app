import { describe, it, expect } from "vitest";
import { toError } from "@/lib/shared/error";

describe("toError", () => {
  it("returns the same Error instance when passed an Error", () => {
    const e = new Error("boom");
    const out = toError(e);
    expect(out).toBe(e);
  });

  it("converts a string to an Error", () => {
    const out = toError("failed");
    expect(out).toBeInstanceOf(Error);
    expect(out.message).toBe("failed");
  });

  it("uses .message when an object has a message property", () => {
    const out = toError({ message: "object message" } as { message: string });
    expect(out.message).toBe("object message");
  });

  it("uses .error when an object has an error property", () => {
    const out = toError({ error: "error string" } as { error: string });
    expect(out.message).toBe("error string");
  });

  it("stringifies plain objects", () => {
    const obj = { a: 1, b: "x" } as Record<string, unknown>;
    const out = toError(obj);
    expect(out.message).toBe(JSON.stringify(obj));
  });

  it("handles null/undefined/primitive values", () => {
    expect(toError(null as unknown).message).toBe("null");
    expect(toError(undefined as unknown).message).toBe("undefined");
    expect(toError(123 as unknown).message).toBe("123");
  });
});
