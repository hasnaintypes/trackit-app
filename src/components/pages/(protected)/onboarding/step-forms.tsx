import React from "react";
import {
  User as UserIcon,
  Globe,
  RefreshCw,
  Camera,
  Calendar,
  ShieldAlert,
  Mail,
  BarChart3,
  Coins,
  Languages,
  MapPin,
  UserCircle,
} from "lucide-react";
import { Button } from "@ui/button";
import { Label } from "@ui/label";
import { Switch } from "@ui/switch";
import { Input } from "@ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import {
  Currency,
  Language,
  DateFormat,
  Gender,
  type Country,
  type Timezone,
  WeekDay,
} from "@prisma/client";
import { motion } from "framer-motion";
import {
  CountryOptions,
  TimezoneOptions,
  CURRENCY_SYMBOLS,
} from "@/constants/formatting";
import { cn } from "@/lib/utils";

// Re-using the types from your original file or a shared types file
interface OnboardingState {
  name: string;
  gender: Gender;
  country: Country;
  timezone: Timezone;
  avatarUrl: string;
  avatarFile: File | null;
  currency: Currency;
  language: Language;
  dateFormat: DateFormat;
  weekStartsOn: WeekDay;
  largeTx: number;
  lowBalance: number;
  emailWeekly: boolean;
  emailMonthly: boolean;
  compactNumbers: boolean;
}

interface StepFormsProps {
  step: number;
  prefs: OnboardingState;
  setPrefs: React.Dispatch<React.SetStateAction<OnboardingState>>;
  handleShuffleAvatar: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

// ---------------------------------------------------------------------------
// Shared row — matches display-settings.tsx SettingRow
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
// Currency display map — matches display-settings.tsx
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

export function StepForms({
  step,
  prefs,
  setPrefs,
  handleShuffleAvatar,
  handleFileChange,
  fileInputRef,
}: StepFormsProps) {
  const formVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const updatePref = <K extends keyof OnboardingState>(
    key: K,
    value: OnboardingState[K],
  ) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const currencySymbol = CURRENCY_SYMBOLS[prefs.currency] ?? "$";

  return (
    <motion.div
      key={step}
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="mx-auto w-full py-4"
    >
      {/* STEP 1: IDENTITY */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="group relative">
              <Avatar className="border-background ring-muted h-36 w-36 border-4 shadow-xl ring-2 transition-transform group-hover:scale-[1.02]">
                <AvatarImage src={prefs.avatarUrl} className="object-cover" />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <UserIcon className="h-14 w-14" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-background hover:bg-muted h-8 w-8 rounded-full shadow-sm"
                  onClick={handleShuffleAvatar}
                  type="button"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-background hover:bg-muted h-8 w-8 rounded-full shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Camera className="h-3.5 w-3.5" />
                </Button>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="divide-border divide-y">
            <SettingRow
              icon={UserCircle}
              label="Display Name"
              description="How you appear across Trackit"
            >
              <Input
                className="w-full"
                placeholder="e.g. John Doe"
                value={prefs.name}
                onChange={(e) => updatePref("name", e.target.value)}
              />
            </SettingRow>

            <SettingRow
              icon={UserIcon}
              label="Gender"
              description="Used for personalization"
            >
              <Select
                value={prefs.gender}
                onValueChange={(v) => updatePref("gender", v as Gender)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Gender.MALE}>Male</SelectItem>
                  <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                  <SelectItem value={Gender.OTHER}>Other / Private</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow
              icon={MapPin}
              label="Country"
              description="Your primary location"
            >
              <Select
                value={prefs.country}
                onValueChange={(v) => updatePref("country", v as Country)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CountryOptions).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow
              icon={Globe}
              label="Timezone"
              description="For scheduling and reports"
            >
              <Select
                value={prefs.timezone}
                onValueChange={(v) => updatePref("timezone", v as Timezone)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TimezoneOptions).map(([code, label]) => (
                    <SelectItem key={code} value={code}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>
          </div>
        </div>
      )}

      {/* STEP 2: REGIONAL */}
      {step === 2 && (
        <div className="divide-border divide-y">
          <SettingRow
            icon={Coins}
            label="Primary Currency"
            description="Default currency for accounts"
          >
            <Select
              value={prefs.currency}
              onValueChange={(v) => updatePref("currency", v as Currency)}
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
              value={prefs.language}
              onValueChange={(v) => updatePref("language", v as Language)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Language.EN}>English</SelectItem>
                <SelectItem value={Language.ES}>Espa&#241;ol</SelectItem>
                <SelectItem value={Language.FR}>Fran&#231;ais</SelectItem>
                <SelectItem value={Language.DE}>Deutsch</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            icon={Calendar}
            label="Date Format"
            description="How dates are displayed"
          >
            <Select
              value={prefs.dateFormat}
              onValueChange={(v) => updatePref("dateFormat", v as DateFormat)}
            >
              <SelectTrigger className="w-full">
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
          </SettingRow>

          <SettingRow
            icon={Calendar}
            label="Week Starts On"
            description="First day of the week"
          >
            <Select
              value={prefs.weekStartsOn}
              onValueChange={(v) => updatePref("weekStartsOn", v as WeekDay)}
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
        </div>
      )}

      {/* STEP 3: VIGILANCE */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-relaxed">
              Set your safety thresholds. You&apos;ll be alerted immediately
              when transactions exceed these limits or your balance runs low.
            </p>
          </div>

          <div className="divide-border divide-y">
            <SettingRow
              icon={ShieldAlert}
              label="Large Transaction Alert"
              description="Notify me for transactions above this amount"
            >
              <div className="relative">
                <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  value={prefs.largeTx}
                  onChange={(e) =>
                    updatePref("largeTx", Number(e.target.value))
                  }
                  className="w-full pl-8"
                />
              </div>
            </SettingRow>

            <SettingRow
              icon={Coins}
              label="Low Balance Warning"
              description="Warn me when account balance drops below this"
            >
              <div className="relative">
                <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  value={prefs.lowBalance}
                  onChange={(e) =>
                    updatePref("lowBalance", Number(e.target.value))
                  }
                  className="w-full pl-8"
                />
              </div>
            </SettingRow>
          </div>
        </div>
      )}

      {/* STEP 4: EXPERIENCE */}
      {step === 4 && (
        <div className="divide-border divide-y">
          <SettingRow
            icon={Mail}
            label="Weekly Digest"
            description="Receive a spending summary every Monday"
          >
            <div className="flex justify-end">
              <Switch
                checked={prefs.emailWeekly}
                onCheckedChange={(c) => {
                  updatePref("emailWeekly", c);
                  updatePref("emailMonthly", c);
                }}
              />
            </div>
          </SettingRow>

          <SettingRow
            icon={BarChart3}
            label="Compact Numbers"
            description='Display 1,500,000 as "1.5M" in charts'
          >
            <div className="flex justify-end">
              <Switch
                checked={prefs.compactNumbers}
                onCheckedChange={(c) => updatePref("compactNumbers", c)}
              />
            </div>
          </SettingRow>
        </div>
      )}
    </motion.div>
  );
}
