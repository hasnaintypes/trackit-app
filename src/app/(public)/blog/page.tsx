"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@ui/button";
import { ChevronRight, ChevronLeft, Mail } from "lucide-react";

import { blog } from "@content/site/blog";

const categories = [
  "Interviews",
  "AI & Insights",
  "Budgeting",
  "Splits",
  "Security",
  "Product",
  "Engineering",
  "Community",
];

const postDates = [
  "MAR 20, 2026",
  "MAR 14, 2026",
  "MAR 8, 2026",
  "FEB 28, 2026",
  "FEB 20, 2026",
  "FEB 12, 2026",
  "JAN 30, 2026",
  "JAN 22, 2026",
  "JAN 15, 2026",
  "JAN 8, 2026",
  "DEC 28, 2025",
];

const postCategories = [
  "AI & Insights",
  "Splits",
  "Security",
  "Engineering",
  "Product",
  "Budgeting",
  "Budgeting",
  "Budgeting",
  "Engineering",
  "AI & Insights",
  "Security",
];

const postExcerpts: Record<string, string> = {
  "Stop Typing, Start Scanning: The Power of Gemini OCR for Expenses":
    "See how Trackit's receipt scanning uses Google Gemini to extract merchant names, amounts, and dates automatically from a photo of any receipt.",
  "No More IOUs: Mastering Group Expenses and Instant Settlements":
    "Learn how to create groups, split bills four different ways, and use debt simplification to settle up with the fewest transfers possible.",
  "Unbreakable Finance: Why We Built Trackit on RBAC and 2FA":
    "A deep dive into the security architecture behind Trackit, from role-based access control to two-factor authentication and audit logging.",
  "Behind the Scenes: Why the T3 Stack Powers Trackit's Real-Time Sync":
    "Explore the technical decisions behind choosing Next.js, tRPC, and Prisma for building a real-time personal finance application.",
  "Stripe Polar Explained: The Magic Behind Instant In-App Transfers":
    "Understand how Trackit processes payments and reconciles transaction data using Stripe webhooks for instant, accurate financial records.",
};

const POSTS_PER_PAGE = 5;

export default function BlogPage() {
  const [page, setPage] = useState(0);

  const heroPost = blog.featured.hero;
  const allPosts = [
    ...blog.featuredSidebar.map((p, i) => ({
      image: p.image,
      imageAlt: p.imageAlt,
      title: p.title,
      excerpt: postExcerpts[p.title] ?? "",
      href: p.href as string | undefined,
      date: postDates[i] ?? "",
      category: postCategories[i] ?? "Product",
    })),
    ...blog.recentPosts.map((p, i) => ({
      image: p.image ?? "/placeholder.svg",
      imageAlt: p.imageAlt ?? p.title,
      title: p.title,
      excerpt: (p.excerpt ?? "").replace(/\*\*/g, ""),
      href: p.href,
      date: postDates[blog.featuredSidebar.length + i] ?? "",
      category: postCategories[blog.featuredSidebar.length + i] ?? "Product",
    })),
  ];

  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = allPosts.slice(
    page * POSTS_PER_PAGE,
    (page + 1) * POSTS_PER_PAGE,
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24 lg:pt-24">
      {/* Header */}
      <div className="mb-14">
        <h1 className="text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
          <span className="from-foreground to-foreground/80 bg-gradient-to-r bg-clip-text text-transparent">
            The Trackit
          </span>{" "}
          <span className="text-primary italic">Blog</span>
        </h1>
      </div>

      {/* Hero Post + Sidebar */}
      <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          {/* Hero Post */}
          <Link href={heroPost.href ?? "#"} className="group block">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
              SEP 19, 2025
            </p>
            <h2 className="text-foreground group-hover:text-primary mb-5 text-2xl leading-snug font-bold transition-colors md:text-3xl">
              {heroPost.title}
            </h2>
            <div className="relative h-[340px] overflow-hidden rounded-xl md:h-[420px]">
              <Image
                src={heroPost.imageSrc}
                alt={heroPost.imageAlt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                unoptimized
              />
            </div>
          </Link>

          {/* Tagline */}
          <p className="text-muted-foreground mt-8 mb-10 border-b pb-10 text-sm">
            Don&apos;t assume that just tracking expenses is enough to build
            financial freedom.
          </p>

          {/* Post List */}
          <div className="divide-border divide-y">
            {paginatedPosts.map((post) => (
              <Link
                key={post.title}
                href={post.href ?? "#"}
                className="group flex gap-6 py-8 first:pt-0 last:pb-0"
              >
                <div className="relative hidden h-[140px] w-[200px] shrink-0 overflow-hidden rounded-xl sm:block">
                  <Image
                    src={post.image ?? "/placeholder.svg"}
                    alt={post.imageAlt ?? post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1 py-1">
                  <div className="mb-2 flex items-center gap-3">
                    <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                      {post.date}
                    </p>
                    <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-foreground group-hover:text-primary text-lg leading-snug font-bold transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-muted-foreground mt-2.5 line-clamp-2 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="border-border bg-card hover:bg-muted disabled:border-border/50 flex h-10 w-10 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="text-foreground size-5" />
              </button>
              <span className="text-muted-foreground text-sm">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="border-border bg-card hover:bg-muted disabled:border-border/50 flex h-10 w-10 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="text-foreground size-5" />
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            {/* Subscribe */}
            <div className="bg-card border-border rounded-2xl border p-6">
              <h4 className="text-foreground mb-2 text-center text-sm font-bold">
                Trackit in Your Inbox
              </h4>
              <p className="text-muted-foreground mb-5 text-center text-xs leading-relaxed">
                Get Trackit blog posts delivered to your email every week.
              </p>
              <Button size="sm" className="w-full gap-2 font-semibold">
                <Mail className="size-3.5" />
                Subscribe
              </Button>
            </div>

            {/* Categories */}
            <div className="bg-card border-border rounded-2xl border p-6">
              <h4 className="text-foreground mb-4 text-sm font-bold">
                All Categories
              </h4>
              <ul className="space-y-2.5">
                {categories.map((cat) => (
                  <li key={cat}>
                    <span className="text-muted-foreground hover:text-primary cursor-pointer text-sm transition-colors">
                      {cat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
