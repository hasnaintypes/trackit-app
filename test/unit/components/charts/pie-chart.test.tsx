import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PieChart } from "@/components/charts/pie-chart";
import type { ChartConfig } from "@/components/ui/chart";

// Mock recharts to avoid rendering issues in tests
vi.mock("recharts", () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Label: () => <div data-testid="label" />,
}));

const mockConfig: ChartConfig = {
  Food: {
    label: "Food",
    color: "hsl(var(--chart-1))",
  },
  Transport: {
    label: "Transport",
    color: "hsl(var(--chart-2))",
  },
  Entertainment: {
    label: "Entertainment",
    color: "hsl(var(--chart-3))",
  },
};

const mockData = [
  { name: "Food", amount: 500 },
  { name: "Transport", amount: 300 },
  { name: "Entertainment", amount: 200 },
];

describe("PieChart", () => {
  it("renders pie chart with data", () => {
    render(
      <PieChart
        data={mockData}
        config={mockConfig}
        dataKey="amount"
        nameKey="name"
      />,
    );

    expect(screen.getByTestId("recharts-pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <PieChart
        data={mockData}
        config={mockConfig}
        dataKey="amount"
        nameKey="name"
        className="custom-pie-chart"
      />,
    );

    expect(container.querySelector(".custom-pie-chart")).toBeInTheDocument();
  });

  it("renders with empty data", () => {
    render(
      <PieChart
        data={[]}
        config={mockConfig}
        dataKey="amount"
        nameKey="name"
      />,
    );

    expect(screen.getByTestId("recharts-pie-chart")).toBeInTheDocument();
  });

  it("accepts valueFormatter prop", () => {
    const formatter = (value: number) => `€${value}`;
    const { container } = render(
      <PieChart
        data={mockData}
        config={mockConfig}
        dataKey="amount"
        nameKey="name"
        valueFormatter={formatter}
      />,
    );

    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders chart components", () => {
    render(
      <PieChart
        data={mockData}
        config={mockConfig}
        dataKey="amount"
        nameKey="name"
      />,
    );

    expect(screen.getByTestId("recharts-pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("pie")).toBeInTheDocument();
    expect(screen.getByTestId("label")).toBeInTheDocument();
  });
});
