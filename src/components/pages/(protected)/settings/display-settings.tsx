"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Switch } from "@ui/switch";
import { Button } from "@ui/button";
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
  Save,
  Loader2,
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
// Currency display map
// ---------------------------------------------------------------------------
const CURRENCY_LABELS: Record<Currency, { symbol: string; name: string }> = {
  [Currency.USD]: { symbol: "$", name: "US Dollar" },
  [Currency.EUR]: { symbol: "\u20AC", name: "Euro" },
  [Currency.GBP]: { symbol: "\u00A3", name: "British Pound" },
  [Currency.JPY]: { symbol: "\u00A5", name: "Japanese Yen" },
  [Currency.AUD]: { symbol: "A$", name: "Australian Dollar" },
  [Currency.CAD]: { symbol: "C$", name: "Canadian Dollar" },
  [Currency.CHF]: { symbol: "Fr", name: "Swiss Franc" },
  [Currency.CNY]: { symbol: "\u00A5", name: "Chinese Yuan" },
  [Currency.INR]: { symbol: "\u20B9", name: "Indian Rupee" },
  [Currency.SGD]: { symbol: "S$", name: "Singapore Dollar" },
  [Currency.PKR]: { symbol: "Rs", name: "Pakistani Rupee" },
};

// ---------------------------------------------------------------------------
// Shared row component
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
          <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
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
// Section wrapper
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
      <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
        {title}
      </h3>
      <div className="bg-card divide-border divide-y rounded-xl border px-5 shadow-sm dark:border-white/10">
        {children}
      </div>
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
    const symbol = CURRENCY_LABELS[defaultCurrency]?.symbol ?? "$";

    if (compactNumbers) {
      return currencyPosition === CurrencyPosition.BEFORE
        ? `${symbol}1.2M`
        : `1.2M ${symbol}`;
    }

    const decimals = dec + "0".repeat(decimalPlaces);
    const num = `1${sep}234${decimalPlaces > 0 ? decimals : ""}`;
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
// Local state types
// ---------------------------------------------------------------------------
interface LocalRegional {
  defaultCurrency: Currency;
  language: Language;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  weekStartsOn: WeekDay;
}

interface LocalDisplay {
  currencyPosition: CurrencyPosition;
  thousandSeparator: ThousandSeparator;
  decimalPlaces: number;
  compactNumbers: boolean;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function DisplaySettings() {
  const { settings, isLoading, updateDisplay, updateRegional, isUpdating } =
    useSettings();

  const display = settings?.display;
  const preferences = settings?.preferences;

  // Local buffered state — only saved on button click
  const [localRegional, setLocalRegional] = useState<LocalRegional | null>(
    null,
  );
  const [localDisplay, setLocalDisplay] = useState<LocalDisplay | null>(null);

  // Seed local state once server data arrives
  useEffect(() => {
    if (preferences && !localRegional) {
      setLocalRegional({
        defaultCurrency: preferences.defaultCurrency,
        language: preferences.language,
        dateFormat: preferences.dateFormat,
        timeFormat: preferences.timeFormat,
        weekStartsOn: preferences.weekStartsOn,
      });
    }
  }, [preferences, localRegional]);

  useEffect(() => {
    if (display && !localDisplay) {
      setLocalDisplay({
        currencyPosition: display.currencyPosition,
        thousandSeparator: display.thousandSeparator,
        decimalPlaces: display.decimalPlaces,
        compactNumbers: display.compactNumbers,
      });
    }
  }, [display, localDisplay]);

  const preview = useFormatPreview(
    localDisplay?.currencyPosition ?? CurrencyPosition.BEFORE,
    localDisplay?.thousandSeparator ?? ThousandSeparator.COMMA,
    localDisplay?.decimalPlaces ?? 2,
    localRegional?.defaultCurrency ?? Currency.USD,
    localDisplay?.compactNumbers ?? false,
  );

  // Dirty check
  const isDirty = useMemo(() => {
    if (!localRegional || !localDisplay || !preferences || !display)
      return false;
    return (
      localRegional.defaultCurrency !== preferences.defaultCurrency ||
      localRegional.language !== preferences.language ||
      localRegional.dateFormat !== preferences.dateFormat ||
      localRegional.timeFormat !== preferences.timeFormat ||
      localRegional.weekStartsOn !== preferences.weekStartsOn ||
      localDisplay.currencyPosition !== display.currencyPosition ||
      localDisplay.thousandSeparator !== display.thousandSeparator ||
      localDisplay.decimalPlaces !== display.decimalPlaces ||
      localDisplay.compactNumbers !== display.compactNumbers
    );
  }, [localRegional, localDisplay, preferences, display]);

  const handleSave = async () => {
    if (!localRegional || !localDisplay) return;
    await Promise.all([
      updateRegional(localRegional),
      updateDisplay(localDisplay),
    ]);
  };

  if (isLoading || !settings || !localRegional || !localDisplay) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
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
            value={localRegional.defaultCurrency}
            onValueChange={(val) =>
              setLocalRegional((p) =>
                p ? { ...p, defaultCurrency: val as Currency } : p,
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Currency).map((c) => {
                const info = CURRENCY_LABELS[c];
                return (
                  <SelectItem key={c} value={c}>
                    <span className="flex items-center gap-2">
                      <span className="text-muted-foreground w-6 text-center font-mono text-xs">
                        {info?.symbol}
                      </span>
                      {c} — {info?.name}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          icon={Languages}
          label="Language"
          description="Display language"
        >
          <Select
            value={localRegional.language}
            onValueChange={(val) =>
              setLocalRegional((p) =>
                p ? { ...p, language: val as Language } : p,
              )
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
            value={localRegional.dateFormat}
            onValueChange={(val) =>
              setLocalRegional((p) =>
                p ? { ...p, dateFormat: val as DateFormat } : p,
              )
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
            value={localRegional.timeFormat}
            onValueChange={(val) =>
              setLocalRegional((p) =>
                p ? { ...p, timeFormat: val as TimeFormat } : p,
              )
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
            value={localRegional.weekStartsOn}
            onValueChange={(val) =>
              setLocalRegional((p) =>
                p ? { ...p, weekStartsOn: val as WeekDay } : p,
              )
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
            value={localDisplay.currencyPosition}
            onValueChange={(val) =>
              setLocalDisplay((p) =>
                p ? { ...p, currencyPosition: val as CurrencyPosition } : p,
              )
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
            value={localDisplay.thousandSeparator}
            onValueChange={(val) =>
              setLocalDisplay((p) =>
                p ? { ...p, thousandSeparator: val as ThousandSeparator } : p,
              )
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
            value={String(localDisplay.decimalPlaces)}
            onValueChange={(val) =>
              setLocalDisplay((p) =>
                p ? { ...p, decimalPlaces: parseInt(val) } : p,
              )
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
              checked={localDisplay.compactNumbers}
              onCheckedChange={(checked) =>
                setLocalDisplay((p) =>
                  p ? { ...p, compactNumbers: checked } : p,
                )
              }
            />
          </div>
        </SettingRow>
      </Section>

      {/* ================================================================= */}
      {/* SAVE BUTTON */}
      {/* ================================================================= */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!isDirty || isUpdating}
          className="min-w-32"
        >
          {isUpdating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
