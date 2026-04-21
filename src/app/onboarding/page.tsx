"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@ui/button";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useUser } from "@/hooks/use-user";
import { Logo } from "@common/branding/logo";

import {
  Currency,
  Language,
  DateFormat,
  Gender,
  Country,
  Timezone,
  WeekDay,
} from "@prisma/client";
import { StepForms } from "@/components/pages/(protected)/onboarding/step-forms";
import { createLogger } from "@/lib/logging";

const logger = createLogger("onboarding-page");

const onboardingSteps = [
  {
    id: 1,
    title: "Your Profile",
    description: "Set up your name, avatar, and location",
  },
  {
    id: 2,
    title: "Regional Preferences",
    description: "Configure currency, language, and date formatting",
  },
  {
    id: 3,
    title: "Safety Alerts",
    description: "Set thresholds for unusual activity notifications",
  },
  {
    id: 4,
    title: "Experience",
    description: "Choose how you receive reports and view numbers",
  },
];

export interface OnboardingState {
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

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refetch, uploadFile, isFetched } = useUser();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if already onboarded
  useEffect(() => {
    if (isFetched && user?.hasCompletedOnboarding) {
      router.replace("/overview");
    }
  }, [isFetched, user, router]);

  // Consolidated State
  const [prefs, setPrefs] = useState<OnboardingState>({
    name: "",
    gender: Gender.OTHER,
    country: Country.US,
    timezone: Timezone.UTC,
    avatarUrl: "",
    avatarFile: null,
    currency: Currency.USD,
    language: Language.EN,
    dateFormat: DateFormat.MM_DD_YYYY,
    weekStartsOn: WeekDay.SUNDAY,
    largeTx: 1000,
    lowBalance: 500,
    emailWeekly: true,
    emailMonthly: true,
    compactNumbers: false,
  });

  // Init state from user
  useEffect(() => {
    if (user) {
      setPrefs((prev) => ({
        ...prev,
        name: user.name ?? "",
        gender: user.gender ?? Gender.OTHER,
        country: user.country ?? Country.US,
        timezone: user.timezone ?? Timezone.UTC,
        avatarUrl:
          user.image ??
          `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.id}`,
      }));
    }
  }, [user]);

  const updateProfile = api.user.updateProfile.useMutation();
  const updateRegional = api.settings.updateRegional.useMutation();
  const updateNotifications = api.settings.updateNotifications.useMutation();
  const updateDisplay = api.settings.updateDisplay.useMutation();
  const completeOnboarding = api.settings.completeOnboarding.useMutation();

  const handleShuffleAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setPrefs((prev) => ({
      ...prev,
      avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${randomSeed}`,
      avatarFile: null,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPrefs((prev) => ({
          ...prev,
          avatarUrl: event.target?.result as string,
          avatarFile: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (step < onboardingSteps.length) setStep(step + 1);
    else void handleFinish();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      let finalAvatarUrl = prefs.avatarUrl;

      if (prefs.avatarFile) {
        const uploadResult = await uploadFile(prefs.avatarFile);
        finalAvatarUrl = uploadResult.image;
      }

      await Promise.all([
        updateProfile.mutateAsync({
          name: prefs.name,
          gender: prefs.gender,
          country: prefs.country,
          timezone: prefs.timezone,
          image: finalAvatarUrl,
        }),
        updateRegional.mutateAsync({
          defaultCurrency: prefs.currency,
          language: prefs.language,
          dateFormat: prefs.dateFormat,
          weekStartsOn: prefs.weekStartsOn,
        }),
        updateNotifications.mutateAsync({
          largeTransactionThreshold: prefs.largeTx,
          lowBalanceThreshold: prefs.lowBalance,
          emailWeeklyDigest: prefs.emailWeekly,
          emailMonthlySummary: prefs.emailMonthly,
          emailLowBalanceAlerts: true,
          emailLargeTransactions: true,
        }),
        updateDisplay.mutateAsync({
          compactNumbers: prefs.compactNumbers,
        }),
      ]);

      await completeOnboarding.mutateAsync();
      await refetch();
      toast.success("All set! Welcome to Trackit.");
      router.push("/overview");
    } catch (err) {
      logger.error("Failed to save onboarding settings", {
        error: err instanceof Error ? err.message : String(err),
      });
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding.mutateAsync();
      await refetch();
      router.push("/overview");
    } catch {
      toast.error("Process failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentStep = onboardingSteps[step - 1];

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center p-6 pt-12 sm:pt-20">
      <div className="w-full max-w-lg space-y-8">
        {/* Logo + Header */}
        <div className="flex flex-col items-center gap-5 text-center">
          <Logo size={56} showText />

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {onboardingSteps.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s.id === step
                    ? "bg-primary w-8"
                    : s.id < step
                      ? "bg-primary/40 w-4"
                      : "bg-muted w-4"
                }`}
              />
            ))}
          </div>

          <div>
            <p className="text-muted-foreground text-sm">
              Step {step} of {onboardingSteps.length}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {currentStep?.title}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {currentStep?.description}
            </p>
          </div>
        </div>

        {/* Dynamic Form Area */}
        <div className="min-h-[340px]">
          <AnimatePresence mode="wait">
            <StepForms
              step={step}
              prefs={prefs}
              setPrefs={setPrefs}
              handleShuffleAvatar={handleShuffleAvatar}
              handleFileChange={handleFileChange}
              fileInputRef={fileInputRef}
            />
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t pt-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={step === 1 || isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>

            {step === 1 && (
              <Button
                variant="link"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground text-xs"
              >
                Skip setup
              </Button>
            )}
          </div>

          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : step === onboardingSteps.length ? (
              "Complete Setup"
            ) : (
              <>
                Continue <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
