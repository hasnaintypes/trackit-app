"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@ui/button";
import { useRouter } from "next/navigation";

export default function VerifySuccessPage() {
  const router = useRouter();

  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <CheckCircle2 className="text-primary mb-6 h-16 w-16" />

      <h1 className="mb-3 text-3xl font-semibold">
        Email Verified Successfully
      </h1>

      <p className="text-muted-foreground mb-8 max-w-md">
        Your email address has been verified. You can now continue to your
        account dashboard and start exploring.
      </p>

      <Button
        onClick={() => router.push("/overview")}
        className="px-6 py-2"
        variant="default"
      >
        Go to Dashboard
      </Button>
    </main>
  );
}
