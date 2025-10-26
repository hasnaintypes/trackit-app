"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Switch } from "@/components/ui/switch";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a non-interactive placeholder on the server and initial render
  if (!mounted) {
    return (
      <div className="flex items-center space-x-3">
        <Sun className="size-4" />
        <div className="bg-input h-6 w-12 rounded-full" aria-hidden />
        <Moon className="size-4" />
      </div>
    );
  }

  const checked = theme === "dark";

  return (
    <div className="flex items-center space-x-3">
      <Sun className="size-4" />
      <Switch
        checked={checked}
        onCheckedChange={(value: boolean) => setTheme(value ? "dark" : "light")}
        aria-label="Toggle theme"
      />
      <Moon className="size-4" />
    </div>
  );
}
