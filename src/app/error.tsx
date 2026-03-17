"use client";

import React from "react";
import { useLogger, LogLevel } from "@logtail/next";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { createLogger } from "@/lib/logging";

const logger = createLogger("error-page");

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const log = useLogger({ source: "error.tsx" });

  const status = error.message === "Invalid URL" ? 404 : 500;

  // Log error once
  React.useEffect(() => {
    try {
      log.logHttpRequest(
        LogLevel.error,
        error.message,
        {
          host: typeof window !== "undefined" ? window.location.href : "server",
          path: pathname,
          statusCode: status,
        },
        {
          name: error.name,
          cause: error.cause ?? "unknown",
          stack: error.stack?.split("\n").slice(0, 10).join("\n") ?? "no stack",
          digest: error.digest,
        },
      );
    } catch (e) {
      logger.error("Failed to log error", {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }, [
    error.cause,
    error.digest,
    error.message,
    error.name,
    error.stack,
    log,
    pathname,
    status,
  ]); // run once

  const [showDetails, setShowDetails] = React.useState(false);
  const title = status === 404 ? "Page Not Found" : "Unexpected Error";
  const message =
    status === 404
      ? "The page you’re looking for doesn’t exist or was moved."
      : "Something went wrong on our side. Try refreshing or return home.";

  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="animate-in fade-in flex flex-col items-center gap-4 duration-500">
        <div className="bg-destructive/10 text-destructive rounded-full p-4">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground max-w-md">{message}</p>

        {error?.message && (
          <div
            className={cn(
              "mt-3 w-full max-w-lg rounded-md border px-4 py-2 text-left text-sm",
              "bg-muted text-muted-foreground break-words whitespace-pre-wrap",
            )}
          >
            <strong className="text-foreground">Error:</strong> {error.message}
            {error.stack && (
              <>
                <div
                  className={cn(
                    "text-muted-foreground/80 mt-2 text-xs transition-all duration-300",
                    showDetails
                      ? "line-clamp-none"
                      : "hover:blur-0 line-clamp-3 cursor-pointer blur-[1px]",
                  )}
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {error.stack}
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-foreground/80 hover:text-foreground mt-2 text-xs underline"
                >
                  {showDetails ? "Hide details" : "Show details"}
                </button>
              </>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="default" onClick={() => router.refresh()}>
            Try Again
          </Button>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Go Home
          </Button>
        </div>
      </div>
    </main>
  );
}
