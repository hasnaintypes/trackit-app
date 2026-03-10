import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BarChart } from "@/components/charts/bar-chart";
import type { ChartConfig } from "@/components/ui/chart";

// Mock recharts to avoid rendering issues in tests
vi.mock("recharts", () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}));

const mockConfig: ChartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
};

const mockData = [
  { category: "Food", amount: 500 },
  { category: "Transport", amount: 300 },
  { category: "Entertainment", amount: 200 },
];

describe("BarChart", () => {
  it("renders chart with data", () => {
    render(
      <BarChart
        data={mockData}
        config={mockConfig}
        dataKey="amount"
        labelKey="category"
      />,
    );

    expect(screen.getByTestId("recharts-bar-chart")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <BarChart
        data={mockData}
        config={mockConfig}
        dataKey="amount"
        labelKey="category"
        className="custom-bar-chart"
      />,
    );

    expect(container.querySelector(".custom-bar-chart")).toBeInTheDocument();
  });

  it("renders with empty data", () => {
    render(
      <BarChart
        data={[]}
        config={mockConfig}
        dataKey="amount"
        labelKey="category"
      />,
    );

    expect(screen.getByTestId("recharts-bar-chart")).toBeInTheDocument();
  });

  it("accepts valueFormatter prop", () => {
    const formatter = (value: number) => `€${value}`;
    const { container } = render(
      <BarChart
        data={mockData}
        config={mockConfig}
        dataKey="amount"
        labelKey="category"
        valueFormatter={formatter}
      />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders all chart components", () => {
    render(
      <BarChart
        data={mockData}
        config={mockConfig}
        dataKey="amount"
        labelKey="category"
      />,
    );

    expect(screen.getByTestId("recharts-bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
  });
});
