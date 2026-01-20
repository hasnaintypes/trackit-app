"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts } from "@/hooks/use-accounts";
import type { Transaction } from "@/types/transaction";
import type { ImportError } from "../types";

interface ConfirmImportStepProps {
  transactions: Partial<Transaction>[];
  errors: ImportError[];
  onBack: () => void;
  onConfirm: (accountId: string) => void;
}

export function ConfirmImportStep({
  transactions,
  errors,
  onBack,
  onConfirm,
}: ConfirmImportStepProps) {
  const { accounts, isLoading: isLoadingAccounts } = useAccounts();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const errorsByRow = useMemo(() => {
    const byRow: Record<number, ImportError[]> = {};
    errors.forEach((err) => {
      byRow[err.rowIndex] ??= [];
      const row = byRow[err.rowIndex];
      if (row) {
        row.push(err);
      }
    });
    return byRow;
  }, [errors]);

  const successRate = (
    (transactions.length /
      (transactions.length + Object.keys(errorsByRow).length)) *
    100
  ).toFixed(1);

  const handleConfirm = () => {
    if (selectedAccountId) {
      onConfirm(selectedAccountId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Selection */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Select Account</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Choose which account these transactions will be imported into
          </p>
        </div>
        <Select
          value={selectedAccountId}
          onValueChange={setSelectedAccountId}
          disabled={isLoadingAccounts}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                isLoadingAccounts
                  ? "Loading accounts..."
                  : "Select an account..."
              }
            />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} ({account.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!selectedAccountId && transactions.length > 0 && (
          <Alert>
            <AlertDescription>
              Please select an account to continue with the import
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Separator />

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border-border bg-muted/50 rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {transactions.length}
          </div>
          <div className="text-muted-foreground text-sm">
            Valid Transactions
          </div>
        </div>
        <div className="border-border bg-muted/50 rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-600">
            {Object.keys(errorsByRow).length}
          </div>
          <div className="text-muted-foreground text-sm">Issues Found</div>
        </div>
        <div className="border-border bg-muted/50 rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
          <div className="text-muted-foreground text-sm">Success Rate</div>
        </div>
      </div>

      {/* Alert */}
      {errors.length === 0 ? (
        <Alert className="border-green-200 bg-green-50 text-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All rows are valid and ready to import!
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-yellow-200 bg-yellow-50 text-yellow-900">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {Object.keys(errorsByRow).length} rows contain errors and will be
            skipped during import. Review the issues below to ensure this is
            correct.
          </AlertDescription>
        </Alert>
      )}

      {/* Issues */}
      {errors.length > 0 && (
        <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
          <h4 className="text-destructive mb-3 font-semibold">
            Rows with Issues ({Object.keys(errorsByRow).length})
          </h4>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {Object.entries(errorsByRow)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .map(([rowIndex, rowErrors]) => (
                <div
                  key={rowIndex}
                  className="bg-background/50 border-destructive/25 rounded border p-3 text-sm"
                >
                  <div className="text-destructive font-medium">
                    Row {Number(rowIndex) + 2}
                  </div>
                  <ul className="text-muted-foreground mt-1 space-y-1 text-xs">
                    {rowErrors.map((err, idx) => (
                      <li key={idx}>
                        • <strong>{err.field}</strong>: {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={transactions.length === 0 || !selectedAccountId}
        >
          {transactions.length === 0
            ? "No valid data to import"
            : `Import ${transactions.length} Transaction${transactions.length !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
}
