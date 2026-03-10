import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BackgroundPattern } from "@/components/common/background-pattern";

// Mock next-themes
const mockUseTheme = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => mockUseTheme(),
}));

// Mock the component dependencies
vi.mock("@/components/ui/dot-pattern", () => ({
  default: ({ className }: { className?: string }) => (
    <div data-testid="dot-pattern" className={className} />
  ),
}));

vi.mock("@/components/ui/particles", () => ({
  default: ({
    className,
    quantity,
    color,
  }: {
    className?: string;
    quantity?: number;
    color?: string;
  }) => (
    <div
      data-testid="particles"
      className={className}
      data-quantity={quantity}
      data-color={color}
    />
  ),
}));

describe("BackgroundPattern", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with light theme", () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: "light" });

    const { getByTestId } = render(<BackgroundPattern />);

    expect(getByTestId("dot-pattern")).toBeInTheDocument();
    expect(getByTestId("particles")).toBeInTheDocument();
    expect(getByTestId("particles")).toHaveAttribute("data-color", "#000");
  });

  it("renders with dark theme", () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: "dark" });

    const { getByTestId } = render(<BackgroundPattern />);

    expect(getByTestId("dot-pattern")).toBeInTheDocument();
    expect(getByTestId("particles")).toBeInTheDocument();
    expect(getByTestId("particles")).toHaveAttribute("data-color", "#fff");
  });

  it("renders both DotPattern and Particles components", () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: "light" });

    const { getByTestId } = render(<BackgroundPattern />);

    const dotPattern = getByTestId("dot-pattern");
    const particles = getByTestId("particles");

    expect(dotPattern).toBeInTheDocument();
    expect(particles).toBeInTheDocument();
    expect(particles).toHaveAttribute("data-quantity", "100");
  });

  it("handles undefined resolved theme", () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: undefined });

    const { getByTestId } = render(<BackgroundPattern />);

    expect(getByTestId("particles")).toHaveAttribute("data-color", "#fff");
  });
});
