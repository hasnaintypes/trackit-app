"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseCSV } from "@/services/fileService";
import { Skeleton } from "@/components/ui/skeleton";

interface FileUploadStepProps {
  onNext: (file: File, csvData: Record<string, unknown>[]) => void;
}

export function FileUploadStep({ onNext }: FileUploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<{
    columns: string[];
    sampleRows: Record<string, unknown>[];
  } | null>(null);
  const [csvDataState, setCsvDataState] = useState<
    Record<string, unknown>[] | null
  >(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      if (!file.name.endsWith(".csv")) {
        throw new Error("Only CSV files are supported");
      }

      // Parse CSV
      const csvData = await parseCSV(file);

      if (!Array.isArray(csvData) || csvData.length === 0) {
        throw new Error("CSV file is empty");
      }

      // Validate row count against configured maximum
      const maxRows = process.env.NEXT_PUBLIC_GEMINI_MAX_ROWS
        ? Number(process.env.NEXT_PUBLIC_GEMINI_MAX_ROWS)
        : 50;
      if (csvData.length > maxRows) {
        throw new Error(
          `CSV file contains ${csvData.length} rows, but maximum allowed is ${maxRows}. Please reduce the file size or contact support to increase the limit.`,
        );
      }

      const firstRow = csvData[0] as Record<string, unknown> | undefined;
      if (!firstRow || typeof firstRow !== "object") {
        throw new Error("Invalid CSV format");
      }

      setSelectedFile(file);
      setCsvDataState(csvData);
      setPreview({
        columns: Object.keys(firstRow),
        sampleRows: csvData.slice(0, 3),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV file");
      setSelectedFile(null);
      setPreview(null);
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

  const handleContinue = () => {
    if (selectedFile && csvDataState) {
      onNext(selectedFile, csvDataState);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setCsvDataState(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area - Only show when no file is selected */}
      {!selectedFile && !isLoading && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-muted-foreground/25 bg-muted/10 hover:border-muted-foreground/50 hover:bg-muted/20 relative rounded-lg border-2 border-dashed p-12 text-center transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) =>
              e.target.files?.[0] && handleFileSelect(e.target.files[0])
            }
            className="hidden"
          />
          <Upload className="text-muted-foreground mx-auto h-8 w-8" />
          <h3 className="text-foreground mt-4 text-sm font-medium">
            Drop your CSV file here
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

      {/* Uploaded File Info */}
      {selectedFile && !isLoading && (
        <div className="border-border bg-muted/50 flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-muted-foreground text-xs">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
            className="text-muted-foreground hover:text-destructive h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Preview */}
      {preview && !isLoading && (
        <div className="space-y-3">
          <div className="border-border bg-muted/50 rounded-lg border p-4">
            <h4 className="mb-2 text-sm font-medium">Column Preview</h4>
            <div className="flex flex-wrap gap-2">
              {preview.columns.map((col) => (
                <span
                  key={col}
                  className="bg-primary/10 text-primary inline-block rounded-full px-3 py-1 text-sm"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleContinue} disabled={!selectedFile || isLoading}>
          Continue
        </Button>
      </div>
    </div>
  );
}
