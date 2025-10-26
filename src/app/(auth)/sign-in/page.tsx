"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { testimonials as HOME_TESTIMONIALS } from "@/content/site/home";
import { mapHomeTestimonials } from "@/lib/utils";

import Link from "next/link";
import { LoginForm } from "@/components/forms/auth";
import { Logo } from "@/components/common";

// Map Home testimonials to a simple shape used here (computed inside component)

export default function LoginPage() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Build and filter testimonials inside the component so effects can depend on them
  const TESTIMONIALS = mapHomeTestimonials(HOME_TESTIMONIALS);
  const MAX_QUOTE_LENGTH = 220;
  const VISIBLE_TESTIMONIALS = TESTIMONIALS.filter(
    (x) => x.quote && x.quote.length > 0 && x.quote.length <= MAX_QUOTE_LENGTH,
  );
  const DISPLAY_TESTIMONIALS =
    VISIBLE_TESTIMONIALS.length > 0 ? VISIBLE_TESTIMONIALS : TESTIMONIALS;

  useEffect(() => {
    const intervalMs = 100000;
    if (!isPaused && DISPLAY_TESTIMONIALS.length > 0) {
      timerRef.current = window.setInterval(() => {
        setIndex((i) => (i + 1) % DISPLAY_TESTIMONIALS.length);
      }, intervalMs);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPaused, DISPLAY_TESTIMONIALS.length]);

  const safeIndex =
    ((index % DISPLAY_TESTIMONIALS.length) + DISPLAY_TESTIMONIALS.length) %
    DISPLAY_TESTIMONIALS.length;
  const t = DISPLAY_TESTIMONIALS[safeIndex] ?? {
    quote: "",
    author: "",
    avatar: "",
  };

  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <Logo />
              Cashio.
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <Image
            src="/background.png"
            alt="Image"
            fill
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />

          {/* Overlay for testimonials */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm" />

            <div className="relative z-20 mx-8 w-full max-w-3xl px-8">
              <div className="flex w-full items-center justify-end">
                <div className="max-w-2xl text-white">
                  <div className="relative">
                    <span className="absolute -top-12 -left-12 z-0 text-[9.5rem] leading-none text-white md:text-[10rem]">
                      “
                    </span>
                    <p className="relative z-10 mb-4 text-4xl leading-tight font-semibold md:text-5xl">
                      {t.quote}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="bg-muted relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={t.avatar || ""}
                        alt={t.author || ""}
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="text-sm text-gray-200">{t.author}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
