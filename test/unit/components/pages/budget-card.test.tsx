import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BudgetCard } from "@/components/pages/(protected)/budget/budget-card";

describe("BudgetCard", () => {
  const baseProps = {
    id: "budget_1",
    name: "Groceries",
    amount: 500,
    spent: 200,
    period: "MONTHLY",
  };

  it("renders budget name", () => {
    render(<BudgetCard {...baseProps} />);
    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<BudgetCard {...baseProps} icon="🛒" />);
    expect(screen.getByText("🛒")).toBeInTheDocument();
  });

  it("displays formatted spent amount", () => {
    render(<BudgetCard {...baseProps} />);
    // $200.00 formatted by Intl.NumberFormat
    expect(screen.getByText("$200.00")).toBeInTheDocument();
  });

  it("shows 'On Track' for spending below 85%", () => {
    render(<BudgetCard {...baseProps} spent={200} amount={500} />);
    expect(screen.getByText("On Track")).toBeInTheDocument();
  });

  it("shows 'Warning' for spending between 85% and 100%", () => {
    render(<BudgetCard {...baseProps} spent={440} amount={500} />);
    expect(screen.getByText("Warning")).toBeInTheDocument();
  });

  it("shows 'Over Budget' for spending above 100%", () => {
    render(<BudgetCard {...baseProps} spent={600} amount={500} />);
    expect(screen.getByText("Over Budget")).toBeInTheDocument();
  });

  it("displays correct percentage", () => {
    render(<BudgetCard {...baseProps} spent={250} amount={500} />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("caps progress percentage at 100%", () => {
    render(<BudgetCard {...baseProps} spent={1000} amount={500} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("displays remaining amount", () => {
    render(<BudgetCard {...baseProps} spent={200} amount={500} />);
    expect(screen.getByText(/Remaining.*\$300\.00/)).toBeInTheDocument();
  });

  it("remaining shows $0.00 when over budget", () => {
    render(<BudgetCard {...baseProps} spent={600} amount={500} />);
    expect(screen.getByText(/Remaining.*\$0\.00/)).toBeInTheDocument();
  });

  it("shows period label", () => {
    render(<BudgetCard {...baseProps} />);
    expect(screen.getByText(/monthly limit/i)).toBeInTheDocument();
  });

  it("handles zero budget amount", () => {
    render(<BudgetCard {...baseProps} amount={0} spent={0} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("On Track")).toBeInTheDocument();
  });

  it("uses custom currency", () => {
    render(<BudgetCard {...baseProps} currency="EUR" />);
    // EUR formatted with Intl.NumberFormat
    expect(screen.getByText("€200.00")).toBeInTheDocument();
  });
});
