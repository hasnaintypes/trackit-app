"use client";

import React, { useRef, useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@ui/alert";
import { parseCSV } from "@shared/file-parser";
import { parseOFX } from "@shared/ofx-parser";
import { env } from "@/env";
import { Skeleton } from "@ui/skeleton";
import type { ImportTransaction } from "@/types/bulk-import";

type FileUploadResult =
  | { type: "csv"; csvData: Record<string, string>[] }
  | { type: "ofx"; transactions: ImportTransaction[] };

interface FileUploadStepProps {
  onNext: (file: File, result: FileUploadResult) => void;
}

const ACCEPTED_EXTENSIONS = [".csv", ".ofx", ".qfx"];

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

export function FileUploadStep({ onNext }: FileUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      const ext = getFileExtension(file.name);
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        throw new Error("Only CSV, OFX, and QFX files are supported");
      }

      if (ext === ".csv") {
        // Existing CSV flow
        const csvData = await parseCSV(file);

        if (!Array.isArray(csvData) || csvData.length === 0) {
          throw new Error("CSV file is empty");
        }

        const maxRows = env.NEXT_PUBLIC_GEMINI_MAX_ROWS
          ? Number(env.NEXT_PUBLIC_GEMINI_MAX_ROWS)
          : 50;
        if (csvData.length > maxRows) {
          throw new Error(
            `CSV file contains ${csvData.length} rows, but maximum allowed is ${maxRows}. Please reduce the file size or contact support to increase the limit.`,
          );
        }

        const firstRow = csvData[0];
        if (!firstRow || typeof firstRow !== "object") {
          throw new Error("Invalid CSV format");
        }

        onNext(file, { type: "csv", csvData });
      } else {
        // OFX/QFX flow
        const transactions = await parseOFX(file);

        if (transactions.length === 0) {
          throw new Error(
            "No transactions found in the bank file. Please verify the file is a valid OFX/QFX export.",
          );
        }

        onNext(file, { type: "ofx", transactions });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      void handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area - Only show when not loading */}
      {!isLoading && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-muted-foreground/25 bg-muted/10 hover:border-muted-foreground/50 hover:bg-muted/20 relative rounded-lg border-2 border-dashed p-12 text-center transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.ofx,.qfx"
            onChange={(e) =>
              e.target.files?.[0] && handleFileSelect(e.target.files[0])
            }
            className="hidden"
          />
          <Upload className="text-muted-foreground mx-auto h-8 w-8" />
          <h3 className="text-foreground mt-4 text-sm font-medium">
            Drop your CSV, OFX, or QFX file here
          </h3>
          <p className="text-muted-foreground mt-2 text-sm">
            or{" "}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-primary font-semibold hover:underline"
            >
              browse
            </button>
            {" to upload"}
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            Maximum file size: 5MB
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-2 p-12 text-center">
          <Skeleton className="mx-auto h-8 w-8 rounded-full" />
          <Skeleton className="mx-auto h-4 w-32" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
