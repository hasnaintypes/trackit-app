import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock the useFormatter hook to return a simple passthrough
vi.mock("@/hooks/use-formatter", () => ({
  useFormatter: () => ({
    formatAmount: (val: string) => `$${val}`,
    isLoading: false,
  }),
}));

import { StatsCards } from "@/components/pages/(protected)/overview/stats-cards";

describe("StatsCards", () => {
  const baseProps = {
    totalBalance: "5000.00",
    totalIncome: "3000.00",
    totalExpense: "1500.00",
  };

  it("renders all three stat cards", () => {
    render(<StatsCards {...baseProps} />);
    expect(screen.getByText("Total Balance")).toBeInTheDocument();
    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("Expenses")).toBeInTheDocument();
  });

  it("displays formatted values", () => {
    render(<StatsCards {...baseProps} />);
    expect(screen.getByText("$5000.00")).toBeInTheDocument();
    expect(screen.getByText("$3000.00")).toBeInTheDocument();
    expect(screen.getByText("$1500.00")).toBeInTheDocument();
  });

  it("shows descriptions", () => {
    render(<StatsCards {...baseProps} />);
    expect(screen.getByText("Across all accounts")).toBeInTheDocument();
    expect(screen.getAllByText("In selected period")).toHaveLength(2);
  });

  it("shows loading skeleton when isLoading is true", () => {
    const { container } = render(
      <StatsCards {...baseProps} isLoading />,
    );
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(3);
  });

  it("does not show loading skeleton when isLoading is false", () => {
    const { container } = render(<StatsCards {...baseProps} />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(0);
  });
});
