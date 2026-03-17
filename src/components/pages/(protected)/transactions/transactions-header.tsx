"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload } from "lucide-react";

interface TransactionsHeaderProps {
  onAdd: () => void;
  onImport: () => void;
}

export const TransactionsHeader = React.memo(function TransactionsHeader({
  onAdd,
  onImport,
}: TransactionsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-primary-foreground text-2xl font-bold tracking-tight">
          Transactions
        </h1>
        <p className="text-secondary mt-1 text-sm">
          Manage and track all your financial transactions
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onImport}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Bulk Import
        </Button>
        <Button onClick={onAdd} size="sm" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>
    </div>
  );
});
