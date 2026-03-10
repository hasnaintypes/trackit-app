import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// Mock sonner toast
vi.mock("sonner", () => {
  const toast = {
    success: vi.fn(),
    error: vi.fn(),
  };
  return { toast };
});

// Mock logger
vi.mock("@/lib/logging", () => ({
  createLogger: () => ({ error: vi.fn(), info: vi.fn() }),
}));

import { DeleteDialog } from "@/components/common/delete-dialog";

describe("DeleteDialog", () => {
  let toastMock!: { success: Mock; error: Mock };

  beforeEach(async () => {
    const sonner = (await import("sonner")) as unknown as {
      toast: { success: Mock; error: Mock };
    };
    toastMock = sonner.toast;
    toastMock.success.mockClear();
    toastMock.error.mockClear();
  });

  it("renders with default text when open", () => {
    render(<DeleteDialog open onConfirm={vi.fn()} />);
    expect(screen.getByText("Are you absolutely sure?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This action cannot be undone. This will permanently delete this item.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders with custom text", () => {
    render(
      <DeleteDialog
        open
        onConfirm={vi.fn()}
        title="Delete account?"
        description="Your data will be lost."
        confirmText="Yes, delete"
        cancelText="No, keep"
      />,
    );
    expect(screen.getByText("Delete account?")).toBeInTheDocument();
    expect(screen.getByText("Your data will be lost.")).toBeInTheDocument();
    expect(screen.getByText("Yes, delete")).toBeInTheDocument();
    expect(screen.getByText("No, keep")).toBeInTheDocument();
  });

  it("calls onConfirm and shows success toast on confirm", async () => {
    const onConfirm = vi.fn(async () => undefined);
    render(<DeleteDialog open onConfirm={onConfirm} />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledOnce();
      expect(toastMock.success).toHaveBeenCalledWith(
        "Item deleted successfully",
      );
    });
  });

  it("shows error toast when onConfirm throws", async () => {
    const onConfirm = vi.fn(async () => {
      throw new Error("Network error");
    });
    render(<DeleteDialog open onConfirm={onConfirm} />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
  });

  it("shows custom success/error messages", async () => {
    const onConfirm = vi.fn(async () => undefined);
    render(
      <DeleteDialog
        open
        onConfirm={onConfirm}
        successMessage="Account removed"
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(toastMock.success).toHaveBeenCalledWith("Account removed");
    });
  });

  it("renders trigger element when provided", () => {
    render(
      <DeleteDialog
        trigger={<button>Remove</button>}
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.getByText("Remove")).toBeInTheDocument();
  });

  it("calls onOpenChange when provided", async () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn(async () => undefined);
    render(
      <DeleteDialog
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
