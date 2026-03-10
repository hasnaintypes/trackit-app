import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AreaChart } from "@/components/charts/area-chart";
import type { ChartConfig } from "@/components/ui/chart";

// Mock recharts to avoid rendering issues in tests
vi.mock("recharts", () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
}));

const mockConfig: ChartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "Expense",
    color: "hsl(var(--chart-2))",
  },
};

const mockData = [
  { date: "Jan", income: 1000, expense: 800 },
  { date: "Feb", income: 1200, expense: 900 },
  { date: "Mar", income: 1100, expense: 850 },
];

describe("AreaChart", () => {
  it("renders empty state when data is empty", () => {
    render(
      <AreaChart
        data={[]}
        config={mockConfig}
        dataKeyIncome="income"
        dataKeyExpense="expense"
        labelKey="date"
      />,
    );

    expect(
      screen.getByText("No data available for the current filters."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Add some transactions to see your spending trends."),
    ).toBeInTheDocument();
  });

  it("renders empty state when data is undefined", () => {
    render(
      <AreaChart
        data={undefined as unknown as Record<string, unknown>[]}
        config={mockConfig}
        dataKeyIncome="income"
        dataKeyExpense="expense"
        labelKey="date"
      />,
    );

    expect(
      screen.getByText("No data available for the current filters."),
    ).toBeInTheDocument();
  });

  it("renders chart container with data", () => {
    render(
      <AreaChart
        data={mockData}
        config={mockConfig}
        dataKeyIncome="income"
        dataKeyExpense="expense"
        labelKey="date"
      />,
    );

    expect(screen.getByTestId("recharts-area-chart")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <AreaChart
        data={mockData}
        config={mockConfig}
        dataKeyIncome="income"
        dataKeyExpense="expense"
        labelKey="date"
        className="custom-class"
      />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("renders with valid props", () => {
    const { container } = render(
      <AreaChart
        data={mockData}
        config={mockConfig}
        dataKeyIncome="income"
        dataKeyExpense="expense"
        labelKey="date"
      />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
