import { describe, it, expect, vi } from "vitest";
import fs from "fs";
// Mock fs.readFileSync so we don't touch the filesystem in tests. Our code
// imports `fs` as a default import, so the mock needs to provide a `default`
// export with the expected methods.
vi.mock("fs", () => ({
  default: {
    readFileSync: vi.fn(() => "Hello {{name}}"),
  },
}));

import { renderTemplate } from "@/lib/server/utils";

describe("renderTemplate", () => {
  it("replaces variables in template content", () => {
    // process.cwd() is used to build the path but our mocked fs ignores it
    const out = renderTemplate("ignored", { name: "Alice" });
    expect(out).toBe("Hello Alice");
  });
});

describe("renderTemplate edge cases", () => {
  it("throws when fs.readFileSync throws", () => {
    const mocked = fs as unknown as { readFileSync: typeof fs.readFileSync };
    mocked.readFileSync = () => {
      throw new Error("not found");
    };
    expect(() => renderTemplate("missing", { name: "x" })).toThrow("not found");
  });
});
