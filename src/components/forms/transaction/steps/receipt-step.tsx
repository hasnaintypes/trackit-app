/* eslint-disable @typescript-eslint/no-base-to-string */
"use client";

import React, { useState, useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { createLogger } from "@/lib/logging";
import type {
  CreateTransactionInput,
  RecurrenceInput,
} from "@/validation/transaction";

const logger = createLogger("receipt-step");

type CategoryRaw = {
  id?: unknown;
  name?: unknown;
  icon?: unknown;
  type?: unknown;
  parentCategoryId?: unknown;
  children?: unknown[];
};

export interface ReceiptStepProps {
  form: UseFormReturn<CreateTransactionInput>;
  categories: unknown[] | undefined;
}

export function useReceiptUpload(
  form: UseFormReturn<CreateTransactionInput>,
  categories: unknown[] | undefined,
) {
  const uploadReceiptMutation = api.transaction.uploadReceipt.useMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      setSelectedFile(f);
      setSelectedFileName(f ? f.name : null);
    },
    [],
  );

  const handleScan = useCallback(async () => {
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result;
      if (typeof result !== "string") return;
      try {
        const res = await uploadReceiptMutation.mutateAsync({
          fileDataUrl: result,
          fileName: selectedFile.name,
        });
        if (res?.url) {
          form.setValue("receipt_url", res.url);
          toast.success("Receipt uploaded");

          // Call AI receipt scanner to autofill fields
          try {
            const aiResp = await fetch("/api/ai/scan-receipt", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileDataUrl: result,
                imageUrl: res.url,
                categories: (categories ?? []).map((c) => {
                  const cat = c as CategoryRaw;
                  return {
                    id: String(cat.id ?? ""),
                    name: String(cat.name ?? ""),
                    type: String(cat.type ?? "EXPENSE"),
                    parentCategoryId:
                      typeof cat.parentCategoryId === "string"
                        ? cat.parentCategoryId
                        : null,
                    subcategories: Array.isArray(cat.children)
                      ? cat.children.map((s) => {
                          const sub = s as Record<string, unknown>;
                          return {
                            id: String(sub.id ?? ""),
                            name: String(sub.name ?? ""),
                            type: String(sub.type ?? "EXPENSE"),
                          };
                        })
                      : [],
                  };
                }),
              }),
            });
            const jsonPayload = (await aiResp.json()) as unknown;
            let scan: Record<string, unknown> | undefined = undefined;
            if (
              jsonPayload &&
              typeof jsonPayload === "object" &&
              jsonPayload !== null &&
              Object.prototype.hasOwnProperty.call(jsonPayload, "result")
            ) {
              const obj = jsonPayload as Record<string, unknown>;
              const maybeResult = obj.result;
              if (maybeResult && typeof maybeResult === "object") {
                scan = maybeResult as Record<string, unknown>;
              }
            }
            if (scan) {
              if (
                typeof scan.description === "string" &&
                scan.description.trim()
              ) {
                form.setValue("description", scan.description.trim());
              }
              if (typeof scan.amount === "string" && scan.amount.trim()) {
                form.setValue("amount", scan.amount.trim());
              }
              if (typeof scan.date === "string" && scan.date.trim()) {
                try {
                  const d = new Date(scan.date);
                  if (!Number.isNaN(d.getTime())) {
                    form.setValue("date", d.toISOString());
                  }
                } catch (e) {
                  logger.info("Invalid date from receipt scan", {
                    error: e instanceof Error ? e.message : String(e),
                  });
                }
              }
              if (
                typeof scan.paymentMethod === "string" &&
                scan.paymentMethod.trim()
              ) {
                const pmCandidate = scan.paymentMethod.trim().toUpperCase();
                const ALLOWED_PM = [
                  "CARD",
                  "CASH",
                  "BANK_TRANSFER",
                  "AUTO_DEBIT",
                  "UPI",
                  "OTHER",
                ] as const;
                if ((ALLOWED_PM as readonly string[]).includes(pmCandidate)) {
                  form.setValue(
                    "paymentMethod",
                    pmCandidate as CreateTransactionInput["paymentMethod"],
                  );
                }
              }
              if (scan.isRecurring === true || scan.isRecurring === "true") {
                form.setValue("isRecurring", true);
                const rec = scan.recurrence as
                  | Record<string, unknown>
                  | undefined;
                if (rec) {
                  const recurrencePayload: Partial<RecurrenceInput> = {};
                  if (typeof rec.frequency === "string")
                    recurrencePayload.frequency =
                      rec.frequency as RecurrenceInput["frequency"];
                  if (typeof rec.interval === "number")
                    recurrencePayload.interval = rec.interval;
                  if (typeof rec.dayOfMonth === "number")
                    recurrencePayload.dayOfMonth = rec.dayOfMonth;
                  if (typeof rec.dayOfWeek === "number")
                    recurrencePayload.dayOfWeek = rec.dayOfWeek;
                  if (typeof rec.startDate === "string")
                    recurrencePayload.startDate = rec.startDate;
                  if (typeof rec.endDate === "string")
                    recurrencePayload.endDate = rec.endDate;
                  if (typeof rec.timezone === "string")
                    recurrencePayload.timezone = rec.timezone;
                  form.setValue(
                    "recurrence",
                    recurrencePayload as RecurrenceInput,
                  );
                }
              }
              toast.success(
                "Receipt scanned — form autofilled (verify values)",
              );
            }
          } catch (err) {
            logger.error("AI receipt scan failed", {
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }
      } catch (err) {
        logger.error("Failed to upload receipt", {
          error: err instanceof Error ? err.message : String(err),
        });
        toast.error("Failed to upload receipt");
      }
    };
    reader.readAsDataURL(selectedFile);
  }, [selectedFile, form, categories, uploadReceiptMutation]);

  return {
    selectedFile,
    selectedFileName,
    handleFileChange,
    handleScan,
    isPending: uploadReceiptMutation.status === "pending",
  };
}

const ReceiptStep = React.memo(function ReceiptStep({
  form,
  categories,
}: ReceiptStepProps) {
  const {
    selectedFile,
    selectedFileName,
    handleFileChange,
    handleScan,
    isPending,
  } = useReceiptUpload(form, categories);

  return (
    <div className="group border-border from-primary/5 via-primary/3 hover:border-primary/30 relative overflow-hidden rounded-xl border bg-gradient-to-br to-transparent p-4 transition-all">
      <div className="relative flex items-start gap-4">
        <div className="bg-primary/10 ring-primary/20 group-hover:bg-primary/15 group-hover:ring-primary/30 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 transition-all">
          <Zap className="text-primary h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">AI Receipt Scanner</h4>
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
              Beta
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            {selectedFileName ? (
              <span className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-green-500" />
                <span className="font-medium">{selectedFileName}</span>
              </span>
            ) : (
              "Upload a receipt to auto-fill transaction details"
            )}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          id="receipt-file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <label htmlFor="receipt-file-input" className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-full cursor-pointer bg-transparent font-medium"
            asChild
          >
            <span>{selectedFile ? "Change File" : "Choose Receipt"}</span>
          </Button>
        </label>
        {selectedFile && (
          <Button
            variant="default"
            size="sm"
            className="h-9 min-w-[80px] font-medium"
            disabled={isPending}
            onClick={handleScan}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Scanning
              </>
            ) : (
              "Scan Now"
            )}
          </Button>
        )}
      </div>
    </div>
  );
});

ReceiptStep.displayName = "ReceiptStep";

export { ReceiptStep };
export default ReceiptStep;
