import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import InfoMenu from "@/components/common/info-menu";

describe("InfoMenu", () => {
  it("renders the trigger button", () => {
    render(<InfoMenu />);
    expect(
      screen.getByRole("button", { name: /open edit menu/i }),
    ).toBeInTheDocument();
  });

  it("shows menu items when opened", async () => {
    render(<InfoMenu />);
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: /open edit menu/i }),
    );

    expect(screen.getByText("Documentation")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("Contact us")).toBeInTheDocument();
  });

  it("shows 'Need help?' label in dropdown", async () => {
    render(<InfoMenu />);
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: /open edit menu/i }),
    );

    expect(screen.getByText("Need help?")).toBeInTheDocument();
  });
});
