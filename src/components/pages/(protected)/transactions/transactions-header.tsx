"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Upload } from "lucide-react";

interface TransactionsHeaderProps {
  onAdd: () => void;
  onImport: () => void;
}

export function TransactionsHeader({
  onAdd,
  onImport,
}: TransactionsHeaderProps) {
  return (
    <div className="border-border/50 from-background to-background/95 border-b bg-gradient-to-b backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold tracking-tight">
              Transactions
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Manage and track all your financial transactions in one place
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={onImport} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Bulk Import
            </Button>
            <Button onClick={onAdd} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
