import React from "react";
import {
  User as UserIcon,
  Globe,
  RefreshCw,
  Camera,
  Calendar,
  ShieldAlert,
  Moon,
  Sun,
  Laptop,
  Mail,
  BarChart3,
  DollarSign,
  Languages,
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
  Country,
  Timezone,
  WeekDay,
  ColorScheme,
} from "@prisma/client";
import { motion } from "framer-motion";

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
  colorScheme: ColorScheme;
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

  return (
    <motion.div
      key={step}
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="mx-auto w-full max-w-md py-4"
    >
      {/* STEP 1: IDENTITY */}
      {step === 1 && (
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="group relative">
              <Avatar className="border-background ring-muted h-32 w-32 border-4 shadow-2xl ring-2 transition-transform group-hover:scale-[1.02]">
                <AvatarImage src={prefs.avatarUrl} className="object-cover" />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <UserIcon className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>

              <div className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-background hover:bg-muted h-9 w-9 rounded-full shadow-sm"
                  onClick={handleShuffleAvatar}
                  type="button"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-background hover:bg-muted h-9 w-9 rounded-full shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Camera className="h-4 w-4" />
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

            <div className="w-full space-y-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  className="bg-muted/30 h-11"
                  placeholder="e.g. John Doe"
                  value={prefs.name}
                  onChange={(e) => updatePref("name", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={prefs.gender}
                    onValueChange={(v) => updatePref("gender", v as Gender)}
                  >
                    <SelectTrigger className="bg-muted/30 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Gender.MALE}>Male</SelectItem>
                      <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                      <SelectItem value={Gender.OTHER}>
                        Other / Private
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select
                    value={prefs.country}
                    onValueChange={(v) => updatePref("country", v as Country)}
                  >
                    <SelectTrigger className="bg-muted/30 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Country).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="text-muted-foreground h-3.5 w-3.5" />{" "}
                  Timezone
                </Label>
                <Select
                  value={prefs.timezone}
                  onValueChange={(v) => updatePref("timezone", v as Timezone)}
                >
                  <SelectTrigger className="bg-muted/30 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Timezone).map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: REGIONAL */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="text-muted-foreground h-3.5 w-3.5" />{" "}
                Primary Currency
              </Label>
              <Select
                value={prefs.currency}
                onValueChange={(v) => updatePref("currency", v as Currency)}
              >
                <SelectTrigger className="bg-muted/30 h-12 text-lg font-medium">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Languages className="text-muted-foreground h-3.5 w-3.5" />{" "}
                  Language
                </Label>
                <Select
                  value={prefs.language}
                  onValueChange={(v) => updatePref("language", v as Language)}
                >
                  <SelectTrigger className="bg-muted/30 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Language.EN}>English</SelectItem>
                    <SelectItem value={Language.ES}>Spanish</SelectItem>
                    <SelectItem value={Language.FR}>French</SelectItem>
                    <SelectItem value={Language.DE}>German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select
                  value={prefs.dateFormat}
                  onValueChange={(v) =>
                    updatePref("dateFormat", v as DateFormat)
                  }
                >
                  <SelectTrigger className="bg-muted/30 h-11">
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
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-3.5 w-3.5" /> Week
                Starts On
              </Label>
              <Select
                value={prefs.weekStartsOn}
                onValueChange={(v) => updatePref("weekStartsOn", v as WeekDay)}
              >
                <SelectTrigger className="bg-muted/30 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(WeekDay).map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: VIGILANCE */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-relaxed">
              We use these limits to detect unusual activity. You&apos;ll be
              alerted immediately if transactions exceed these thresholds.
            </p>
          </div>

          <div className="grid gap-6 pt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base">Large Transaction Alert</Label>
                <div className="relative">
                  <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                    $
                  </span>
                  <Input
                    type="number"
                    value={prefs.largeTx}
                    onChange={(e) =>
                      updatePref("largeTx", Number(e.target.value))
                    }
                    className="bg-muted/30 h-12 pl-8 text-lg"
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  Transactions above this amount trigger an email.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-base">Low Balance Warning</Label>
                <div className="relative">
                  <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                    $
                  </span>
                  <Input
                    type="number"
                    value={prefs.lowBalance}
                    onChange={(e) =>
                      updatePref("lowBalance", Number(e.target.value))
                    }
                    className="bg-muted/30 h-12 pl-8 text-lg"
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  We&apos;ll warn you when liquidity drops below this.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: EXPERIENCE */}
      {step === 4 && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={prefs.colorScheme}
                onValueChange={(v) =>
                  updatePref("colorScheme", v as ColorScheme)
                }
              >
                <SelectTrigger className="bg-muted/30 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ColorScheme.LIGHT}>
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" /> Light
                    </div>
                  </SelectItem>
                  <SelectItem value={ColorScheme.DARK}>
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" /> Dark
                    </div>
                  </SelectItem>
                  <SelectItem value={ColorScheme.SYSTEM}>
                    <div className="flex items-center gap-2">
                      <Laptop className="h-4 w-4" /> Auto
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/20 divide-y rounded-xl border">
            <div className="flex items-center justify-between p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Weekly Digest</span>
                </div>
                <p className="text-muted-foreground pl-6 text-xs">
                  Receive a summary every Monday.
                </p>
              </div>
              <Switch
                checked={prefs.emailWeekly}
                onCheckedChange={(c) => {
                  updatePref("emailWeekly", c);
                  updatePref("emailMonthly", c);
                }}
              />
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Compact Numbers</span>
                </div>
                <p className="text-muted-foreground pl-6 text-xs">
                  Display 1,500,000 as &quot;1.5M&quot;
                </p>
              </div>
              <Switch
                checked={prefs.compactNumbers}
                onCheckedChange={(c) => updatePref("compactNumbers", c)}
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
