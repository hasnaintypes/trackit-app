"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTransactions } from "@/hooks/use-transactions";
import { toast } from "sonner";
import type { ImportTransaction } from "@/types/bulk-import";

interface ImportProgressStepProps {
  transactions: ImportTransaction[];
  selectedAccountId: string | null;
  onComplete: () => void;
}

export function ImportProgressStep({
  transactions,
  selectedAccountId,
  onComplete,
}: ImportProgressStepProps) {
  const { bulkCreate } = useTransactions();
  const [progress, setProgress] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(true);
  const hasStartedRef = React.useRef(false);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const runImport = async () => {
      addLog(`Starting bulk import of ${transactions.length} transactions...`);
      addLog(`Auto-categorizing and saving to account in background...`);
      setProgress(20);

      try {
        const result = await bulkCreate.mutateAsync({
          accountId: selectedAccountId ?? "",
          transactions: transactions.map((tx) => ({
            amount: tx.amount ?? "0",
            type: tx.type ?? "DEBIT",
            description: tx.description,
            notes: tx.notes,
            date: tx.date,
            categoryId: tx.categoryId,
            // categoryName is used as a fallback for categorization
            categoryName: tx.categoryName,
            paymentMethod: tx.paymentMethod ?? "OTHER",
          })),
        });

        if (result.success) {
          setSuccessCount(result.count);
          setProgress(100);
          addLog(`\nSuccessfully imported ${result.count} transactions!`);
          toast.success(`${result.count} transactions imported successfully!`);
        }
      } catch (err) {
        setErrorCount(1);
        const errorMsg =
          err instanceof Error ? err.message : "Bulk import failed";
        addLog(`✗ Bulk import failed: ${errorMsg}`);
        toast.error(errorMsg);
        setProgress(0);
      } finally {
        setIsImporting(false);
      }
    };

    void runImport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, selectedAccountId]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Import Progress</h3>
            <p className="text-muted-foreground text-sm">
              {isImporting
                ? "Processing transactions..."
                : progress === 100
                  ? "Import complete"
                  : "Import failed"}
            </p>
          </div>
          {isImporting && (
            <Loader2 className="text-primary h-5 w-5 animate-spin" />
          )}
        </div>

        <Progress value={progress} className="h-2" />

        <div className="grid grid-cols-2 gap-3">
          <div className="border-border bg-muted/50 rounded-lg border p-3">
            <div className="text-xl font-bold text-green-600">
              {successCount}
            </div>
            <div className="text-muted-foreground text-xs">Imported</div>
          </div>
          <div className="border-border bg-muted/50 rounded-lg border p-3">
            <div className="text-xl font-bold">{transactions.length}</div>
            <div className="text-muted-foreground text-xs">Total</div>
          </div>
        </div>
      </div>

      {!isImporting && errorCount === 0 && (
        <Alert className="border-green-200 bg-green-50 text-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All transactions have been imported successfully!
          </AlertDescription>
        </Alert>
      )}

      {errorCount > 0 && (
        <Alert className="border-red-200 bg-red-50 text-red-900">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            The import failed. Please review the logs and try again.
          </AlertDescription>
        </Alert>
      )}

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
