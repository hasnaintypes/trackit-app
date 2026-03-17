"use client";

import { useState } from "react";
import { Button } from "@ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";
import { Wallet, ChevronDown, Search, XCircle } from "lucide-react";
import { ICONS } from "@/constants/icons";

export { ICONS, ICON_MAP } from "@/constants/icons";

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIcons = ICONS.filter((icon) =>
    icon.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const SelectedIcon = ICONS.find((i) => i.name === value)?.Icon ?? Wallet;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-10 w-full justify-between px-3"
        >
          <span className="flex items-center gap-2">
            <SelectedIcon className="text-primary h-4 w-4" />
            <span className="capitalize">{value}</span>
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 pb-0">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Search icons..."
              className="h-9 pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Height Calculation: 
            Each row is approx 36px + 8px gap. 
            4 rows ≈ 180px. 
            Scrollbar is hidden via CSS class but functionality remains.
        */}
        <div className="h-[180px] overflow-y-auto p-3 [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
          {filteredIcons.length > 0 ? (
            <div className="grid grid-cols-6 gap-2">
              {filteredIcons.map(({ name, Icon }) => (
                <div
                  key={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md border transition-all hover:scale-110",
                    // ensure pointer is shown for clickable tiles
                    "cursor-pointer",
                    value === name
                      ? "border-primary bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent",
                  )}
                  title={name}
                >
                  <Icon className="h-5 w-5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground animate-in fade-in-50 flex h-full flex-col items-center justify-center text-center">
              <XCircle className="mb-2 h-8 w-8 opacity-20" />
              <p className="text-sm font-medium">No icons found</p>
              <p className="text-xs">Try searching for something else</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
