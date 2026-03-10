import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Avatars } from "@/components/common/avatars";

describe("Avatars", () => {
  it("renders with default items", () => {
    const { container } = render(<Avatars />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("inline-flex", "items-center");
  });

  it("applies custom className", () => {
    const { container } = render(<Avatars className="custom-avatars" />);
    expect(container.firstChild).toHaveClass("custom-avatars");
  });

  it("renders with custom items", () => {
    const customItems = [
      {
        id: 1,
        name: "Test User",
        designation: "Developer",
        image: "/test-avatar.jpg",
      },
      {
        id: 2,
        name: "Another User",
        designation: "Designer",
        image: "/another-avatar.jpg",
      },
    ];

    const { container } = render(<Avatars items={customItems} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with empty items array", () => {
    const { container } = render(<Avatars items={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("combines custom className with default classes", () => {
    const { container } = render(<Avatars className="extra-class" />);
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass("inline-flex");
    expect(element).toHaveClass("items-center");
    expect(element).toHaveClass("extra-class");
  });
});
