"use client";
import React, { useState } from "react";

import { Avatars } from "@component/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const WaitlistSection = () => {
  const [email, setEmail] = useState("");

  const handleJoin = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter a valid email address");
      return;
    }

    // basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }

    toast.success(`You have joined the waitlist with ${trimmed}`);
    setEmail("");
  };

  return (
    <section className="flex w-full items-center justify-center overflow-hidden py-16">
      <div className="container mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4">
        <h2 className="relative z-20 py-2 text-center font-sans text-5xl font-semibold tracking-tighter md:py-10 lg:text-8xl">
          Join the Waitlist
        </h2>
        <p className="text-md text-muted-foreground mx-auto max-w-xl text-center lg:text-lg">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <div className="relative z-20 mt-10 flex w-full max-w-md items-center gap-3 rounded-full p-1">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-muted h-10 w-full rounded-xl border-none shadow-none ring-0 focus-visible:ring-0 focus-visible:outline-none active:ring-0 active:outline-0"
            placeholder="Enter your email"
            aria-label="email"
          />
          <Button
            className="h-10 cursor-pointer rounded-xl"
            onClick={handleJoin}
          >
            Join the Waitlist
          </Button>
        </div>
        <div className="mt-10 mb-12 flex w-full flex-col items-center gap-2">
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
