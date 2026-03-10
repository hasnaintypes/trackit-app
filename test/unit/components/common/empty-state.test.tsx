import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmptyState } from "@/components/common/empty-state";
import { AlertCircle } from "lucide-react";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No items" description="Nothing here yet" />);
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("renders default icon when none provided", () => {
    const { container } = render(
      <EmptyState title="Empty" description="No data" />,
    );
    // Default FileSearch icon renders as an svg inside the icon wrapper
    const iconWrapper = container.querySelector(".rounded-full.bg-slate-100");
    expect(iconWrapper).toBeInTheDocument();
    expect(iconWrapper?.querySelector("svg")).toBeInTheDocument();
  });

  it("renders custom icon when provided", () => {
    render(
      <EmptyState
        icon={AlertCircle}
        title="Error"
        description="Something went wrong"
      />,
    );
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyState
        title="Test"
        description="Desc"
        className="my-custom-class"
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("my-custom-class");
  });
});
