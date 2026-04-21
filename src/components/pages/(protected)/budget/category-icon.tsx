"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ICONS } from "@/constants/icons";

interface CategoryIconProps {
  icon?: string | null;
  color?: string | null;
  name: string;
  size?: "sm" | "md";
}

function CategoryIconInner({
  icon,
  color,
  name,
  size = "md",
}: CategoryIconProps) {
  const IconEntry = ICONS.find((i) => i.name === icon);
  const IconComp = IconEntry?.Icon;
  const iconColor = color ?? "#666";

  const dims = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconDims = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div
      className={cn(
        "bg-muted flex shrink-0 items-center justify-center rounded-xl",
        dims,
      )}
    >
      {IconComp ? (
        <IconComp className={iconDims} style={{ color: iconColor }} />
      ) : (
        <span className="text-sm font-bold" style={{ color: iconColor }}>
          {name.charAt(0)}
        </span>
      )}
    </div>
  );
}

export const CategoryIcon = React.memo(CategoryIconInner);
