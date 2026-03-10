import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BlogPostCard } from "@/components/pages/(public)/blog/blog-post-card";

describe("BlogPostCard", () => {
  const baseProps = {
    imageSrc: "/images/blogs/test.jpg",
    imageAlt: "Test blog image",
    title: "Getting Started with Budgeting",
    description: "Learn how to manage your finances effectively.",
    authorName: "Jane Doe",
    authorAvatarSrc: "/images/avatars/jane.jpg",
    readTime: "5 min",
  };

  it("renders title and description", () => {
    render(<BlogPostCard {...baseProps} />);
    expect(
      screen.getByText("Getting Started with Budgeting"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Learn how to manage your finances effectively."),
    ).toBeInTheDocument();
  });

  it("renders author name and read time", () => {
    render(<BlogPostCard {...baseProps} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("5 min read")).toBeInTheDocument();
  });

  it("renders blog image", () => {
    render(<BlogPostCard {...baseProps} />);
    const img = screen.getByAltText("Test blog image");
    expect(img).toBeInTheDocument();
  });

  it("renders author initials in avatar fallback", () => {
    render(<BlogPostCard {...baseProps} />);
    // AvatarFallback shows initials "JD" from "Jane Doe"
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("wraps in a link when href is provided", () => {
    render(<BlogPostCard {...baseProps} href="/blog/budgeting" />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/blog/budgeting");
  });

  it("does not wrap in a link when href is not provided", () => {
    render(<BlogPostCard {...baseProps} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("generates correct initials for single-name author", () => {
    render(<BlogPostCard {...baseProps} authorName="Alice" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
