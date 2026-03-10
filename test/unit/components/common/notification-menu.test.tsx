import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import NotificationMenu from "@/components/common/notification-menu";

// Mock tRPC
const mockNotifications = [
  {
    id: "1",
    title: "Budget Alert",
    message: "You have exceeded your monthly budget",
    isRead: false,
    createdAt: new Date("2024-03-01T10:00:00Z"),
  },
  {
    id: "2",
    title: "Transaction Processed",
    message: "Your transaction has been processed successfully",
    isRead: true,
    createdAt: new Date("2024-03-02T14:30:00Z"),
  },
];

const mockUseUtils = vi.fn();
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();

vi.mock("@/trpc/react", () => ({
  api: {
    useUtils: () => mockUseUtils(),
    notification: {
      getLatest: {
        useQuery: () => ({ data: mockNotifications }),
      },
      getUnreadCount: {
        useQuery: () => ({ data: 1 }),
      },
      markAsRead: {
        useMutation: () => ({
          mutate: mockMarkAsRead,
          isPending: false,
        }),
      },
      markAllAsRead: {
        useMutation: () => ({
          mutate: mockMarkAllAsRead,
          isPending: false,
        }),
      },
    },
  },
}));

// Mock date-fns
vi.mock("date-fns", () => ({
  formatDistanceToNow: () => "2 hours ago",
}));

describe("NotificationMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUtils.mockReturnValue({
      notification: {
        getLatest: { invalidate: vi.fn() },
        getUnreadCount: { invalidate: vi.fn() },
      },
    });
  });

  it("renders notification button", () => {
    render(<NotificationMenu />);
    expect(
      screen.getByRole("button", { name: /open notifications/i }),
    ).toBeInTheDocument();
  });

  it("shows unread indicator when there are unread notifications", () => {
    const { container } = render(<NotificationMenu />);
    const unreadIndicator = container.querySelector(
      '.bg-primary[aria-hidden="true"]',
    );
    expect(unreadIndicator).toBeInTheDocument();
  });

  it("opens popover when button is clicked", async () => {
    const user = userEvent.setup();
    render(<NotificationMenu />);

    await user.click(
      screen.getByRole("button", { name: /open notifications/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });
  });

  it("displays notifications when popover is open", async () => {
    const user = userEvent.setup();
    render(<NotificationMenu />);

    await user.click(
      screen.getByRole("button", { name: /open notifications/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Budget Alert")).toBeInTheDocument();
      expect(screen.getByText("Transaction Processed")).toBeInTheDocument();
    });
  });

  it("shows 'Mark all as read' button when there are unread notifications", async () => {
    const user = userEvent.setup();
    render(<NotificationMenu />);

    await user.click(
      screen.getByRole("button", { name: /open notifications/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Mark all as read")).toBeInTheDocument();
    });
  });

  it("calls markAllAsRead when 'Mark all as read' is clicked", async () => {
    const user = userEvent.setup();
    render(<NotificationMenu />);

    await user.click(
      screen.getByRole("button", { name: /open notifications/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Mark all as read")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Mark all as read"));

    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it("calls markAsRead when notification is clicked", async () => {
    const user = userEvent.setup();
    render(<NotificationMenu />);

    await user.click(
      screen.getByRole("button", { name: /open notifications/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Budget Alert")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Budget Alert"));

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith({ id: "1" });
    });
  });

  it("displays relative time for notifications", async () => {
    const user = userEvent.setup();
    render(<NotificationMenu />);

    await user.click(
      screen.getByRole("button", { name: /open notifications/i }),
    );

    await waitFor(() => {
      const timeElements = screen.getAllByText("2 hours ago");
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });
});

describe("NotificationMenu - Empty State", () => {
  it("shows empty state when there are no notifications", async () => {
    vi.mock("@/trpc/react", () => ({
      api: {
        useUtils: () => mockUseUtils(),
        notification: {
          getLatest: {
            useQuery: () => ({ data: [] }),
          },
          getUnreadCount: {
            useQuery: () => ({ data: 0 }),
          },
          markAsRead: {
            useMutation: () => ({
              mutate: mockMarkAsRead,
              isPending: false,
            }),
          },
          markAllAsRead: {
            useMutation: () => ({
              mutate: mockMarkAllAsRead,
              isPending: false,
            }),
          },
        },
      },
    }));

    const user = userEvent.setup();
    render(<NotificationMenu />);

    await user.click(
      screen.getByRole("button", { name: /open notifications/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("No notifications yet.")).toBeInTheDocument();
    });
  });
});
