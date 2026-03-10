import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("next-themes", () => {
  const setTheme = vi.fn();
  return {
    useTheme: () => ({ theme: "light", setTheme }),
    setTheme,
  };
});

import ThemeSwitcherButton from "@/components/common/theme-switcher-button";

describe("ThemeSwitcherButton", () => {
  let setThemeMock!: Mock;

  beforeEach(async () => {
    const mod = (await import("next-themes")) as unknown as {
      setTheme: Mock;
    };
    setThemeMock = mod.setTheme;
    setThemeMock.mockClear();
  });

  it("renders a button with aria-label", () => {
    render(<ThemeSwitcherButton />);
    expect(
      screen.getByLabelText("Switch to dark theme"),
    ).toBeInTheDocument();
  });

  it("calls setTheme on click", async () => {
    render(<ThemeSwitcherButton />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button"));
    expect(setThemeMock).toHaveBeenCalledWith("dark");
  });
});
