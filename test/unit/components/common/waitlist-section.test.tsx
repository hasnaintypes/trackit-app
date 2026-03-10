import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { WaitlistSection } from "@/components/common/waitlist-section";
import { toast } from "sonner";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("WaitlistSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the waitlist section", () => {
    render(<WaitlistSection />);
    expect(screen.getByText("Join the Waitlist")).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<WaitlistSection />);
    expect(
      screen.getByText(/Lorem ipsum dolor sit amet/),
    ).toBeInTheDocument();
  });

  it("renders email input", () => {
    render(<WaitlistSection />);
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  });

  it("renders join button", () => {
    render(<WaitlistSection />);
    expect(screen.getByRole("button", { name: /join the waitlist/i })).toBeInTheDocument();
  });

  it("displays user count", () => {
    render(<WaitlistSection />);
    expect(screen.getByText("+1000 people already joined")).toBeInTheDocument();
  });

  it("renders avatars component", () => {
    const { container } = render(<WaitlistSection />);
    // Check that the avatars are rendered
    expect(container.querySelector(".inline-flex")).toBeInTheDocument();
  });

  it("allows typing in email input", async () => {
    const user = userEvent.setup();
    render(<WaitlistSection />);

    const input = screen.getByPlaceholderText("Enter your email");
    await user.type(input, "test@example.com");

    expect(input).toHaveValue("test@example.com");
  });

  it("shows success toast with valid email", async () => {
    const user = userEvent.setup();
    render(<WaitlistSection />);

    const input = screen.getByPlaceholderText("Enter your email");
    await user.type(input, "test@example.com");

    const button = screen.getByRole("button", { name: /join the waitlist/i });
    await user.click(button);

    expect(toast.success).toHaveBeenCalledWith(
      "You have joined the waitlist with test@example.com",
    );
  });

  it("clears email input after successful submission", async () => {
    const user = userEvent.setup();
    render(<WaitlistSection />);

    const input = screen.getByPlaceholderText("Enter your email");
    await user.type(input, "test@example.com");

    const button = screen.getByRole("button", { name: /join the waitlist/i });
    await user.click(button);

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("shows error toast with empty email", async () => {
    const user = userEvent.setup();
    render(<WaitlistSection />);

    const button = screen.getByRole("button", { name: /join the waitlist/i });
    await user.click(button);

    expect(toast.error).toHaveBeenCalledWith(
      "Please enter a valid email address",
    );
  });

  it("shows error toast with invalid email format", async () => {
    const user = userEvent.setup();
    render(<WaitlistSection />);

    const input = screen.getByPlaceholderText("Enter your email");
    await user.type(input, "invalid-email");

    const button = screen.getByRole("button", { name: /join the waitlist/i });
    await user.click(button);

    expect(toast.error).toHaveBeenCalledWith(
      "Please enter a valid email address",
    );
  });

  it("trims whitespace from email", async () => {
    const user = userEvent.setup();
    render(<WaitlistSection />);

    const input = screen.getByPlaceholderText("Enter your email");
    await user.type(input, "  test@example.com  ");

    const button = screen.getByRole("button", { name: /join the waitlist/i });
    await user.click(button);

    expect(toast.success).toHaveBeenCalledWith(
      "You have joined the waitlist with test@example.com",
    );
  });

  it("validates email with multiple @ symbols as invalid", async () => {
    const user = userEvent.setup();
    render(<WaitlistSection />);

    const input = screen.getByPlaceholderText("Enter your email");
    await user.type(input, "test@@example.com");

    const button = screen.getByRole("button", { name: /join the waitlist/i });
    await user.click(button);

    expect(toast.error).toHaveBeenCalledWith(
      "Please enter a valid email address",
    );
  });

  it("validates email without domain as invalid", async () => {
    const user = userEvent.setup();
    render(<WaitlistSection />);

    const input = screen.getByPlaceholderText("Enter your email");
    await user.type(input, "test@");

    const button = screen.getByRole("button", { name: /join the waitlist/i });
    await user.click(button);

    expect(toast.error).toHaveBeenCalledWith(
      "Please enter a valid email address",
    );
  });

  it("has proper section styling", () => {
    const { container } = render(<WaitlistSection />);
    const section = container.querySelector("section");
    expect(section).toHaveClass("flex", "w-full", "items-center", "justify-center");
  });
});
