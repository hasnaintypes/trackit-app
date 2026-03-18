"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const Logo = React.memo(function Logo({
  size = 32,
  className,
  showText = false,
}: LogoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render only light logo during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Image
          src="/images/brand/logo.png"
          alt="Trackit"
          width={size}
          height={size}
          className="rounded-full"
          unoptimized
        />
        {showText && <span className="text-lg font-semibold">Trackit</span>}
      </div>
    );
  }
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/images/brand/logo.png"
        alt="Trackit"
        width={size}
        height={size}
        className="rounded-full dark:hidden"
        unoptimized
      />
      <Image
        src="/images/brand/logo-dark.png"
        alt="Trackit"
        width={size}
        height={size}
        className="hidden rounded-full dark:block"
        unoptimized
      />
      {showText && <span className="text-lg font-semibold">Trackit</span>}
    </div>
  );
});

/**
 * LogoIcon variant for integration grids and small icon contexts.
 */
export const LogoIcon = React.memo(function LogoIcon({
  className,
}: {
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render only light logo during SSR
  if (!mounted) {
    return (
      <Image
        src="/images/brand/logo.png"
        alt="Trackit"
        width={28}
        height={28}
        className={cn("rounded-md", className)}
        unoptimized
      />
    );
  }
  return (
    <>
      <Image
        src="/images/brand/logo.png"
        alt="Trackit"
        width={28}
        height={28}
        className={cn("rounded-md dark:hidden", className)}
        unoptimized
      />
      <Image
        src="/images/brand/logo-dark.png"
        alt="Trackit"
        width={28}
        height={28}
        className={cn("hidden rounded-md dark:block", className)}
        unoptimized
      />
    </>
  );
});
