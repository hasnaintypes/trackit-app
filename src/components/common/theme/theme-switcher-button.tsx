"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@ui/button";

export default function ThemeSwitcherButton() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-hidden className="size-9">
        <Sun className="size-5" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      variant="ghost"
      size="icon"
      className="text-primary-foreground hover:bg-primary-foreground/10 size-9"
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
