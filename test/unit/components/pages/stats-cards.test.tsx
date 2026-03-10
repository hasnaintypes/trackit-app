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
    balance: {
      title: "Total Balance",
      dateRange: "1 Jan - 10 Mar 2026",
      value: "5000.00",
      changePercent: 16,
      changeLabel: "Last Month",
    },
    income: {
      title: "Total Income",
      dateRange: "1 Jan - 10 Mar 2026",
      value: "3000.00",
      changePercent: 12,
      changeLabel: "Last Month",
    },
    spending: {
      title: "Total Spending",
      dateRange: "1 Jan - 10 Mar 2026",
      value: "1500.00",
      changePercent: -10,
      changeLabel: "Last Month",
    },
  };

  it("renders all three stat cards", () => {
    render(<StatsCards {...baseProps} />);
    expect(screen.getByText("Total Balance")).toBeInTheDocument();
    expect(screen.getByText("Total Income")).toBeInTheDocument();
    expect(screen.getByText("Total Spending")).toBeInTheDocument();
  });

  it("displays formatted values", () => {
    render(<StatsCards {...baseProps} />);
    expect(screen.getByText("$5000.00")).toBeInTheDocument();
    expect(screen.getByText("$3000.00")).toBeInTheDocument();
    expect(screen.getByText("$1500.00")).toBeInTheDocument();
  });

  it("shows date ranges", () => {
    render(<StatsCards {...baseProps} />);
    expect(screen.getAllByText("1 Jan - 10 Mar 2026")).toHaveLength(3);
  });

  it("shows loading skeleton when isLoading is true", () => {
    const { container } = render(
      <StatsCards {...baseProps} isLoading />,
    );
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(6); // 3 value + 3 change skeletons
  });

  it("does not show loading skeleton when isLoading is false", () => {
    const { container } = render(<StatsCards {...baseProps} />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(0);
  });

  it("shows percentage changes with correct sign", () => {
    render(<StatsCards {...baseProps} />);
    expect(screen.getByText("+16% Last Month")).toBeInTheDocument();
    expect(screen.getByText("+12% Last Month")).toBeInTheDocument();
    expect(screen.getByText("-10% Last Month")).toBeInTheDocument();
  });
});
