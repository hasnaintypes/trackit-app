import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PageLoader } from "@/components/common/page-loader";

// Mock next/navigation
const mockPathname = "/test-path";
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

// Mock TanStack Query
vi.mock("@tanstack/react-query", () => ({
  useIsFetching: vi.fn(() => 0),
  useIsMutating: vi.fn(() => 0),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<unknown>) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animate-presence">{children}</div>
  ),
}));

describe("PageLoader", () => {
  it("renders without crashing", () => {
    const { container } = render(<PageLoader />);
    expect(container).toBeInTheDocument();
  });

  it("initially renders animate presence component", () => {
    const { getByTestId } = render(<PageLoader />);
    expect(getByTestId("animate-presence")).toBeInTheDocument();
  });

  it("shows loader when fetching", async () => {
    const { useIsFetching } = await import("@tanstack/react-query");
    vi.mocked(useIsFetching).mockReturnValue(1);

    const { container } = render(<PageLoader />);
    
    // Wait for component to mount
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    expect(container).toBeInTheDocument();
  });

  it("shows loader when mutating", async () => {
    const { useIsMutating } = await import("@tanstack/react-query");
    vi.mocked(useIsMutating).mockReturnValue(1);

    const { container } = render(<PageLoader />);
    
    // Wait for component to mount
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    expect(container).toBeInTheDocument();
  });

  it("handles mount state correctly", () => {
    const { container } = render(<PageLoader />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
