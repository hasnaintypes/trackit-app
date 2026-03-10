import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { IconPicker, ICONS } from "@/components/common/icon-picker";

describe("IconPicker", () => {
  it("renders the current value in the trigger", () => {
    render(<IconPicker value="wallet" onChange={vi.fn()} />);
    expect(screen.getByText("wallet")).toBeInTheDocument();
  });

  it("opens popover and shows search on click", async () => {
    render(<IconPicker value="wallet" onChange={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox"));
    expect(screen.getByPlaceholderText("Search icons...")).toBeInTheDocument();
  });

  it("filters icons by search query", async () => {
    render(<IconPicker value="wallet" onChange={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByPlaceholderText("Search icons..."), "coffee");

    expect(screen.getByTitle("coffee")).toBeInTheDocument();
    expect(screen.queryByTitle("wallet")).not.toBeInTheDocument();
  });

  it("shows empty state when no icons match search", async () => {
    render(<IconPicker value="wallet" onChange={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByPlaceholderText("Search icons..."), "zzzzz");

    expect(screen.getByText("No icons found")).toBeInTheDocument();
  });

  it("calls onChange when an icon is clicked", async () => {
    const onChange = vi.fn();
    render(<IconPicker value="wallet" onChange={onChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByTitle("heart"));

    expect(onChange).toHaveBeenCalledWith("heart");
  });

  it("exports ICONS array with name and Icon properties", () => {
    expect(ICONS.length).toBeGreaterThan(0);
    for (const icon of ICONS) {
      expect(icon).toHaveProperty("name");
      expect(icon).toHaveProperty("Icon");
      expect(typeof icon.name).toBe("string");
    }
  });
});
