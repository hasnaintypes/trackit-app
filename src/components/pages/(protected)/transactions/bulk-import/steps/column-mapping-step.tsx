"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { validateAndParseTransactions } from "@/server/services/fileService";
import type {
  TransactionField,
  ColumnMapping,
  ImportTransaction,
} from "@/types/bulk-import";

const TRANSACTION_FIELDS: {
  value: TransactionField;
  label: string;
  required: boolean;
}[] = [
  { value: "skip", label: "Skip", required: false },
  { value: "description", label: "Title/Description *", required: true },
  { value: "type", label: "Type *", required: true },
  { value: "amount", label: "Amount *", required: true },
  { value: "date", label: "Transaction Date *", required: true },
  { value: "category", label: "Category Name", required: false },
  { value: "notes", label: "Notes", required: false },
  { value: "paymentMethod", label: "Payment Method", required: false },
];

interface ColumnMappingStepProps {
  csvData: Record<string, string>[];
  onBack: () => void;
  onNext: (
    mapping: ColumnMapping,
    parsedTransactions: ImportTransaction[],
  ) => void;
}

export function ColumnMappingStep({
  csvData,
  onBack,
  onNext,
}: ColumnMappingStepProps) {
  const columns = useMemo(() => Object.keys(csvData[0] ?? {}), [csvData]);

  const [mapping, setMapping] = useState<ColumnMapping>(() => {
    const initialMapping: ColumnMapping = {};
    // Try to auto-map columns
    columns.forEach((col) => {
      const lowerCol = col.toLowerCase();
      if (lowerCol.includes("title") || lowerCol.includes("description")) {
        initialMapping[col] = "description";
      } else if (lowerCol.includes("type")) {
        initialMapping[col] = "type";
      } else if (lowerCol.includes("amount")) {
        initialMapping[col] = "amount";
      } else if (lowerCol.includes("date")) {
        initialMapping[col] = "date";
      } else if (lowerCol.includes("category")) {
        initialMapping[col] = "category";
      } else if (lowerCol.includes("note")) {
        initialMapping[col] = "notes";
      } else if (lowerCol.includes("payment") || lowerCol.includes("method")) {
        initialMapping[col] = "paymentMethod";
      }
    });
    return initialMapping;
  });

  const [validationErrors, setValidationErrors] = useState<
    Array<{ rowIndex: number; field: string; message: string }>
  >([]);

  const requiredFields = new Set(
    TRANSACTION_FIELDS.filter((f) => f.required).map((f) => f.value),
  );

  const mappedFields = new Set(
    Object.values(mapping).filter(
      (v): v is Exclude<TransactionField, "skip"> =>
        v !== "skip" && v !== undefined,
    ),
  );

  const allRequiredMapped = Array.from(requiredFields).every((field) =>
    mappedFields.has(field as Exclude<TransactionField, "skip">),
  );

  const handleMappingChange = (column: string, field: TransactionField) => {
    setMapping((prev) => ({
      ...prev,
      [column]: field,
    }));
  };

  const handleValidate = () => {
    const { transactions, errors } = validateAndParseTransactions(
      csvData,
      mapping,
    );
    setValidationErrors(errors);

    if (errors.length === 0) {
      onNext(mapping, transactions);
    }
  };

  const errorsByRow = useMemo(() => {
    const byRow: Record<number, typeof validationErrors> = {};
    validationErrors.forEach((err) => {
      byRow[err.rowIndex] ??= [];
      const row = byRow[err.rowIndex];
      if (row) {
        row.push(err);
      }
    });
    return byRow;
  }, [validationErrors]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="border-border bg-muted/50 space-y-2 rounded-lg border p-4">
          {columns.map((column) => (
            <div key={column} className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary w-32 truncate rounded px-3 py-2 text-sm font-medium">
                {column}
              </span>
              <span className="text-muted-foreground">→</span>
              <Select
                value={mapping[column] ?? "skip"}
                onValueChange={(value) =>
                  handleMappingChange(column, value as TransactionField)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {!allRequiredMapped && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please map all required fields: Title, Type, Amount, and Date
          </AlertDescription>
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
          <h4 className="text-destructive mb-3 font-semibold">
            Validation Issues Found ({validationErrors.length})
          </h4>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {Object.entries(errorsByRow)
              .slice(0, 5)
              .map(([rowIndex, errors]) => (
                <div
                  key={rowIndex}
                  className="bg-background/50 border-destructive/25 rounded border p-3 text-sm"
                >
                  <div className="text-destructive font-medium">
                    Row {Number(rowIndex) + 2}
                  </div>
                  <ul className="text-muted-foreground mt-1 space-y-1 text-xs">
                    {errors.map((err, idx) => (
                      <li key={idx}>
                        • {err.field}: {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            {Object.keys(errorsByRow).length > 5 && (
              <div className="text-muted-foreground text-center text-sm">
                +{Object.keys(errorsByRow).length - 5} more rows with errors
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleValidate} disabled={!allRequiredMapped}>
          Continue
        </Button>
      </div>
    </div>
  );
}
