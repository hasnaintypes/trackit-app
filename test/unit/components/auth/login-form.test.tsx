import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// Mock useAuth to avoid network calls. Create mocks inside the factory so
// they are available to the mocked module and to our test assertions.
vi.mock("@/hooks/use-auth", () => {
  const signIn = vi.fn(async () => null);
  const requestPasswordReset = vi.fn(async () => undefined);
  return {
    useAuth: () => ({ signIn, requestPasswordReset }),
    // expose the spies so tests can import them
    signIn,
    requestPasswordReset,
  };
});

// Mock sonner toast to avoid UI side-effects during tests. Create and export
// the mocked toast from the factory so the hoisted mock doesn't reference
// variables that haven't been initialized yet.
vi.mock("sonner", () => {
  const toast = {
    loading: vi.fn(() => "loading-id"),
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
    info: vi.fn(),
  };
  return { toast };
});

import { LoginForm } from "@/components/forms/auth/login-form";

describe("LoginForm", () => {
  let toastMock!: {
    loading: Mock;
    success: Mock;
    error: Mock;
    dismiss: Mock;
    info: Mock;
  };
  let signIn!: Mock;
  let requestPasswordReset!: Mock;

  beforeEach(async () => {
    const auth = (await import("@/hooks/use-auth")) as unknown as {
      signIn: Mock;
      requestPasswordReset: Mock;
    };
    signIn = auth.signIn!;
    requestPasswordReset = auth.requestPasswordReset!;
    const sonner = (await import("sonner")) as unknown as {
      toast: {
        loading: Mock;
        success: Mock;
        error: Mock;
        dismiss: Mock;
        info: Mock;
      };
    };
    toastMock = sonner.toast;

    // clear any previous calls
    signIn.mockClear();
    requestPasswordReset.mockClear();
    toastMock.loading.mockClear();
    toastMock.success.mockClear();
    toastMock.error.mockClear();
  });

  it("renders email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    const password = screen.getByLabelText<HTMLInputElement>(/^Password$/i);
    expect(password.type).toBe("password");

    const showBtn = screen.getByLabelText(/Show password/i);
    await user.click(showBtn);
    expect(screen.getByLabelText<HTMLInputElement>(/^Password$/i).type).toBe(
      "text",
    );
  });

  it("forgot password shows error when email empty and calls request when provided", async () => {
    render(<LoginForm />);
    const user = userEvent.setup();

    const forgotBtn = screen.getByLabelText(/Forgot your password\?/i);
    await user.click(forgotBtn);
    expect(toastMock.error).toHaveBeenCalledWith(
      "Please enter your email above first.",
    );

    // now fill email and try again
    await user.type(screen.getByLabelText(/Email/i), "jane@example.com");
    await user.click(forgotBtn);
    await waitFor(() => {
      expect(requestPasswordReset).toHaveBeenCalledWith(
        "jane@example.com",
        "/reset-password",
      );
      expect(toastMock.success).toHaveBeenCalled();
    });
  });

  it("submits the form and calls signIn then navigates", async () => {
    const navModule = (await import("next/navigation")) as unknown as {
      __sharedRouter?: {
        push: (...args: unknown[]) => void;
        replace: (...args: unknown[]) => void;
        prefetch: (...args: unknown[]) => void;
      };
    };
    const router = navModule.__sharedRouter!;

    render(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^Password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /^Login$/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalled();
      expect(toastMock.success).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith("/dashboard");
    });
  });
});
