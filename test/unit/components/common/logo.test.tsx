import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Logo, LogoIcon } from "@/components/common/logo";

describe("Logo", () => {
  it("renders the logo image", () => {
    render(<Logo />);
    const img = screen.getByAltText("Trackit");
    expect(img).toBeInTheDocument();
  });

  it("does not show text by default", () => {
    render(<Logo />);
    expect(screen.queryByText("Trackit")).not.toBeInTheDocument();
  });

  it("shows text when showText is true", () => {
    render(<Logo showText />);
    expect(screen.getByText("Trackit")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Logo className="my-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("my-class");
  });

  it("uses custom size", () => {
    render(<Logo size={48} />);
    const img = screen.getByAltText("Trackit") as HTMLImageElement;
    expect(img.getAttribute("width")).toBe("48");
    expect(img.getAttribute("height")).toBe("48");
  });
});

describe("LogoIcon", () => {
  it("renders both light and dark mode images", () => {
    render(<LogoIcon />);
    const images = screen.getAllByAltText("Trackit");
    expect(images.length).toBe(2);
  });

  it("applies custom className to both images", () => {
    render(<LogoIcon className="icon-class" />);
    const images = screen.getAllByAltText("Trackit");
    for (const img of images) {
      expect(img.className).toContain("icon-class");
    }
  });
});
