"use client";

import { api } from "@/trpc/react";
import { invalidateSettings } from "@/lib/trpc/invalidation";
import { toast } from "sonner";

export function useSettings() {
  const utils = api.useUtils();

  const { data, isLoading, error } = api.settings.getAll.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateNotifications = api.settings.updateNotifications.useMutation({
    onSuccess: () => {
      void invalidateSettings(utils);
      toast.success("Notification preferences updated");
    },
    onError: (err) => {
      toast.error("Failed to update notification preferences: " + err.message);
    },
  });

  const updateDisplay = api.settings.updateDisplay.useMutation({
    onSuccess: () => {
      void invalidateSettings(utils);
      toast.success("Display settings updated");
    },
    onError: (err) => {
      toast.error("Failed to update display settings: " + err.message);
    },
  });

  const updateRegional = api.settings.updateRegional.useMutation({
    onSuccess: () => {
      void invalidateSettings(utils);
      toast.success("Regional preferences updated");
    },
    onError: (err) => {
      toast.error("Failed to update regional preferences: " + err.message);
    },
  });

  return {
    settings: data,
    isLoading,
    error,
    updateNotifications: updateNotifications.mutateAsync,
    updateDisplay: updateDisplay.mutateAsync,
    updateRegional: updateRegional.mutateAsync,
    isUpdating:
      updateNotifications.isPending ||
      updateDisplay.isPending ||
      updateRegional.isPending,
  };
}
