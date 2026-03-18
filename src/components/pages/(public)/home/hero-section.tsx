"use client";
import React from "react";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import { BackgroundPattern } from "@common/index";
import Link from "next/link";
import { toast } from "sonner";
import { hero } from "@content/site/home";

const HeroSectionInner = () => {
  const data = hero;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <BackgroundPattern />

      <div className="relative z-10 max-w-3xl text-center">
        {data.badgeText && (
          <Badge
            variant="secondary"
            className="border-border rounded-full py-1"
            asChild
          >
            <Link href="#">
              {data.badgeText} <ArrowUpRight className="ml-1 size-4" />
            </Link>
          </Badge>
        )}
        <h1 className="mt-6 text-4xl font-semibold tracking-tighter sm:text-5xl md:text-6xl md:leading-[1.2] lg:text-7xl">
          {data.title}
        </h1>
        <p className="mt-6 md:text-lg">{data.description}</p>
        <div className="mt-12 flex items-center justify-center gap-4">
          <Button size="lg" className="rounded-full text-base">
            <Link
              href={data.primaryCta.href}
              className="flex items-center gap-2"
            >
              {data.primaryCta.text} <ArrowUpRight className="h-5! w-5!" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full text-base shadow-none"
            onClick={() => {
              toast.info("Demo video coming soon! Stay tuned for updates.");
            }}
          >
            <CirclePlay className="h-5! w-5!" />{" "}
            {data.secondaryCta?.text ?? "Watch Demo"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const HeroSection = React.memo(HeroSectionInner);
export default HeroSection;
