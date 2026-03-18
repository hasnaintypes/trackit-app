"use client";

import { useRouter } from "next/navigation";
import { Button } from "@ui/button";
import { AlertTriangle } from "lucide-react";

export default function FeaturesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <main className="bg-background text-foreground flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-destructive/10 text-destructive rounded-full p-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md text-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="mt-4 flex gap-3">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => router.push("/overview")}>
            Go to Overview
          </Button>
        </div>
      </div>
    </main>
  );
}
