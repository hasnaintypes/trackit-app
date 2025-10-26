"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="animate-in fade-in flex flex-col items-center gap-4 duration-500">
        <div className="bg-muted text-muted-foreground rounded-full p-4">
          <SearchX className="h-10 w-10" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">
          Page Not Found
        </h1>

        <p className="text-muted-foreground max-w-md">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        <div className="mt-6 flex gap-3">
          <Button variant="default" onClick={() => router.push("/")}>
            Go Home
          </Button>
          <Button variant="secondary" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </main>
  );
}
