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
import { AlertCircle, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { validateAndParseTransactions } from "@/services/fileService";
import type { TransactionField, ColumnMapping } from "../types";
import type { Transaction } from "@/types/transaction";
// NOTE: We call the server API route for AI categorization instead of importing server-only service.
type TransactionForAI = {
  index: number;
  description: string;
  amount: string;
  type: "DEBIT" | "CREDIT" | "TRANSFER";
  date?: string;
  notes?: string;
};

type CategoryForAI = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  parentCategoryId?: string | null;
};

type CategorizationResult = {
  index: number;
  categoryId: string;
  confidence?: number;
};

type CategorizationResponse = {
  results: CategorizationResult[];
  errors?: Array<{ index: number; error: string }>;
};
import { useCategories } from "@/hooks/use-categories";
import { toast } from "sonner";
import type { Category } from "@/types/account";

// Extended category type with children for tree structure
type CategoryWithChildren = Category & { children?: CategoryWithChildren[] };

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
  csvData: Record<string, unknown>[];
  onBack: () => void;
  onNext: (
    mapping: ColumnMapping,
    parsedTransactions: Partial<Transaction>[],
  ) => void;
}

export function ColumnMappingStep({
  csvData,
  onBack,
  onNext,
}: ColumnMappingStepProps) {
  const columns = useMemo(() => Object.keys(csvData[0] ?? {}), [csvData]);
  const { categories, all: categoriesQuery } = useCategories();

  const [aiCategorizationProgress, setAiCategorizationProgress] = useState<{
    isRunning: boolean;
    progress: number;
    message: string;
  }>({ isRunning: false, progress: 0, message: "" });

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
  const [categorizationSummary, setCategorizationSummary] = useState<{
    map: Record<
      number,
      { categoryId: string; confidence?: number; categoryName?: string }
    >;
    completedAt: string;
  } | null>(null);
  const [categorizedTransactions, setCategorizedTransactions] = useState<
    Partial<Transaction>[] | null
  >(null);

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

  const handleAICategorization = async () => {
    // Check if categories are loaded
    if (categoriesQuery.isLoading) {
      toast.error("Loading categories, please wait...");
      return;
    }

    if (!categories || categories.length === 0) {
      toast.error(
        "No categories found. Please create categories before using AI categorization.",
      );
      return;
    }

    // Validate that required fields are mapped
    if (!allRequiredMapped) {
      toast.error(
        "Please map all required fields before using AI categorization.",
      );
      return;
    }

    setAiCategorizationProgress({
      isRunning: true,
      progress: 10,
      message: "Preparing transactions...",
    });

    try {
      // Parse transactions to get the data in the right format
      const { transactions: parsedTransactions } = validateAndParseTransactions(
        csvData,
        mapping,
      );

      if (parsedTransactions.length === 0) {
        toast.error("No valid transactions to categorize.");
        setAiCategorizationProgress({
          isRunning: false,
          progress: 0,
          message: "",
        });
        return;
      }

      setAiCategorizationProgress({
        isRunning: true,
        progress: 20,
        message: "Preparing AI request...",
      });

      // Format transactions for AI
      const transactionsForAI: TransactionForAI[] = parsedTransactions.map(
        (tx, index) => {
          // Determine date string representation
          let dateString: string | undefined;
          if (tx.date) {
            const dateValue = tx.date as Date | string;
            if (dateValue instanceof Date) {
              dateString = dateValue.toISOString();
            } else if (typeof dateValue === "string") {
              dateString = dateValue;
            }
          }

          // Determine transaction type
          let transactionType: "DEBIT" | "CREDIT" | "TRANSFER" = "DEBIT";
          if (tx.type === "CREDIT" || tx.type === "TRANSFER") {
            transactionType = tx.type;
          }

          return {
            index,
            description: String(tx.description ?? ""),
            amount: String(tx.amount ?? "0"),
            type: transactionType,
            date: dateString,
            notes: tx.notes ? String(tx.notes) : undefined,
          };
        },
      );

      // Flatten categories including subcategories
      const flatCategories: CategoryForAI[] = [];
      const categoriesWithChildren = categories as CategoryWithChildren[];

      categoriesWithChildren.forEach((cat) => {
        // Add parent category
        flatCategories.push({
          id: cat.id,
          name: cat.name,
          type: cat.type,
          parentCategoryId: cat.parentCategoryId ?? undefined,
        });

        // Add subcategories if they exist
        if (cat.children && Array.isArray(cat.children)) {
          cat.children.forEach((subCat) => {
            flatCategories.push({
              id: subCat.id,
              name: subCat.name,
              type: subCat.type,
              parentCategoryId: subCat.parentCategoryId ?? undefined,
            });
          });
        }
      });

      // Batch size — process in chunks of 10 (1-10, 11-20, ...)
      const total = transactionsForAI.length;
      const batchSize = 10;
      let processed = 0;
      const combinedResults: CategorizationResult[] = [];
      const combinedErrors: Array<{ index: number; error: string }> = [];

      setAiCategorizationProgress({
        isRunning: true,
        progress: 25,
        message: `Categorizing ${total} transactions in batches...`,
      });

      for (let i = 0; i < total; i += batchSize) {
        const start = i;
        const end = Math.min(i + batchSize, total);
        const chunk = transactionsForAI.slice(start, end);

        // Update progress before sending
        setAiCategorizationProgress({
          isRunning: true,
          progress: Math.round((processed / total) * 100),
          message: `Sending transactions ${start + 1}-${end} of ${total} to AI...`,
        });

        try {
          // Send chunk to API
          const resp = await fetch("/api/ai/categorize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transactions: chunk,
              categories: flatCategories,
            }),
          });

          if (!resp.ok) {
            const errBody = (await resp.json().catch(() => ({}))) as {
              error?: string;
            };
            // Record error for this chunk and continue
            combinedErrors.push({
              index: start,
              error:
                errBody?.error ??
                `AI categorize failed with status ${resp.status}`,
            });
            processed += chunk.length;
            const percent = Math.round((processed / total) * 100);
            setAiCategorizationProgress({
              isRunning: true,
              progress: percent,
              message: `Completed ${processed} of ${total} (${percent}%) (with errors)`,
            });
            continue;
          }

          const json = (await resp.json().catch(() => ({}))) as
            | { result?: CategorizationResponse }
            | CategorizationResponse;
          const possible = (json as { result?: unknown }).result;
          let aiResponse: CategorizationResponse;
          if (possible && typeof possible === "object") {
            aiResponse = possible as CategorizationResponse;
          } else {
            aiResponse = json as CategorizationResponse;
          }

          if (!aiResponse || !Array.isArray(aiResponse.results)) {
            combinedErrors.push({
              index: start,
              error: "Invalid AI response: missing results array",
            });
            processed += chunk.length;
            const percent = Math.round((processed / total) * 100);
            setAiCategorizationProgress({
              isRunning: true,
              progress: percent,
              message: `Completed ${processed} of ${total} (${percent}%) (with errors)`,
            });
            continue;
          }

          // Debug: log chunk vs returned count
          try {
            console.debug(
              `AI chunk ${start + 1}-${end}: sent ${chunk.length}, got ${aiResponse.results.length} results`,
            );
          } catch {}

          // Merge results and errors — results include global indices from transactionsForAI
          combinedResults.push(...aiResponse.results);
          if (aiResponse.errors && Array.isArray(aiResponse.errors)) {
            combinedErrors.push(...aiResponse.errors);
          }

          processed += chunk.length;
          const percent = Math.round((processed / total) * 100);
          setAiCategorizationProgress({
            isRunning: true,
            progress: percent,
            message: `Completed ${processed} of ${total} (${percent}%)`,
          });

          // small yield to allow UI update
          await new Promise((r) => setTimeout(r, 50));
        } catch (chunkErr) {
          // Catch unexpected errors per chunk and continue
          combinedErrors.push({
            index: start,
            error:
              chunkErr instanceof Error ? chunkErr.message : String(chunkErr),
          });
          processed += chunk.length;
          const percent = Math.round((processed / total) * 100);
          setAiCategorizationProgress({
            isRunning: true,
            progress: percent,
            message: `Completed ${processed} of ${total} (${percent}%) (with errors)`,
          });
          continue;
        }
      }

      setAiCategorizationProgress({
        isRunning: true,
        progress: 90,
        message: "Applying categorizations...",
      });

      // Create updated mapping with category column if not already mapped
      let updatedMapping = { ...mapping };
      const categoryColumnName = "AI_Category_ID";

      // Add category mapping if not present
      if (!Object.values(mapping).includes("category")) {
        updatedMapping = { ...mapping, [categoryColumnName]: "category" };
      }

      // Note: AI categorization results are stored in the response
      // The actual category IDs will be applied during transaction creation
      // We could extend this to modify csvData if needed in the future
      void csvData; // Use csvData to avoid unused variable warning

      // Update the mapping state
      setMapping(updatedMapping);

      setAiCategorizationProgress({
        isRunning: true,
        progress: 100,
        message: "AI categorization complete!",
      });

      toast.success(
        `Successfully categorized ${combinedResults.length} of ${transactionsForAI.length} transactions!`,
        {
          description: combinedErrors.length
            ? `${combinedErrors.length} transactions could not be categorized.`
            : undefined,
        },
      );

      // Build a map of index -> category assignment and include category names
      const categoryIdToName = flatCategories.reduce<Record<string, string>>(
        (acc, c) => {
          acc[c.id] = c.name;
          return acc;
        },
        {},
      );

      const map: Record<
        number,
        { categoryId: string; confidence?: number; categoryName?: string }
      > = {};
      combinedResults.forEach((r) => {
        map[r.index] = {
          categoryId: r.categoryId,
          confidence: r.confidence,
          categoryName: categoryIdToName[r.categoryId] ?? r.categoryId,
        };
      });

      setCategorizationSummary({ map, completedAt: new Date().toISOString() });

      // Apply categoryIds to parsedTransactions and save for import/next step
      try {
        const updatedParsed = parsedTransactions.map((tx, idx) => {
          const assignment = map[idx];
          if (assignment) {
            return {
              ...tx,
              categoryId: assignment.categoryId,
            } as Partial<Transaction>;
          }
          return tx;
        });
        setCategorizedTransactions(updatedParsed);
      } catch {
        // ignore mapping errors
      }

      // Reset progress after a short delay
      setTimeout(() => {
        setAiCategorizationProgress({
          isRunning: false,
          progress: 0,
          message: "",
        });
      }, 2000);

      // Note: We don't modify csvData prop directly, but the categorization is now in the mapping
      // The actual category assignment will happen during validation/import
    } catch (error) {
      console.error("AI Categorization Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to categorize transactions with AI",
      );
      setAiCategorizationProgress({
        isRunning: false,
        progress: 0,
        message: "",
      });
    }
  };

  const handleValidate = () => {
    // Prefer categorized transactions (with categoryId applied) if available
    if (categorizedTransactions) {
      const { errors } = validateAndParseTransactions(csvData, mapping);
      setValidationErrors(errors);
      if (errors.length === 0) {
        onNext(mapping, categorizedTransactions);
      }
      return;
    }

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
      {/* Mapping Configuration */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Column Mapping</h3>
        <p className="text-muted-foreground text-sm">
          Match CSV columns to transaction fields
        </p>

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

      {/* Required Fields Check */}
      {!allRequiredMapped && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please map all required fields: Title, Type, Amount, and Date
          </AlertDescription>
        </Alert>
      )}

      {allRequiredMapped && validationErrors.length === 0 && (
        <Alert className="border-green-200 bg-green-50 text-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All required fields are mapped correctly
          </AlertDescription>
        </Alert>
      )}

      {/* Validation Errors */}
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

      {/* AI Categorization */}
      {allRequiredMapped &&
        !aiCategorizationProgress.isRunning &&
        !categorizationSummary && (
          <div className="border-border from-primary/5 to-primary/10 rounded-lg border bg-gradient-to-br p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="text-primary h-4 w-4" />
                  AI-Powered Auto-Categorization
                </h4>
                <p className="text-muted-foreground text-xs">
                  Let AI automatically categorize your transactions based on
                  descriptions and amounts
                </p>
              </div>
              <Button
                onClick={() => void handleAICategorization()}
                variant="default"
                size="sm"
                className="gap-2"
                disabled={
                  categoriesQuery.isLoading ||
                  !categories ||
                  categories.length === 0
                }
              >
                <Sparkles className="h-4 w-4" />
                Categorize with AI
              </Button>
            </div>
          </div>
        )}

      {/* AI Categorization Progress */}
      {aiCategorizationProgress.isRunning && (
        <div className="border-primary bg-primary/5 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="text-primary h-5 w-5 animate-spin" />
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {aiCategorizationProgress.message}
                </span>
                <span className="text-muted-foreground text-sm">
                  {aiCategorizationProgress.progress}%
                </span>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full transition-all duration-500"
                  style={{ width: `${aiCategorizationProgress.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimal success indicator after categorization completes */}
      {categorizationSummary && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div className="flex-1 text-sm text-green-900">
            Auto-categorization complete — results applied.
          </div>
          <div className="text-muted-foreground text-xs">Completed</div>
        </div>
      )}

      {/* Actions */}
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
