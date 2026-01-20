"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Plus, Search, XCircle } from "lucide-react";

// --- Named Color Palette ---
export const NAMED_COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Red", value: "#EF4444" },
  { name: "Green", value: "#10B981" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Fuchsia", value: "#D946EF" },
  { name: "Lime", value: "#84CC16" },
  { name: "Slate", value: "#64748B" },
  { name: "Orange", value: "#F97316" },
  { name: "Violet", value: "#A855F7" },
  { name: "Sky", value: "#0EA5E9" },
  { name: "Emerald", value: "#22C55E" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Stone", value: "#78716C" },
  { name: "Black", value: "#171717" },
];

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Filter by Name
  const filteredColors = NAMED_COLORS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // 2. Check if search query is a valid Hex code
  // Regex allows 3 or 6 digit hex, with or without hash
  const isCustomHex = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(searchQuery);
  const formattedCustomHex = searchQuery.startsWith("#")
    ? searchQuery
    : `#${searchQuery}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-10 w-full justify-between px-3"
        >
          <div className="flex items-center gap-2">
            <div
              className="border-border h-4 w-4 rounded-full border"
              style={{ backgroundColor: value }}
            />
            <span className="text-muted-foreground text-sm font-medium uppercase">
              {value}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-3.5 w-3.5" />
          <Input
            placeholder="Search name or hex..."
            className="h-8 pl-8 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="max-h-[220px] space-y-3 overflow-y-auto [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
          {/* Custom Hex Option (Shows if user types a valid hex) */}
          {isCustomHex && (
            <div
              className="hover:bg-muted border-primary/50 flex items-center gap-2 rounded-md border border-dashed p-2"
              // use button-like semantics — ensure pointer cursor for this clickable div
              onClick={() => {
                onChange(formattedCustomHex);
                setOpen(false);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onChange(formattedCustomHex);
                  setOpen(false);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <div
                className="h-6 w-6 rounded-full border shadow-sm"
                style={{ backgroundColor: formattedCustomHex }}
              />
              <div className="flex flex-col">
                <span className="text-xs font-medium">Use Custom Color</span>
                <span className="text-muted-foreground text-[10px] uppercase">
                  {formattedCustomHex}
                </span>
              </div>
              <Plus className="text-muted-foreground ml-auto h-4 w-4" />
            </div>
          )}

          {/* Presets Grid */}
          {filteredColors.length > 0 ? (
            <div className="grid grid-cols-5 gap-3 px-3 py-1">
              {filteredColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={cn(
                    "focus:ring-primary relative flex h-8 w-8 items-center justify-center rounded-full border border-black/5 transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-none",
                    value === color.value &&
                      "ring-primary ring-2 ring-offset-2",
                  )}
                  style={{ backgroundColor: color.value }}
                  onClick={() => {
                    onChange(color.value);
                    setOpen(false);
                  }}
                  title={color.name}
                >
                  {value === color.value && (
                    <Check className="h-3 w-3 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            !isCustomHex && (
              // Empty State
              <div className="text-muted-foreground flex flex-col items-center justify-center py-4 text-center">
                <XCircle className="mb-2 h-8 w-8 opacity-20" />
                <p className="text-xs">No colors found.</p>
              </div>
            )
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
