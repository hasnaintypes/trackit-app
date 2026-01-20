import { describe, test, expect } from "vitest";
import { getAvatarUrl } from "@/lib/shared/avatar";

describe("getAvatarUrl function", () => {
  test("returns provided image when set", () => {
    const res = getAvatarUrl({
      image: "https://example.com/me.png",
      gender: "MALE",
    });
    expect(res).toBe("https://example.com/me.png");
  });

  test("returns girl avatar when gender is FEMALE and no image", () => {
    const res = getAvatarUrl({ gender: "FEMALE" });
    expect(res).toContain("female"); // Using contains since URL might change
  });

  test("returns boy/default avatar when gender is MALE or unspecified and no image", () => {
    expect(getAvatarUrl({ gender: "MALE" })).toContain("boy");
    expect(getAvatarUrl({})).toContain("boy");
  });
});
