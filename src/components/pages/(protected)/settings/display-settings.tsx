"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Label } from "@ui/label";
import { RadioGroup, RadioGroupItem } from "@ui/radio-group";
import { Switch } from "@ui/switch";
import { Skeleton } from "@ui/skeleton";
import {
  Globe,
  Calendar,
  Clock,
  Languages,
  Coins,
  CalendarDays,
  Hash,
  DollarSign,
  SeparatorHorizontal,
  BarChart3,
} from "lucide-react";
import {
  CurrencyPosition,
  ThousandSeparator,
  Currency,
  Language,
  DateFormat,
  TimeFormat,
  WeekDay,
} from "@prisma/client";

// ---------------------------------------------------------------------------
// Shared row component — label+description left, control right
// ---------------------------------------------------------------------------
function SettingRow({
  icon: Icon,
  label,
  description,
  children,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <Icon className="text-muted-foreground h-4 w-4" />
          </div>
        )}
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-muted-foreground text-xs">{description}</p>
          )}
        </div>
      </div>
      <div className="w-full sm:w-48">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper — title + divider + children
// ---------------------------------------------------------------------------
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
        {title}
      </h3>
      <div className="divide-border divide-y">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Format preview helper
// ---------------------------------------------------------------------------
function useFormatPreview(
  currencyPosition: CurrencyPosition,
  thousandSeparator: ThousandSeparator,
  decimalPlaces: number,
  defaultCurrency: Currency,
  compactNumbers: boolean,
) {
  return useMemo(() => {
    const sep =
      thousandSeparator === ThousandSeparator.COMMA
        ? ","
        : thousandSeparator === ThousandSeparator.SPACE
          ? " "
          : "";
    const dec = thousandSeparator === ThousandSeparator.SPACE ? "," : ".";

    if (compactNumbers) {
      const symbol =
        defaultCurrency === Currency.EUR
          ? "\u20AC"
          : defaultCurrency === Currency.GBP
            ? "\u00A3"
            : "$";
      return currencyPosition === CurrencyPosition.BEFORE
        ? `${symbol}1.2M`
        : `1.2M ${symbol}`;
    }

    const decimals = dec + "0".repeat(decimalPlaces);
    const num = `1${sep}234${decimalPlaces > 0 ? decimals : ""}`;
    const symbol =
      defaultCurrency === Currency.EUR
        ? "\u20AC"
        : defaultCurrency === Currency.GBP
          ? "\u00A3"
          : "$";
    return currencyPosition === CurrencyPosition.BEFORE
      ? `${symbol}${num}`
      : `${num} ${symbol}`;
  }, [
    currencyPosition,
    thousandSeparator,
    decimalPlaces,
    defaultCurrency,
    compactNumbers,
  ]);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function DisplaySettings() {
  const { settings, isLoading, updateDisplay, updateRegional, isUpdating } =
    useSettings();
  const { theme: currentTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const display = settings?.display;
  const preferences = settings?.preferences;

  const preview = useFormatPreview(
    display?.currencyPosition ?? CurrencyPosition.BEFORE,
    display?.thousandSeparator ?? ThousandSeparator.COMMA,
    display?.decimalPlaces ?? 2,
    preferences?.defaultCurrency ?? Currency.USD,
    display?.compactNumbers ?? false,
  );

  if (isLoading || !settings || !display || !preferences) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ================================================================= */}
      {/* THEME */}
      {/* ================================================================= */}
      <Section title="Theme">
        <div className="py-5">
          <RadioGroup
            value={mounted ? (currentTheme ?? "light") : "light"}
            onValueChange={(val) => setTheme(val)}
            className="grid grid-cols-3 gap-4"
          >
            {/* Light */}
            <label className="cursor-pointer">
              <RadioGroupItem value="light" className="sr-only" />
              <div
                className={cn(
                  "rounded-xl border-2 p-1.5 transition-all",
                  mounted && currentTheme === "light"
                    ? "border-primary ring-primary/25 ring-2"
                    : "border-border hover:border-muted-foreground/30",
                )}
              >
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
              <p className="mt-2 text-center text-sm font-medium">Light</p>
            </label>

            {/* Dark */}
            <label className="cursor-pointer">
              <RadioGroupItem value="dark" className="sr-only" />
              <div
                className={cn(
                  "rounded-xl border-2 p-1.5 transition-all",
                  mounted && currentTheme === "dark"
                    ? "border-primary ring-primary/25 ring-2"
                    : "border-border hover:border-muted-foreground/30",
                )}
              >
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
              <p className="mt-2 text-center text-sm font-medium">Dark</p>
            </label>

            {/* System */}
            <label className="cursor-pointer">
              <RadioGroupItem value="system" className="sr-only" />
              <div
                className={cn(
                  "rounded-xl border-2 p-1.5 transition-all",
                  mounted && currentTheme === "system"
                    ? "border-primary ring-primary/25 ring-2"
                    : "border-border hover:border-muted-foreground/30",
                )}
              >
                <div className="flex gap-0 overflow-hidden rounded-lg">
                  {/* Left half — light */}
                  <div className="w-1/2 space-y-2 bg-[#ecedef] p-2">
                    <div className="space-y-2 rounded-l-md bg-white p-2 shadow-xs">
                      <div className="h-2 w-4/5 rounded-lg bg-[#ecedef]" />
                      <div className="h-2 w-3/5 rounded-lg bg-[#ecedef]" />
                    </div>
                    <div className="flex items-center space-x-2 rounded-l-md bg-white p-2 shadow-xs">
                      <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                      <div className="h-2 flex-1 rounded-lg bg-[#ecedef]" />
                    </div>
                    <div className="flex items-center space-x-2 rounded-l-md bg-white p-2 shadow-xs">
                      <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                      <div className="h-2 flex-1 rounded-lg bg-[#ecedef]" />
                    </div>
                  </div>
                  {/* Right half — dark */}
                  <div className="w-1/2 space-y-2 bg-slate-950 p-2">
                    <div className="space-y-2 rounded-r-md bg-slate-800 p-2 shadow-xs">
                      <div className="h-2 w-4/5 rounded-lg bg-slate-400" />
                      <div className="h-2 w-3/5 rounded-lg bg-slate-400" />
                    </div>
                    <div className="flex items-center space-x-2 rounded-r-md bg-slate-800 p-2 shadow-xs">
                      <div className="h-4 w-4 rounded-full bg-slate-400" />
                      <div className="h-2 flex-1 rounded-lg bg-slate-400" />
                    </div>
                    <div className="flex items-center space-x-2 rounded-r-md bg-slate-800 p-2 shadow-xs">
                      <div className="h-4 w-4 rounded-full bg-slate-400" />
                      <div className="h-2 flex-1 rounded-lg bg-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-center text-sm font-medium">System</p>
            </label>
          </RadioGroup>
        </div>
      </Section>

      {/* ================================================================= */}
      {/* REGIONAL */}
      {/* ================================================================= */}
      <Section title="Regional">
        <SettingRow
          icon={Coins}
          label="Currency"
          description="Primary currency for accounts"
        >
          <Select
            value={preferences.defaultCurrency}
            disabled={isUpdating}
            onValueChange={(val) =>
              updateRegional({ defaultCurrency: val as Currency })
            }
          >
            <SelectTrigger className="w-full">
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
        </SettingRow>

        <SettingRow
          icon={Languages}
          label="Language"
          description="Display language"
        >
          <Select
            value={preferences.language}
            disabled={isUpdating}
            onValueChange={(val) =>
              updateRegional({ language: val as Language })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Language.EN}>English</SelectItem>
              <SelectItem value={Language.ES}>Espa&#241;ol</SelectItem>
              <SelectItem value={Language.FR}>Fran&#231;ais</SelectItem>
              <SelectItem value={Language.DE}>Deutsch</SelectItem>
              <SelectItem value={Language.IT}>Italiano</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          icon={Calendar}
          label="Date Format"
          description="How dates are displayed"
        >
          <Select
            value={preferences.dateFormat}
            disabled={isUpdating}
            onValueChange={(val) =>
              updateRegional({ dateFormat: val as DateFormat })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DateFormat.MM_DD_YYYY}>MM/DD/YYYY</SelectItem>
              <SelectItem value={DateFormat.DD_MM_YYYY}>DD/MM/YYYY</SelectItem>
              <SelectItem value={DateFormat.YYYY_MM_DD}>YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          icon={Clock}
          label="Time Format"
          description="12-hour or 24-hour clock"
        >
          <Select
            value={preferences.timeFormat}
            disabled={isUpdating}
            onValueChange={(val) =>
              updateRegional({ timeFormat: val as TimeFormat })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TimeFormat.H12}>12h (2:30 PM)</SelectItem>
              <SelectItem value={TimeFormat.H24}>24h (14:30)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          icon={CalendarDays}
          label="Week Starts On"
          description="First day of the week"
        >
          <Select
            value={preferences.weekStartsOn}
            disabled={isUpdating}
            onValueChange={(val) =>
              updateRegional({ weekStartsOn: val as WeekDay })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={WeekDay.SUNDAY}>Sunday</SelectItem>
              <SelectItem value={WeekDay.MONDAY}>Monday</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </Section>

      {/* ================================================================= */}
      {/* NUMBER FORMATTING — with live preview */}
      {/* ================================================================= */}
      <Section title="Number Formatting">
        {/* Live preview banner */}
        <div className="py-5">
          <div className="bg-muted/50 flex items-center justify-between rounded-xl border px-5 py-4">
            <div className="space-y-0.5">
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Preview
              </p>
              <p className="text-foreground text-2xl font-bold tracking-tight tabular-nums">
                {preview}
              </p>
            </div>
            <Globe className="text-muted-foreground/40 h-8 w-8" />
          </div>
        </div>

        <SettingRow
          icon={DollarSign}
          label="Symbol Position"
          description="Before or after the amount"
        >
          <Select
            value={display.currencyPosition}
            disabled={isUpdating}
            onValueChange={(val) =>
              updateDisplay({ currencyPosition: val as CurrencyPosition })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CurrencyPosition.BEFORE}>
                Before ($100)
              </SelectItem>
              <SelectItem value={CurrencyPosition.AFTER}>
                After (100$)
              </SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          icon={SeparatorHorizontal}
          label="Thousands Separator"
          description="Digit grouping style"
        >
          <Select
            value={display.thousandSeparator}
            disabled={isUpdating}
            onValueChange={(val) =>
              updateDisplay({ thousandSeparator: val as ThousandSeparator })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ThousandSeparator.COMMA}>
                Comma (1,234)
              </SelectItem>
              <SelectItem value={ThousandSeparator.SPACE}>
                Space (1 234)
              </SelectItem>
              <SelectItem value={ThousandSeparator.NONE}>
                None (1234)
              </SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          icon={Hash}
          label="Decimal Places"
          description="Number of decimal digits"
        >
          <Select
            value={String(display.decimalPlaces)}
            disabled={isUpdating}
            onValueChange={(val) =>
              updateDisplay({ decimalPlaces: parseInt(val) })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 (1234)</SelectItem>
              <SelectItem value="2">2 (1234.56)</SelectItem>
              <SelectItem value="4">4 (1234.5678)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          icon={BarChart3}
          label="Compact Numbers"
          description='Show "1.2M" instead of "1,200,000" in charts'
        >
          <div className="flex justify-end">
            <Switch
              checked={display.compactNumbers}
              onCheckedChange={(checked) =>
                updateDisplay({ compactNumbers: checked })
              }
              disabled={isUpdating}
            />
          </div>
        </SettingRow>
      </Section>
    </div>
  );
}
