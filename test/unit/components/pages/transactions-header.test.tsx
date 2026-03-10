import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TransactionsHeader } from "@/components/pages/(protected)/transactions/transactions-header";

describe("TransactionsHeader", () => {
  it("renders heading and description", () => {
    render(<TransactionsHeader onAdd={vi.fn()} onImport={vi.fn()} />);
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Manage and track all your financial transactions in one place",
      ),
    ).toBeInTheDocument();
  });

  it("renders Add Transaction button", () => {
    render(<TransactionsHeader onAdd={vi.fn()} onImport={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /add transaction/i }),
    ).toBeInTheDocument();
  });

  it("renders Bulk Import button", () => {
    render(<TransactionsHeader onAdd={vi.fn()} onImport={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /bulk import/i }),
    ).toBeInTheDocument();
  });

  it("calls onAdd when Add Transaction is clicked", async () => {
    const onAdd = vi.fn();
    render(<TransactionsHeader onAdd={onAdd} onImport={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: /add transaction/i }),
    );
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it("calls onImport when Bulk Import is clicked", async () => {
    const onImport = vi.fn();
    render(<TransactionsHeader onAdd={vi.fn()} onImport={onImport} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /bulk import/i }));
    expect(onImport).toHaveBeenCalledOnce();
  });
});
