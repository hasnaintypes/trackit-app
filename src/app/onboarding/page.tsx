"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Rocket } from "lucide-react";

import { Button } from "@ui/button";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useUser } from "@/hooks/use-user";

import {
  Currency,
  Language,
  DateFormat,
  DefaultView,
  Gender,
  Country,
  Timezone,
  WeekDay,
  ColorScheme,
} from "@prisma/client";
import { StepForms } from "@/components/pages/(protected)/onboarding/step-forms";
import { createLogger } from "@/lib/logging";

const logger = createLogger("onboarding-page");

const onboardingSteps = [
  { id: 1, title: "Identity", description: "Who are you?" },
  { id: 2, title: "Regional", description: "Set your local defaults" },
  { id: 3, title: "Vigilance", description: "Configure safety limits" },
  { id: 4, title: "Experience", description: "Choose your workspace" },
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
  defaultView: DefaultView;
  colorScheme: ColorScheme;
  emailWeekly: boolean;
  emailMonthly: boolean;
  compactNumbers: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refetch, uploadFile } = useUser();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    defaultView: DefaultView.OVERVIEW,
    colorScheme: ColorScheme.SYSTEM,
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

      // 1. Handle Upload if local file selected
      if (prefs.avatarFile) {
        const uploadResult = await uploadFile(prefs.avatarFile);
        finalAvatarUrl = uploadResult.image;
      }

      // 2. Parallel updates
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
          defaultView: prefs.defaultView,
          colorScheme: prefs.colorScheme,
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

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center p-6 pt-16 sm:pt-24">
      <div className="w-full max-w-3xl space-y-10">
        {/* Header Section */}
        <div className="space-y-4 text-center">
          <div className="bg-primary/10 text-primary mb-4 inline-flex items-center justify-center rounded-2xl p-3">
            <Rocket className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Welcome to Trackit
          </h1>
          <p className="text-muted-foreground mx-auto max-w-md text-lg">
            Let&apos;s customize your workspace to fit your needs. This only
            takes a minute.
          </p>
        </div>

        {/* Steps Visualizer */}
        {/* <StepsIndicator steps={onboardingSteps} currentStep={step} /> */}

        {/* Dynamic Form Area */}
        <div className="min-h-[400px]">
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
        <div className="mt-8 flex flex-col-reverse items-center justify-between gap-4 border-t pt-10 sm:flex-row">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1 || isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {step === 1 && (
              <Button
                variant="link"
                onClick={handleSkip}
                className="text-muted-foreground text-xs"
              >
                Skip setup
              </Button>
            )}
          </div>

          <Button
            size="lg"
            onClick={handleNext}
            disabled={isLoading}
            className="shadow-primary/20 w-full min-w-[140px] text-base font-semibold shadow-lg sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : step === onboardingSteps.length ? (
              "Complete Setup"
            ) : (
              <>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
