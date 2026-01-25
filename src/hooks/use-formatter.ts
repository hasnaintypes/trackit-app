"use client";

import { useSettings } from "@/hooks/use-settings";
import { formatAmount, formatDate } from "@/lib/formatters";
import type { Currency } from "@prisma/client";

export function useFormatter() {
  const { settings, isLoading } = useSettings();

  const activeFormatAmount = (
    amount: number | string,
    overrideCurrency?: Currency,
  ) => {
    if (isLoading || !settings) {
      // Return a basic fallback while loading
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: overrideCurrency ?? "USD",
      }).format(typeof amount === "string" ? parseFloat(amount) : amount);
    }

    return formatAmount(amount, {
      currency: overrideCurrency ?? settings.preferences.defaultCurrency,
      decimalPlaces: settings.display.decimalPlaces,
      currencyPosition: settings.display.currencyPosition,
      thousandSeparator: settings.display.thousandSeparator,
      compactNumbers: settings.display.compactNumbers,
    });
  };

  const activeFormatDate = (date: Date | string) => {
    if (isLoading || !settings) {
      return new Date(date).toLocaleDateString();
    }

    return formatDate(date, settings.preferences.dateFormat);
  };

  return {
    formatAmount: activeFormatAmount,
    formatDate: activeFormatDate,
    isLoading,
    preferences: settings?.preferences,
    display: settings?.display,
  };
}
