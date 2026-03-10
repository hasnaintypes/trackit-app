import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ColorPicker, NAMED_COLORS } from "@/components/common/color-picker";

describe("ColorPicker", () => {
  it("renders the current value in the trigger button", () => {
    render(<ColorPicker value="#3B82F6" onChange={vi.fn()} />);
    expect(screen.getByText("#3B82F6")).toBeInTheDocument();
  });

  it("displays color swatch preview in trigger", () => {
    const { container } = render(
      <ColorPicker value="#EF4444" onChange={vi.fn()} />,
    );
    const swatch = container.querySelector(".rounded-full[style]");
    expect(swatch).toBeInTheDocument();
    expect(swatch?.getAttribute("style")).toContain("rgb(239, 68, 68)");
  });

  it("opens popover on trigger click and shows search", async () => {
    render(<ColorPicker value="#3B82F6" onChange={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox"));
    expect(
      screen.getByPlaceholderText("Search name or hex..."),
    ).toBeInTheDocument();
  });

  it("shows all named colors when popover is open", async () => {
    render(<ColorPicker value="#3B82F6" onChange={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox"));

    // Each color button has a title attribute with the color name
    for (const color of NAMED_COLORS) {
      expect(screen.getByTitle(color.name)).toBeInTheDocument();
    }
  });

  it("filters colors by search query", async () => {
    render(<ColorPicker value="#3B82F6" onChange={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox"));
    await user.type(
      screen.getByPlaceholderText("Search name or hex..."),
      "Red",
    );

    expect(screen.getByTitle("Red")).toBeInTheDocument();
    expect(screen.queryByTitle("Blue")).not.toBeInTheDocument();
  });

  it("shows 'No colors found' when search has no matches", async () => {
    render(<ColorPicker value="#3B82F6" onChange={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox"));
    await user.type(
      screen.getByPlaceholderText("Search name or hex..."),
      "zzzzz",
    );

    expect(screen.getByText("No colors found.")).toBeInTheDocument();
  });

  it("calls onChange when a color swatch is clicked", async () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#3B82F6" onChange={onChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByTitle("Red"));

    expect(onChange).toHaveBeenCalledWith("#EF4444");
  });

  it("shows custom hex option when valid hex is typed", async () => {
    render(<ColorPicker value="#3B82F6" onChange={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox"));
    await user.type(
      screen.getByPlaceholderText("Search name or hex..."),
      "#FF5500",
    );

    expect(screen.getByText("Use Custom Color")).toBeInTheDocument();
  });

  it("does not show custom hex for invalid hex input", async () => {
    render(<ColorPicker value="#3B82F6" onChange={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox"));
    await user.type(
      screen.getByPlaceholderText("Search name or hex..."),
      "ZZZZZZ",
    );

    expect(screen.queryByText("Use Custom Color")).not.toBeInTheDocument();
  });

  it("calls onChange with formatted hex when custom hex is clicked", async () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#3B82F6" onChange={onChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox"));
    await user.type(
      screen.getByPlaceholderText("Search name or hex..."),
      "FF5500",
    );
    await user.click(screen.getByText("Use Custom Color"));

    expect(onChange).toHaveBeenCalledWith("#FF5500");
  });

  it("exports NAMED_COLORS with expected structure", () => {
    expect(NAMED_COLORS.length).toBeGreaterThan(0);
    for (const color of NAMED_COLORS) {
      expect(color).toHaveProperty("name");
      expect(color).toHaveProperty("value");
      expect(color.value).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});
