import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ThemeSwitcher from "@/components/common/theme-toggle";

// Mock next-themes
const mockSetTheme = vi.fn();
const mockTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme(),
    setTheme: mockSetTheme,
  }),
}));

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders theme switcher", () => {
    mockTheme.mockReturnValue("light");
    const { container } = render(<ThemeSwitcher />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders sun and moon icons", () => {
    mockTheme.mockReturnValue("light");
    render(<ThemeSwitcher />);

    // Since we're using lucide icons, they should be rendered
    const { container } = render(<ThemeSwitcher />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders switch component", () => {
    mockTheme.mockReturnValue("light");
    const { container } = render(<ThemeSwitcher />);
    
    // The Switch component should be rendered
    const switchElement = container.querySelector('button[role="switch"]');
    expect(switchElement).toBeInTheDocument();
  });

  it("switch is unchecked for light theme", () => {
    mockTheme.mockReturnValue("light");
    const { container } = render(<ThemeSwitcher />);
    
    const switchElement = container.querySelector('button[role="switch"]');
    expect(switchElement).toHaveAttribute("aria-checked", "false");
  });

  it("switch is checked for dark theme", () => {
    mockTheme.mockReturnValue("dark");
    const { container } = render(<ThemeSwitcher />);
    
    const switchElement = container.querySelector('button[role="switch"]');
    expect(switchElement).toHaveAttribute("aria-checked", "true");
  });

  it("calls setTheme when switch is toggled", async () => {
    mockTheme.mockReturnValue("light");
    const user = userEvent.setup();
    const { container } = render(<ThemeSwitcher />);
    
    const switchElement = container.querySelector('button[role="switch"]');
    if (switchElement) {
      await user.click(switchElement);
      
      await waitFor(() => {
        expect(mockSetTheme).toHaveBeenCalledWith("dark");
      });
    }
  });

  it("calls setTheme with light when toggling from dark", async () => {
    mockTheme.mockReturnValue("dark");
    const user = userEvent.setup();
    const { container } = render(<ThemeSwitcher />);
    
    const switchElement = container.querySelector('button[role="switch"]');
    if (switchElement) {
      await user.click(switchElement);
      
      await waitFor(() => {
        expect(mockSetTheme).toHaveBeenCalledWith("light");
      });
    }
  });

  it("has proper accessibility attributes", () => {
    mockTheme.mockReturnValue("light");
    const { container } = render(<ThemeSwitcher />);
    
    const switchElement = container.querySelector('button[role="switch"]');
    expect(switchElement).toHaveAttribute("aria-label", "Toggle theme");
  });

  it("renders placeholder on server/initial render", () => {
    mockTheme.mockReturnValue(undefined);
    const { container } = render(<ThemeSwitcher />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
