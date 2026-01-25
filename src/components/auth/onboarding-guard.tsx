"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/hooks/use-user";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isFetched } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we've finished loading and the user hasn't completed onboarding,
    // and they aren't already on the onboarding page, redirect them.
    if (
      isFetched &&
      user &&
      !user.hasCompletedOnboarding &&
      pathname !== "/onboarding"
    ) {
      router.replace("/onboarding");
    }
  }, [user, isLoading, isFetched, pathname, router]);

  // Optionally show a loading state while checking
  if (isLoading) return null;

  return <>{children}</>;
}
