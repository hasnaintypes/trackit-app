import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// Mock useAuth used inside the component to avoid network calls. Create
// and export the spies from the factory so assertions can import them.
vi.mock("@/hooks/use-auth", () => {
  const signUp = vi.fn(async () => null);
  const sendVerificationEmail = vi.fn(async () => undefined);
  return {
    useAuth: () => ({ signUp, sendVerificationEmail }),
    signUp,
    sendVerificationEmail,
  };
});

// Mock sonner toast to avoid UI side-effects during tests and hoisting issues.
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

import { SignupForm } from "@/components/forms/auth/signup-form";

describe("SignupForm", () => {
  let toastMock!: {
    loading: Mock;
    success: Mock;
    error: Mock;
    dismiss: Mock;
    info: Mock;
  };
  let signUp!: Mock;
  let sendVerificationEmail!: Mock;

  beforeEach(async () => {
    const auth = (await import("@/hooks/use-auth")) as unknown as {
      signUp: Mock;
      sendVerificationEmail: Mock;
    };
    signUp = auth.signUp!;
    sendVerificationEmail = auth.sendVerificationEmail!;
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

    signUp.mockClear();
    sendVerificationEmail.mockClear();
    toastMock.success.mockClear();
    toastMock.error.mockClear();
  });

  it("renders the main fields", () => {
    render(<SignupForm />);
    expect(screen.getByLabelText(/Full Name|Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm Password$/i)).toBeInTheDocument();
  });

  it("toggles password visibility for both password fields", async () => {
    render(<SignupForm />);
    const user = userEvent.setup();

    const password = screen.getByLabelText<HTMLInputElement>(/^Password$/i);
    const confirm =
      screen.getByLabelText<HTMLInputElement>(/^Confirm Password$/i);

    // initially password inputs are of type password
    expect(password.type).toBe("password");
    expect(confirm.type).toBe("password");

    const showPwBtn = screen.getByLabelText(/Show password/i);
    await user.click(showPwBtn);
    expect(screen.getByLabelText<HTMLInputElement>(/^Password$/i).type).toBe(
      "text",
    );

    const showConfirmBtn = screen.getByLabelText(/Show confirm password/i);
    await user.click(showConfirmBtn);
    expect(
      screen.getByLabelText<HTMLInputElement>(/^Confirm Password$/i).type,
    ).toBe("text");
  });

  it("submits the form and calls signUp/sendVerificationEmail then navigates", async () => {
    // import the shared router exposed by our test setup so we can assert on the spy
    const navModule = (await import("next/navigation")) as unknown as {
      __sharedRouter?: {
        push: (...args: unknown[]) => void;
        replace: (...args: unknown[]) => void;
        prefetch: (...args: unknown[]) => void;
      };
    };
    const router = navModule.__sharedRouter!;

    render(<SignupForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Full Name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/Email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^Password$/i), "password123");
    await user.type(
      screen.getByLabelText(/^Confirm Password$/i),
      "password123",
    );

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalled();
      expect(sendVerificationEmail).toHaveBeenCalledWith(
        "jane@example.com",
        "/",
      );
      expect(router.push).toHaveBeenCalled();
    });
  });
});
