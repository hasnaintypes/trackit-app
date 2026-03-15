"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function AppearanceSettings() {
  const { theme: currentTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState("medium");

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 space-y-6">
      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose between light and dark mode</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={mounted ? (currentTheme ?? "light") : "light"}
            onValueChange={(val) => setTheme(val)}
            className="flex max-w-md gap-6 pt-2"
          >
            <label className="[&:has([data-state=checked])>div]:border-primary flex-col">
              <RadioGroupItem
                value="light"
                className="sr-only cursor-pointer"
              />
              <div className="hover:border-accent cursor-pointer items-center rounded-lg border-2 p-1">
                <div className="space-y-2 rounded-lg bg-[#ecedef] p-2">
                  <div className="space-y-2 rounded-md bg-white p-2 shadow-xs">
                    <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs">
                    <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs">
                    <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                  </div>
                </div>
              </div>
              <span className="block w-full p-2 text-center text-sm font-normal">
                Light
              </span>
            </label>

            <label className="[&:has([data-state=checked])>div]:border-primary flex-col">
              <RadioGroupItem value="dark" className="sr-only cursor-pointer" />
              <div className="bg-popover hover:bg-accent hover:text-accent-foreground cursor-pointer items-center rounded-lg border-2 p-1">
                <div className="space-y-2 rounded-lg bg-slate-950 p-2">
                  <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-xs">
                    <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs">
                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs">
                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                  </div>
                </div>
              </div>
              <span className="block w-full p-2 text-center text-sm font-normal">
                Dark
              </span>
            </label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>
            Adjust display settings for better readability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fontSize">Font Size</Label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger id="fontSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
