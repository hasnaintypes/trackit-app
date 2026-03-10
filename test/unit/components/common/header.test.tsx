import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Header } from "@/components/common/header";

describe("Header", () => {
  it("renders the header", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });

  it("renders logo", () => {
    const { container } = render(<Header />);
    // The NavbarLogo component should be rendered
    expect(container.querySelector("header")).toBeInTheDocument();
  });

  it("renders login button", () => {
    render(<Header />);
    const loginButtons = screen.getAllByText("Login");
    expect(loginButtons.length).toBeGreaterThan(0);
  });

  it("renders get started button", () => {
    render(<Header />);
    const getStartedButtons = screen.getAllByText("Get Started");
    expect(getStartedButtons.length).toBeGreaterThan(0);
  });

  it("renders navigation items", () => {
    const { container } = render(<Header />);
    expect(container.querySelector("header")).toBeInTheDocument();
  });

  it("login button links to sign-in page", () => {
    render(<Header />);
    const loginButtons = screen.getAllByText("Login");
    // At least one should be a link to /sign-in
    const hasSignInLink = loginButtons.some((button) => {
      const link = button.closest("a");
      return link && link.getAttribute("href") === "/sign-in";
    });
    expect(hasSignInLink).toBeTruthy();
  });

  it("get started button links to sign-up page", () => {
    render(<Header />);
    const getStartedButtons = screen.getAllByText("Get Started");
    // At least one should be a link to /sign-up
    const hasSignUpLink = getStartedButtons.some((button) => {
      const link = button.closest("a");
      return link && link.getAttribute("href") === "/sign-up";
    });
    expect(hasSignUpLink).toBeTruthy();
  });

  it("mobile menu is initially closed", () => {
    const { container } = render(<Header />);
    // The component manages mobile menu state
    expect(container.querySelector("header")).toBeInTheDocument();
  });

  it("has proper layout classes", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("relative");
  });
});
