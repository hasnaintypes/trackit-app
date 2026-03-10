import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GenericRadarChart } from "@/components/charts/radar-chart";
import type { ChartConfig } from "@/components/ui/chart";

// Mock recharts to avoid rendering issues in tests
vi.mock("recharts", () => ({
  RadarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="recharts-radar-chart">{children}</div>
  ),
  Radar: () => <div data-testid="radar" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
}));

const mockConfig: ChartConfig = {
  current: {
    label: "Current",
    color: "hsl(var(--chart-1))",
  },
  previous: {
    label: "Previous",
    color: "hsl(var(--chart-2))",
  },
};

const mockData = [
  { category: "Food", current: 80, previous: 70 },
  { category: "Transport", current: 60, previous: 65 },
  { category: "Entertainment", current: 50, previous: 55 },
];

const mockDataKeys = [
  { key: "current", name: "Current", color: "hsl(var(--chart-1))" },
  { key: "previous", name: "Previous", color: "hsl(var(--chart-2))" },
];

describe("GenericRadarChart", () => {
  it("renders radar chart with data", () => {
    render(
      <GenericRadarChart
        title="Spending Comparison"
        data={mockData}
        dataKeys={mockDataKeys}
        indexKey="category"
        config={mockConfig}
      />,
    );

    expect(screen.getByText("Spending Comparison")).toBeInTheDocument();
    expect(screen.getByTestId("recharts-radar-chart")).toBeInTheDocument();
  });

  it("renders with description", () => {
    render(
      <GenericRadarChart
        title="Spending Comparison"
        description="Compare your spending across categories"
        data={mockData}
        dataKeys={mockDataKeys}
        indexKey="category"
        config={mockConfig}
      />,
    );

    expect(
      screen.getByText("Compare your spending across categories"),
    ).toBeInTheDocument();
  });

  it("returns null when data is empty", () => {
    const { container } = render(
      <GenericRadarChart
        title="Spending Comparison"
        data={[]}
        dataKeys={mockDataKeys}
        indexKey="category"
        config={mockConfig}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("returns null when data is undefined", () => {
    const { container } = render(
      <GenericRadarChart
        title="Spending Comparison"
        data={undefined as unknown as Record<string, unknown>[]}
        dataKeys={mockDataKeys}
        indexKey="category"
        config={mockConfig}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = render(
      <GenericRadarChart
        title="Spending Comparison"
        data={mockData}
        dataKeys={mockDataKeys}
        indexKey="category"
        config={mockConfig}
        className="custom-radar-chart"
      />,
    );

    expect(container.querySelector(".custom-radar-chart")).toBeInTheDocument();
  });

  it("renders multiple radar elements based on dataKeys", () => {
    render(
      <GenericRadarChart
        title="Spending Comparison"
        data={mockData}
        dataKeys={mockDataKeys}
        indexKey="category"
        config={mockConfig}
      />,
    );

    const radarElements = screen.getAllByTestId("radar");
    expect(radarElements).toHaveLength(mockDataKeys.length);
  });

  it("renders all chart components", () => {
    render(
      <GenericRadarChart
        title="Spending Comparison"
        data={mockData}
        dataKeys={mockDataKeys}
        indexKey="category"
        config={mockConfig}
      />,
    );

    expect(screen.getByTestId("recharts-radar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("polar-angle-axis")).toBeInTheDocument();
    expect(screen.getByTestId("polar-grid")).toBeInTheDocument();
  });
});
