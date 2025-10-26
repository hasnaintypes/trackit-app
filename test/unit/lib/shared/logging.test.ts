import { describe, it, expect, beforeEach, vi } from "vitest";
import { createLogger } from "@/lib/logging";

describe("Logger (console)", () => {
  beforeEach(() => {
    // Ensure non-production behavior (leave NODE_ENV alone); these tests
    // assume logger will use console when not in production.
    vi.spyOn(console, "info").mockImplementation(vi.fn());
    vi.spyOn(console, "warn").mockImplementation(vi.fn());
    vi.spyOn(console, "error").mockImplementation(vi.fn());
    vi.spyOn(console, "debug").mockImplementation(vi.fn());
  });

  it("calls console.info for info()", () => {
    const logger = createLogger("unit");
    logger.info("hello world", { a: 1 });
    expect(console.info).toHaveBeenCalled();
  });

  it("calls console.warn for warn()", () => {
    const logger = createLogger("unit");
    logger.warn("be careful", { b: 2 });
    expect(console.warn).toHaveBeenCalled();
  });

  it("calls console.error for error()", () => {
    const logger = createLogger("unit");
    logger.error("boom", { err: "x" });
    expect(console.error).toHaveBeenCalled();
  });

  it("calls console.debug for debug()", () => {
    const logger = createLogger("unit");
    logger.debug("debugging", { d: 4 });
    expect(console.debug).toHaveBeenCalled();
  });
});
