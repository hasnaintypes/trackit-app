import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUploadStep } from "./steps/file-upload-step";
import { ColumnMappingStep } from "./steps/column-mapping-step";
import { ConfirmImportStep } from "./steps/confirm-import-step";
import { ImportProgressStep } from "./steps/import-progress-step";
import type { BulkImportState } from "@/types/bulk-import";

export interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "upload" | "mapping" | "confirm" | "progress";

export function BulkImportDialog({
  open,
  onOpenChange,
}: BulkImportDialogProps) {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [importState, setImportState] = useState<BulkImportState>({
    file: null,
    csvData: [],
    columnMapping: {},
    parsedTransactions: [],
    selectedAccountId: null,
    importProgress: 0,
    totalToImport: 0,
    successCount: 0,
    errorCount: 0,
    errors: [],
  });

  const handleClose = () => {
    if (currentStep === "progress") {
      // Don't allow closing during import
      return;
    }
    onOpenChange(false);
    // Reset state
    setCurrentStep("upload");
    setImportState({
      file: null,
      csvData: [],
      columnMapping: {},
      parsedTransactions: [],
      selectedAccountId: null,
      importProgress: 0,
      totalToImport: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
    });
  };

  const steps = {
    upload: (
      <FileUploadStep
        onNext={(file, csvData: Record<string, string>[]) => {
          setImportState((prev) => ({
            ...prev,
            file,
            csvData,
          }));
          setCurrentStep("mapping");
        }}
      />
    ),
    mapping: (
      <ColumnMappingStep
        csvData={importState.csvData}
        onBack={() => setCurrentStep("upload")}
        onNext={(columnMapping, parsedTransactions) => {
          setImportState((prev) => ({
            ...prev,
            columnMapping,
            parsedTransactions,
          }));
          setCurrentStep("confirm");
        }}
      />
    ),
    confirm: (
      <ConfirmImportStep
        transactions={importState.parsedTransactions}
        errors={importState.errors}
        onBack={() => setCurrentStep("mapping")}
        onConfirm={(accountId) => {
          setImportState((prev) => ({
            ...prev,
            selectedAccountId: accountId,
            totalToImport: prev.parsedTransactions.length,
          }));
          setCurrentStep("progress");
        }}
      />
    ),
    progress: (
      <ImportProgressStep
        onComplete={() => {
          setCurrentStep("upload");
          onOpenChange(false);
          // Reset state
          setImportState({
            file: null,
            csvData: [],
            columnMapping: {},
            parsedTransactions: [],
            selectedAccountId: null,
            importProgress: 0,
            totalToImport: 0,
            successCount: 0,
            errorCount: 0,
            errors: [],
          });
        }}
        transactions={importState.parsedTransactions}
        selectedAccountId={importState.selectedAccountId}
      />
    ),
  };

  const titles = {
    upload: "Upload CSV File",
    mapping: "Map CSV Columns",
    confirm: "Confirm Import",
    progress: "Importing Transactions",
  };

  const descriptions = {
    upload: "Select a CSV file containing your transaction data",
    mapping: "Match the columns from your file to transaction fields",
    confirm: "Review your settings before importing",
    progress: "Your transactions are being imported",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{titles[currentStep]}</DialogTitle>
          <DialogDescription>{descriptions[currentStep]}</DialogDescription>
        </DialogHeader>
        {steps[currentStep]}
      </DialogContent>
    </Dialog>
  );
}
