import { describe, it, expect } from "vitest";
import { cn, mapHomeTestimonials } from "@/lib/utils";

describe("utils", () => {
  it("cn merges class names", () => {
    const v = cn("a", "b");
    expect(v).toContain("a");
    expect(v).toContain("b");
  });

  it("mapHomeTestimonials maps safely", () => {
    const input: Array<Record<string, unknown>> = [
      { quote: "hi", name: "Jane", image: "avatar.png" },
    ];
    const mapped = mapHomeTestimonials(input);
    expect(mapped[0]!.quote).toBe("hi");
    expect(mapped[0]!.author).toBe("Jane");
    expect(mapped[0]!.avatar).toBe("avatar.png");
  });
});
