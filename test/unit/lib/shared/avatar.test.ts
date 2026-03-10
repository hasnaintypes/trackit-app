import { describe, it, expect } from "vitest";
import {
  DEFAULT_AVATARS,
  generateNamedAvatar,
  getAvatarUrl,
} from "@/lib/shared/avatar";

describe("DEFAULT_AVATARS", () => {
  it("has BOY and GIRL URLs", () => {
    expect(DEFAULT_AVATARS.BOY).toContain("boy");
    expect(DEFAULT_AVATARS.GIRL).toContain("girl");
  });
});

describe("generateNamedAvatar", () => {
  it("returns a DiceBear URL with the name encoded", () => {
    const url = generateNamedAvatar("Jane Doe");
    expect(url).toContain("dicebear.com");
    expect(url).toContain("Jane%20Doe");
  });

  it("encodes special characters", () => {
    const url = generateNamedAvatar("O'Brien");
    expect(url).toContain("O'Brien");
  });
});

describe("getAvatarUrl", () => {
  it("returns explicit image when provided", () => {
    const url = getAvatarUrl({ image: "https://example.com/me.png" });
    expect(url).toBe("https://example.com/me.png");
  });

  it("returns name-based avatar when no image but name exists", () => {
    const url = getAvatarUrl({ name: "Alice" });
    expect(url).toContain("dicebear.com");
    expect(url).toContain("Alice");
  });

  it("returns GIRL avatar when gender is FEMALE and no image/name", () => {
    const url = getAvatarUrl({ gender: "FEMALE" });
    expect(url).toBe(DEFAULT_AVATARS.GIRL);
  });

  it("returns BOY avatar when gender is MALE and no image/name", () => {
    const url = getAvatarUrl({ gender: "MALE" });
    expect(url).toBe(DEFAULT_AVATARS.BOY);
  });

  it("returns BOY avatar as default fallback", () => {
    const url = getAvatarUrl({});
    expect(url).toBe(DEFAULT_AVATARS.BOY);
  });

  it("prefers image over name and gender", () => {
    const url = getAvatarUrl({
      image: "https://example.com/custom.png",
      name: "Alice",
      gender: "FEMALE",
    });
    expect(url).toBe("https://example.com/custom.png");
  });

  it("prefers name over gender when no image", () => {
    const url = getAvatarUrl({ name: "Bob", gender: "FEMALE" });
    expect(url).toContain("dicebear.com");
    expect(url).toContain("Bob");
  });
});
