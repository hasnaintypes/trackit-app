"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

import { Avatars } from "@common/index";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const HIDDEN_PATHS = ["/contact", "/help", "/pricing", "/blog"];
const HIDDEN_PREFIXES = ["/blog/"];

const WaitlistSection = () => {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      toast.success(data.message ?? "You're on the list!");
      setEmail("");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (
    HIDDEN_PATHS.includes(pathname) ||
    HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))
  )
    return null;

  return (
    <section className="flex w-full items-center justify-center overflow-hidden py-6 md:py-8">
      <div className="container mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4">
        <h2 className="relative z-20 py-2 text-center font-sans text-4xl font-semibold tracking-tighter md:py-6 lg:text-7xl">
          Join the Waitlist
        </h2>
        <p className="text-md text-muted-foreground mx-auto max-w-xl text-center lg:text-lg">
          Be the first to experience smarter finance management. Get early
          access to AI-powered insights, group expense splitting, and automated
          reports, all in one dashboard.
        </p>
        <div className="relative z-20 mt-10 flex w-full max-w-md items-center gap-3 rounded-full p-1">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-muted h-10 w-full rounded-xl border-none shadow-none ring-0 focus-visible:ring-0 focus-visible:outline-none active:ring-0 active:outline-0"
            placeholder="Enter your email"
            aria-label="email"
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleJoin();
            }}
          />
          <Button
            className="h-10 cursor-pointer rounded-xl"
            onClick={() => void handleJoin()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Join the Waitlist"
            )}
          </Button>
        </div>
        <div className="mt-8 mb-6 flex w-full flex-col items-center gap-2">
          <div className="inline-flex items-center -space-x-2.5">
            <Avatars className="mb-0" />
          </div>
          <p className="text-muted-foreground/80 mt-1 tracking-tight">
            +1000 people already joined
          </p>
        </div>
      </div>
    </section>
  );
};

export { WaitlistSection };
