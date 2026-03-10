import { describe, it, expect } from "vitest";
import { prettyDeviceFromUA } from "@/lib/device-map";

describe("prettyDeviceFromUA", () => {
  it("returns 'Unknown device' for null/undefined", () => {
    expect(prettyDeviceFromUA(null)).toBe("Unknown device");
    expect(prettyDeviceFromUA(undefined)).toBe("Unknown device");
    expect(prettyDeviceFromUA("")).toBe("Unknown device");
  });

  it("detects iPhone", () => {
    expect(
      prettyDeviceFromUA(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
      ),
    ).toBe("iPhone");
  });

  it("detects iPad", () => {
    expect(
      prettyDeviceFromUA("Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)"),
    ).toBe("iPad");
  });

  it("detects Android with version", () => {
    const result = prettyDeviceFromUA(
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36",
    );
    expect(result).toBe("Android 13");
  });

  it("detects Android without version", () => {
    expect(prettyDeviceFromUA("some android ua string")).toBe("Android device");
  });

  it("detects Chrome on Windows 10", () => {
    const result = prettyDeviceFromUA(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );
    expect(result).toBe("Chrome on Windows 10");
  });

  it("detects Safari on macOS", () => {
    const result = prettyDeviceFromUA(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    );
    expect(result).toBe("Safari on macOS");
  });

  it("detects Firefox on Linux", () => {
    const result = prettyDeviceFromUA(
      "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0",
    );
    expect(result).toBe("Firefox on Linux");
  });

  it("detects Edge on Windows", () => {
    const result = prettyDeviceFromUA(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    );
    expect(result).toBe("Edge on Windows 10");
  });

  it("returns 'Browser' for unrecognized UA without OS info", () => {
    expect(prettyDeviceFromUA("SomeRandomBot/1.0")).toBe("Browser");
  });
});
