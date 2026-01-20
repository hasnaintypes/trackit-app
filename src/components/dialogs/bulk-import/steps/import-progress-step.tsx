"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTransactions } from "@/hooks/use-transactions";
import { toast } from "sonner";
import type { Transaction } from "@/types/transaction";
import type { BulkImportState } from "../types";

interface ImportProgressStepProps {
  state: BulkImportState;
  transactions: Partial<Transaction>[];
  selectedAccountId: string | null;
  onComplete: () => void;
}

const CHUNK_SIZE = 10; // Process 10 transactions at a time

export function ImportProgressStep({
  transactions,
  selectedAccountId,
  onComplete,
}: ImportProgressStepProps) {
  const { create } = useTransactions();
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(true);
  const [importErrors, setImportErrors] = useState<
    Array<{ index: number; error: string }>
  >([]);
  const hasStartedRef = React.useRef(false);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const runImport = async () => {
      addLog(`Starting import of ${transactions.length} transactions...`);

      let success = 0;
      let errors = 0;
      const importedErrors: Array<{ index: number; error: string }> = [];

      // Process in chunks to handle large files
      for (let i = 0; i < transactions.length; i += CHUNK_SIZE) {
        const chunk = transactions.slice(i, i + CHUNK_SIZE);
        const chunkPromises = chunk.map((tx, idx) =>
          (async () => {
            try {
              addLog(
                `[${i + idx + 1}/${transactions.length}] Importing: ${
                  tx.description ?? "Untitled"
                }...`,
              );

              await create.mutateAsync({
                accountId: selectedAccountId ?? "",
                amount: tx.amount ?? "0",
                type: tx.type ?? "DEBIT",
                description: tx.description ?? null,
                notes: tx.notes ?? null,
                date: tx.date,
                categoryId: tx.categoryId ?? null,
                isRecurring: tx.isRecurring ?? false,
              });

              success++;
              setSuccessCount(success);
              addLog(
                `✓ [${i + idx + 1}/${transactions.length}] Successfully imported`,
              );
            } catch (err) {
              errors++;
              setErrorCount(errors);
              const errorMsg =
                err instanceof Error ? err.message : "Unknown error";
              importedErrors.push({
                index: i + idx + 1,
                error: errorMsg,
              });
              addLog(
                `✗ [${i + idx + 1}/${transactions.length}] Import failed: ${errorMsg}`,
              );
            }

            // Update progress
            const currentProgress = Math.round(
              ((i + idx + 1) / transactions.length) * 100,
            );
            setProgress(currentProgress);
          })(),
        );

        // Wait for this chunk to complete before moving to next
        await Promise.all(chunkPromises);
      }

      setImportErrors(importedErrors);

      if (errors > 0) {
        addLog(
          `\nImport completed with ${success} successes and ${errors} errors`,
        );
        toast.error(`${errors} transaction(s) failed to import`);
      } else {
        addLog(
          `\nImport completed successfully! All ${success} transactions imported.`,
        );
        toast.success(
          `${success} transaction${success !== 1 ? "s" : ""} imported successfully!`,
        );
      }

      setIsImporting(false);
    };

    void runImport();
    // Note: omit `create` from dependency list because the hook may return a non-stable reference
    // and would retrigger the effect repeatedly. We only re-run when `transactions` or `selectedAccountId` change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, selectedAccountId]);

  const progressPercent = Math.round((progress / 100) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Import Progress</h3>
            <p className="text-muted-foreground text-sm">
              {progressPercent}% complete
            </p>
          </div>
          {isImporting && (
            <Loader2 className="text-primary h-5 w-5 animate-spin" />
          )}
        </div>

        <Progress value={progressPercent} className="h-2" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="border-border bg-muted/50 rounded-lg border p-3">
            <div className="text-xl font-bold text-green-600">
              {successCount}
            </div>
            <div className="text-muted-foreground text-xs">Imported</div>
          </div>
          <div className="border-border bg-muted/50 rounded-lg border p-3">
            <div className="text-xl font-bold text-red-600">{errorCount}</div>
            <div className="text-muted-foreground text-xs">Failed</div>
          </div>
          <div className="border-border bg-muted/50 rounded-lg border p-3">
            <div className="text-xl font-bold">
              {successCount + errorCount}/{transactions.length}
            </div>
            <div className="text-muted-foreground text-xs">Processed</div>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {!isImporting && errorCount === 0 && (
        <Alert className="border-green-200 bg-green-50 text-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All transactions have been imported successfully!
          </AlertDescription>
        </Alert>
      )}

      {!isImporting && errorCount > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 text-yellow-900">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Import completed with {errorCount} error(s). Review the log below
            for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Logs */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Import Log</h4>
        <ScrollArea className="border-border bg-muted/30 h-48 rounded-lg border p-4 font-mono text-xs">
          <div className="space-y-1">
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`${
                  log.includes("✓")
                    ? "text-green-600"
                    : log.includes("✗")
                      ? "text-red-600"
                      : "text-muted-foreground"
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Error Details */}
      {importErrors.length > 0 && (
        <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
          <h4 className="text-destructive mb-3 text-sm font-semibold">
            Failed Imports ({importErrors.length})
          </h4>
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {importErrors.slice(0, 5).map((err, idx) => (
              <div
                key={idx}
                className="bg-background/50 border-destructive/25 rounded border p-2 text-sm"
              >
                <div className="text-destructive font-medium">
                  Transaction #{err.index}
                </div>
                <div className="text-muted-foreground text-xs">{err.error}</div>
              </div>
            ))}
            {importErrors.length > 5 && (
              <div className="text-muted-foreground text-center text-xs">
                +{importErrors.length - 5} more errors
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      {!isImporting && (
        <div className="flex justify-end">
          <Button onClick={onComplete}>
            {successCount > 0 ? "Complete" : "Close"}
          </Button>
        </div>
      )}
    </div>
  );
}
