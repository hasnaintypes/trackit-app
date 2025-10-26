"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export function Logo({ size = 16, className, ...props }: LogoProps) {
  const height = size;

  return (
    <div
      className={cn("text-primary flex items-center justify-center", className)}
      {...props}
    >
      {/* light */}
      <Image
        src="/logo.png"
        alt="logo"
        width={height * 2}
        height={height}
        className="block h-auto dark:hidden"
      />

      {/* dark */}
      <Image
        src="/logo-dark.png"
        alt="logo dark"
        width={height * 2}
        height={height}
        className="hidden h-auto dark:block"
      />
    </div>
  );
}
