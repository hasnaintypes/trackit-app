"use client";

import { useSettings } from "@/hooks/use-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Label } from "@ui/label";
import {
  Hash,
  LayoutDashboard,
  LineChart,
  Banknote,
  ListChecks,
  Globe,
  BarChart3,
  Moon,
  Sun,
  Laptop,
} from "lucide-react";
import { Separator } from "@ui/separator";
import { RadioGroup, RadioGroupItem } from "@ui/radio-group";
import { Switch } from "@ui/switch";
import { Skeleton } from "@ui/skeleton";
import {
  DefaultView,
  CurrencyPosition,
  ThousandSeparator,
  Currency,
  Language,
  DateFormat,
  TimeFormat,
  WeekDay,
  ColorScheme,
} from "@prisma/client";
import type React from "react";

// --- Helper Component for Dashboard View Selection ---
type ViewSettingsCardProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  value: DefaultView;
  currentView: DefaultView;
  onClick: (value: DefaultView) => void;
  disabled?: boolean;
};

const ViewSettingsCard: React.FC<ViewSettingsCardProps> = ({
  icon: Icon,
  title,
  description,
  value,
  currentView,
  onClick,
  disabled,
}) => (
  <Card
    className={`hover:bg-muted/50 cursor-pointer transition-all ${
      currentView === value
        ? "border-primary ring-primary/50 ring-2"
        : "border-border"
    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    onClick={() => !disabled && onClick(value)}
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
  const { settings, isLoading, updateDisplay, updateRegional, isUpdating } =
    useSettings();

  if (isLoading || !settings) {
    return (
      <div className="flex-1 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="space-y-6 pt-4">
          <Skeleton className="h-[250px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  const display = settings.display;
  const preferences = settings.preferences;

  const viewOptions = [
    {
      icon: LayoutDashboard,
      title: "Overview",
      description: "Your financial summary and quick insights.",
      value: DefaultView.OVERVIEW,
    },
    {
      icon: ListChecks,
      title: "Transactions List",
      description: "A detailed list of all recent activity.",
      value: DefaultView.TRANSACTIONS,
    },
    {
      icon: LineChart,
      title: "Net Worth Chart",
      description: "Focus on assets, liabilities, and trend.",
      value: DefaultView.NETWORTH,
    },
    {
      icon: Banknote,
      title: "Investment Portfolio",
      description: "Detailed view of all connected investment accounts.",
      value: DefaultView.PORTFOLIO,
    },
  ];

  return (
    <div className="flex-1 space-y-6">
      {/* --- SECTION 1: Default Dashboard View --- */}
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
                currentView={display.defaultView}
                disabled={isUpdating}
                onClick={(val) => updateDisplay({ defaultView: val })}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* --- SECTION 1.5: Theme & Personalization --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Sun className="h-6 w-6 text-orange-500" />
            Theme & Personalization
          </CardTitle>
          <CardDescription>
            Choose your preferred color theme for the workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={display.colorScheme}
            disabled={isUpdating}
            onValueChange={(val) =>
              updateDisplay({ colorScheme: val as ColorScheme })
            }
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            <Label
              htmlFor="light"
              className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
            >
              <div className="flex w-full items-center justify-between">
                <Sun className="h-5 w-5 text-orange-500" />
                <RadioGroupItem value={ColorScheme.LIGHT} id="light" />
              </div>
              <span className="mt-2 font-medium">Light Mode</span>
            </Label>

            <Label
              htmlFor="dark"
              className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
            >
              <div className="flex w-full items-center justify-between">
                <Moon className="h-5 w-5 text-indigo-400" />
                <RadioGroupItem value={ColorScheme.DARK} id="dark" />
              </div>
              <span className="mt-2 font-medium">Dark Mode</span>
            </Label>

            <Label
              htmlFor="system"
              className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
            >
              <div className="flex w-full items-center justify-between">
                <Laptop className="h-5 w-5 text-slate-500" />
                <RadioGroupItem value={ColorScheme.SYSTEM} id="system" />
              </div>
              <span className="mt-2 font-medium">System Preference</span>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* --- SECTION 2: Regional & localization --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-blue-500" />
            Regional & Localization
          </CardTitle>
          <CardDescription>
            Configure your base currency and localized formats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Primary Currency
              </Label>
              <Select
                value={preferences.defaultCurrency}
                disabled={isUpdating}
                onValueChange={(val) =>
                  updateRegional({ defaultCurrency: val as Currency })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Currency).map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Language</Label>
              <Select
                value={preferences.language}
                disabled={isUpdating}
                onValueChange={(val) =>
                  updateRegional({ language: val as Language })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Language.EN}>English</SelectItem>
                  <SelectItem value={Language.ES}>Español</SelectItem>
                  <SelectItem value={Language.FR}>Français</SelectItem>
                  <SelectItem value={Language.DE}>Deutsch</SelectItem>
                  <SelectItem value={Language.IT}>Italiano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Date Format</Label>
              <Select
                value={preferences.dateFormat}
                disabled={isUpdating}
                onValueChange={(val) =>
                  updateRegional({ dateFormat: val as DateFormat })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DateFormat.MM_DD_YYYY}>
                    MM/DD/YYYY
                  </SelectItem>
                  <SelectItem value={DateFormat.DD_MM_YYYY}>
                    DD/MM/YYYY
                  </SelectItem>
                  <SelectItem value={DateFormat.YYYY_MM_DD}>
                    YYYY-MM-DD
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">
                First Day of Week
              </Label>
              <Select
                value={preferences.weekStartsOn}
                disabled={isUpdating}
                onValueChange={(val) =>
                  updateRegional({ weekStartsOn: val as WeekDay })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WeekDay.SUNDAY}>Sunday</SelectItem>
                  <SelectItem value={WeekDay.MONDAY}>Monday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Time Format</Label>
              <Select
                value={preferences.timeFormat}
                disabled={isUpdating}
                onValueChange={(val) =>
                  updateRegional({ timeFormat: val as TimeFormat })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TimeFormat.H12}>
                    12-hour (e.g., 2:30 PM)
                  </SelectItem>
                  <SelectItem value={TimeFormat.H24}>
                    24-hour (e.g., 14:30)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- SECTION 3: Financial Number Formatting --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Hash className="h-6 w-6 text-teal-500" />
            Financial Number Formatting
          </CardTitle>
          <CardDescription>
            Customize how currency and decimals appear globally.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  Decimal Precision
                </Label>
                <Select
                  value={String(display.decimalPlaces)}
                  disabled={isUpdating}
                  onValueChange={(val) =>
                    updateDisplay({ decimalPlaces: parseInt(val) })
                  }
                >
                  <SelectTrigger>
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
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Currency Symbol Position
                </Label>
                <RadioGroup
                  value={display.currencyPosition}
                  disabled={isUpdating}
                  onValueChange={(val) =>
                    updateDisplay({ currencyPosition: val as CurrencyPosition })
                  }
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="before"
                    className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
                  >
                    <div className="flex w-full items-center justify-between">
                      <p className="font-medium">$1,234.56</p>
                      <RadioGroupItem
                        value={CurrencyPosition.BEFORE}
                        id="before"
                      />
                    </div>
                    <span className="text-muted-foreground mt-1 text-sm">
                      Before Value
                    </span>
                  </Label>

                  <Label
                    htmlFor="after"
                    className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
                  >
                    <div className="flex w-full items-center justify-between">
                      <p className="font-medium">1.234,56 €</p>
                      <RadioGroupItem
                        value={CurrencyPosition.AFTER}
                        id="after"
                      />
                    </div>
                    <span className="text-muted-foreground mt-1 text-sm">
                      After Value
                    </span>
                  </Label>
                </RadioGroup>
              </div>

              <Separator />

              <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-primary h-5 w-5" />
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">
                      Compact Numbers
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Format millions as &quot;1M&quot; for cleaner chart
                      displays.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={display.compactNumbers}
                  onCheckedChange={(checked) =>
                    updateDisplay({ compactNumbers: checked })
                  }
                  disabled={isUpdating}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Thousands Separator
              </Label>
              <RadioGroup
                value={display.thousandSeparator}
                disabled={isUpdating}
                onValueChange={(val) =>
                  updateDisplay({ thousandSeparator: val as ThousandSeparator })
                }
                className="grid grid-cols-1 gap-4"
              >
                <Label
                  htmlFor="comma"
                  className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
                >
                  <div className="flex w-full items-center justify-between">
                    <p className="font-medium">1,234.56</p>
                    <RadioGroupItem
                      value={ThousandSeparator.COMMA}
                      id="comma"
                    />
                  </div>
                  <span className="text-muted-foreground mt-1 text-sm">
                    Comma (Default for US)
                  </span>
                </Label>

                <Label
                  htmlFor="space"
                  className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
                >
                  <div className="flex w-full items-center justify-between">
                    <p className="font-medium">1 234,56</p>
                    <RadioGroupItem
                      value={ThousandSeparator.SPACE}
                      id="space"
                    />
                  </div>
                  <span className="text-muted-foreground mt-1 text-sm">
                    Space (Commonly used)
                  </span>
                </Label>

                <Label
                  htmlFor="none"
                  className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4 transition-all"
                >
                  <div className="flex w-full items-center justify-between">
                    <p className="font-medium">1234.56</p>
                    <RadioGroupItem value={ThousandSeparator.NONE} id="none" />
                  </div>
                  <span className="text-muted-foreground mt-1 text-sm">
                    None
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
