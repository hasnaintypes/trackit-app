"use client";

import { useState } from "react";
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
import {
  Hash,
  LayoutDashboard,
  LineChart,
  Banknote,
  ListChecks,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// --- Helper Component for Dashboard View Selection ---
import type React from "react";

type ViewSettingsCardProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  value: string;
  currentView: string;
  onClick: (value: string) => void;
};

const ViewSettingsCard: React.FC<ViewSettingsCardProps> = ({
  icon: Icon,
  title,
  description,
  value,
  currentView,
  onClick,
}) => (
  <Card
    className={`hover:bg-muted/50 cursor-pointer transition-all ${
      currentView === value
        ? "border-primary ring-primary/50 ring-2"
        : "border-border"
    }`}
    onClick={() => onClick(value)}
  >
    <CardHeader className="p-4">
      <div className="flex items-center space-x-3">
        <Icon
          className={`h-6 w-6 ${currentView === value ? "text-primary" : "text-muted-foreground"}`}
        />
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </CardHeader>
  </Card>
);

export default function DisplaySettings() {
  const [defaultView, setDefaultView] = useState("overview");
  const [decimalPlaces, setDecimalPlaces] = useState("2");
  const [currencyPosition, setCurrencyPosition] = useState("before");
  const [separator, setSeparator] = useState("comma");

  // Helper mapping for the view cards
  const viewOptions = [
    {
      icon: LayoutDashboard,
      title: "Overview",
      description: "Your financial summary and quick insights.",
      value: "overview",
    },
    {
      icon: ListChecks,
      title: "Transactions List",
      description: "A detailed list of all recent activity.",
      value: "transactions",
    },
    {
      icon: LineChart,
      title: "Net Worth Chart",
      description: "Focus on assets, liabilities, and trend.",
      value: "networth",
    },
    {
      icon: Banknote,
      title: "Investment Portfolio",
      description: "Detailed view of all connected investment accounts.",
      value: "portfolio",
    },
  ];

  return (
    <div className="mt-8 flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold">Display</h1>
        <p className="text-muted-foreground mt-1">
          Configure how your data is displayed, from landing page to number
          formatting.
        </p>
      </div>

      {/* --- SECTION 1: Default Dashboard View (Re-imagined) --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-indigo-500" />
            Default Dashboard View
          </CardTitle>
          <CardDescription>
            Select the page you want to see immediately after logging in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {viewOptions.map((option) => (
              <ViewSettingsCard
                key={option.value}
                icon={option.icon}
                title={option.title}
                description={option.description}
                value={option.value}
                currentView={defaultView}
                onClick={setDefaultView}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* --- SECTION 2: Financial Number Formatting (Re-organized) --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Hash className="h-6 w-6 text-teal-500" />
            Financial Number Formatting
          </CardTitle>
          <CardDescription>
            Customize how currency, decimals, and thousands separators appear
            globally.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Column 1: Decimal Precision & Currency Position */}
            <div className="space-y-6">
              <div className="space-y-4">
                <Label
                  htmlFor="decimalPlaces"
                  className="text-base font-semibold"
                >
                  Decimal Precision
                </Label>
                <Select value={decimalPlaces} onValueChange={setDecimalPlaces}>
                  <SelectTrigger id="decimalPlaces">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 Decimals (e.g., 1234)</SelectItem>
                    <SelectItem value="2">
                      2 Decimals (e.g., 1234.56)
                    </SelectItem>
                    <SelectItem value="4">
                      4 Decimals (e.g., 1234.5678)
                    </SelectItem>
                    <SelectItem value="full">
                      Full Precision (Stocks/Crypto)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  The number of digits shown after the decimal point.
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Currency Symbol Position
                </Label>
                <RadioGroup
                  value={currencyPosition}
                  onValueChange={setCurrencyPosition}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="before"
                    className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
                  >
                    <div className="flex w-full items-center justify-between">
                      <p className="font-medium">$1,234.56</p>
                      <RadioGroupItem value="before" id="before" />
                    </div>
                    <span className="text-muted-foreground mt-1 text-sm">
                      Before Value
                    </span>
                  </Label>

                  <Label
                    htmlFor="after"
                    className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
                  >
                    <div className="flex w-full items-center justify-between">
                      <p className="font-medium">1.234,56 €</p>
                      <RadioGroupItem value="after" id="after" />
                    </div>
                    <span className="text-muted-foreground mt-1 text-sm">
                      After Value
                    </span>
                  </Label>
                </RadioGroup>
              </div>
            </div>

            {/* Column 2: Thousands Separator */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Thousands Separator
              </Label>
              <RadioGroup
                value={separator}
                onValueChange={setSeparator}
                className="grid grid-cols-1 gap-4"
              >
                <Label
                  htmlFor="comma"
                  className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
                >
                  <div className="flex w-full items-center justify-between">
                    <p className="font-medium">1,234.56</p>
                    <RadioGroupItem value="comma" id="comma" />
                  </div>
                  <span className="text-muted-foreground mt-1 text-sm">
                    Comma (Default for US)
                  </span>
                </Label>

                <Label
                  htmlFor="dot"
                  className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
                >
                  <div className="flex w-full items-center justify-between">
                    <p className="font-medium">1.234,56</p>
                    <RadioGroupItem value="dot" id="dot" />
                  </div>
                  <span className="text-muted-foreground mt-1 text-sm">
                    Dot (Default for Europe)
                  </span>
                </Label>

                <Label
                  htmlFor="space"
                  className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
                >
                  <div className="flex w-full items-center justify-between">
                    <p className="font-medium">1 234.56</p>
                    <RadioGroupItem value="space" id="space" />
                  </div>
                  <span className="text-muted-foreground mt-1 text-sm">
                    Space (Commonly used)
                  </span>
                </Label>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
