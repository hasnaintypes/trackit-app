import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("email templates", () => {
  it("verification template contains placeholders", () => {
    const p = path.join(
      process.cwd(),
      "src",
      "lib",
      "email",
      "templates",
      "verification.html",
    );
    const content = fs.readFileSync(p, "utf8");
    expect(content).toContain("{{name}}");
    expect(content).toContain("{{verificationUrl}}");
  });

  it("password-reset template contains placeholders", () => {
    const p = path.join(
      process.cwd(),
      "src",
      "lib",
      "email",
      "templates",
      "password-reset.html",
    );
    const content = fs.readFileSync(p, "utf8");
    expect(content).toContain("{{name}}");
    expect(content).toContain("{{resetUrl}}");
  });
});
