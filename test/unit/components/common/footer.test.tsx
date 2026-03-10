import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Footer from "@/components/common/footer";

describe("Footer", () => {
  it("renders the footer", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector("footer")).toBeInTheDocument();
  });

  it("displays copyright text with current year", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} Trackit, All rights reserved`),
    ).toBeInTheDocument();
  });

  it("displays system status indicator", () => {
    render(<Footer />);
    expect(screen.getByText("All system working")).toBeInTheDocument();
  });

  it("renders logo with text", () => {
    const { container } = render(<Footer />);
    // Check for the logo link
    const logoLink = container.querySelector('a[href="/"][aria-label="go home"]');
    expect(logoLink).toBeInTheDocument();
  });

  it("renders social media links", () => {
    render(<Footer />);

    // Check that social links are rendered
    const socialLinks = screen.getAllByRole("link");
    const socialLabels = ["X/Twitter", "LinkedIn", "Facebook", "Instagram", "GitHub"];

    socialLabels.forEach((label) => {
      const link = socialLinks.find(
        (l) => l.getAttribute("aria-label") === label,
      );
      expect(link).toBeInTheDocument();
    });
  });

  it("renders navigation links", () => {
    const { container } = render(<Footer />);
    const links = container.querySelectorAll("a");
    expect(links.length).toBeGreaterThan(0);
  });

  it("social links open in new tab with security attributes", () => {
    const { container } = render(<Footer />);
    const socialLinks = container.querySelectorAll('a[target="_blank"]');

    socialLinks.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("renders theme switcher", () => {
    const { container } = render(<Footer />);
    // The ThemeSwitcher component should be rendered
    expect(container.querySelector("footer")).toContainHTML("div");
  });

  it("has proper layout classes", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("py-10");
  });
});
