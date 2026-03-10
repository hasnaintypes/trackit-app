import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UserMenu from "@/components/common/user-menu";
import { toast } from "sonner";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock hooks
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  image: "/avatar.jpg",
};

vi.mock("@/hooks/use-user", () => ({
  default: () => ({ user: mockUser }),
}));

const mockSignOut = vi.fn();
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ signOut: mockSignOut }),
}));

vi.mock("@/store/userStore", () => ({
  useUserStore: () => null,
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
  });

  it("renders user menu button", () => {
    render(<UserMenu />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("displays user avatar", () => {
    render(<UserMenu />);
    const avatar = screen.getByRole("img");
    expect(avatar).toHaveAttribute("alt", "John Doe");
  });

  it("displays user initials as fallback", () => {
    render(<UserMenu />);
    // The fallback initials "JD" should be in the document
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("opens dropdown menu when button is clicked", async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
  });

  it("displays user name and email in dropdown", async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
  });

  it("displays settings menu item", async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });
  });

  it("displays logout menu item", async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });
  });

  it("navigates to settings when settings is clicked", async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Settings"));

    expect(mockPush).toHaveBeenCalledWith("/settings");
  });

  it("calls signOut and navigates when logout is clicked", async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Logout"));

    expect(mockPush).toHaveBeenCalledWith("/");
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it("shows error toast when logout fails", async () => {
    mockSignOut.mockRejectedValue(new Error("Logout failed"));
    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("handles user without name gracefully", () => {
    vi.mock("@/hooks/use-user", () => ({
      default: () => ({ user: { ...mockUser, name: null } }),
    }));

    render(<UserMenu />);
    // Should fall back to "KK" initials
    expect(screen.getByText("KK")).toBeInTheDocument();
  });

  it("displays default text when user data is missing", async () => {
    vi.mock("@/hooks/use-user", () => ({
      default: () => ({ user: null }),
    }));

    const user = userEvent.setup();
    render(<UserMenu />);

    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByText("Your name")).toBeInTheDocument();
      expect(screen.getByText("you@example.com")).toBeInTheDocument();
    });
  });
});
