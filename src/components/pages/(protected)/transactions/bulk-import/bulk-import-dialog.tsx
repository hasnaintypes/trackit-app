import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
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

const initialState: BulkImportState = {
  file: null,
  sourceType: "csv",
  csvData: [],
  columnMapping: {},
  parsedTransactions: [],
  selectedAccountId: null,
  importProgress: 0,
  totalToImport: 0,
  successCount: 0,
  errorCount: 0,
  errors: [],
};

export function BulkImportDialog({
  open,
  onOpenChange,
}: BulkImportDialogProps) {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [importState, setImportState] = useState<BulkImportState>({
    ...initialState,
  });

  const handleClose = () => {
    if (currentStep === "progress") {
      return;
    }
    onOpenChange(false);
    setCurrentStep("upload");
    setImportState({ ...initialState });
  };

  const steps = {
    upload: (
      <FileUploadStep
        onNext={(file, result) => {
          if (result.type === "csv") {
            setImportState((prev) => ({
              ...prev,
              file,
              sourceType: "csv",
              csvData: result.csvData,
            }));
            setCurrentStep("mapping");
          } else {
            setImportState((prev) => ({
              ...prev,
              file,
              sourceType: "ofx",
              parsedTransactions: result.transactions,
            }));
            setCurrentStep("confirm");
          }
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
        onBack={() =>
          setCurrentStep(
            importState.sourceType === "ofx" ? "upload" : "mapping",
          )
        }
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
          setImportState({ ...initialState });
        }}
        transactions={importState.parsedTransactions}
        selectedAccountId={importState.selectedAccountId}
      />
    ),
  };

  const titles: Record<Step, string> = {
    upload: "Import Transactions",
    mapping: "Map CSV Columns",
    confirm: "Confirm Import",
    progress: "Importing Transactions",
  };

  const descriptions: Record<Step, string> = {
    upload: "Upload a CSV, OFX, or QFX file containing your transaction data",
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
