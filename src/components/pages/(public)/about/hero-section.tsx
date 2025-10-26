"use client";
import Image from "next/image";
import Link from "next/link";
import { Avatars } from "@component/common";
import { Button } from "@/components/ui/button";
import { CirclePlay } from "lucide-react";
import { toast } from "sonner";
import { hero, stats as statsContent } from "@content/site/about";
import { blog } from "@content/site/blog";

const HeroSection = () => {
  return (
    <section className="mb-8 lg:mb-16">
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left Content */}
        <div className="flex flex-col justify-start">
          <div className="mb-6">
            <p className="text-muted-foreground mb-3 text-sm font-medium tracking-wider uppercase">
              Our Story
            </p>
            {/* restore original title/subtitle sizing but limit width for shorter lines */}
            <h1 className="mb-3 max-w-prose text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
              {hero.title}
              {hero.subtitle ? (
                <span className="text-[var(--primary)]"> {hero.subtitle}</span>
              ) : null}
            </h1>
          </div>

          {/* Large Image */}
          {hero.image ? (
            <div className="relative mb-8 h-75 w-full overflow-hidden rounded-lg">
              <Image
                src={hero.image}
                alt={hero.title}
                fill
                className="object-cover"
              />
            </div>
          ) : null}
        </div>

        {/* Right Content */}
        <div className="flex flex-col gap-8">
          {/* Featured Cards */}
          <div className="grid grid-cols-2 gap-3">
            {(blog.posts ?? []).slice(0, 2).map((p, i) => (
              <Link
                key={p?.href ?? i}
                href={p?.href ?? "#"}
                className="block"
                aria-label={p?.title ?? `Featured ${i + 1}`}
              >
                <div className="border-border relative h-44 overflow-hidden rounded-lg border">
                  <Image
                    src={
                      p?.coverImage ??
                      (i === 0
                        ? "/tech-professional-working.jpg"
                        : "/team-meeting-collaboration.jpg")
                    }
                    alt={p?.title ?? `Featured ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="bg-background/80 rounded-full px-3 py-1 text-xs font-medium backdrop-blur">
                      {p?.category ?? "Blog"}
                    </span>
                    <span className="bg-background/80 rounded-full px-3 py-1 text-xs font-medium backdrop-blur">
                      Featured
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Description and Stats */}
          <div className="space-y-4">
            {hero.description ? (
              <p className="text-muted-foreground text-base leading-relaxed">
                {hero.description}
              </p>
            ) : null}

            {/* Stats Grid */}
            {statsContent?.items ? (
              <div className="border-border grid grid-cols-2 gap-6 border-y py-6">
                {statsContent.items.slice(0, 4).map((s) => (
                  <div key={s.label}>
                    <p className="text-3xl font-bold md:text-4xl">{s.value}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {s.description ?? s.label}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {/* CTA and Avatar Group */}
            <div className="flex items-center gap-48">
              <Avatars className="mr-6" />

              <Button
                variant="outline"
                size="lg"
                className="rounded-full text-sm shadow-none"
                onClick={() => toast.info("Intro video coming soon")}
                aria-label="Watch intro video"
              >
                <span className="flex items-center gap-2">
                  <CirclePlay className="h-4 w-4" />
                  Watch Intro
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
