"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import TransactionForm from "@/components/forms/transaction/transaction-form";
import { TransactionsTable } from "@/components/common/transactions-table";
import { BulkImportDialog } from "@/components/dialogs/bulk-import/bulk-import-dialog";
import type { Transaction } from "@/types/transaction";

export default function TransactionsPage() {
  const { listQuery, remove } = useTransactions();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const { data: transactionsData, isLoading } = listQuery({
    limit: pageSize,
    page: pageIndex + 1,
  });
  const [openTx, setOpenTx] = useState(false);
  const [openBulkImport, setOpenBulkImport] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setOpenTx(true);
  };

  const handleDeleteTransactions = async (ids: string[]) => {
    await Promise.all(ids.map((id) => remove.mutateAsync({ id })));
  };

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      {/* Header Section */}
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
              <Button
                onClick={() => setOpenBulkImport(true)}
                variant="outline"
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Bulk Import
              </Button>
              <Button
                onClick={() => {
                  setSelectedTransaction(null);
                  setOpenTx(true);
                }}
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-border/50 bg-card/50 rounded-lg border shadow-sm backdrop-blur-sm">
          <div className="border-border/50 border-b px-6 py-4">
            <h2 className="text-foreground text-lg font-semibold">
              All Transactions
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {transactionsData?.totalCount ??
                transactionsData?.transactions.length ??
                0}{" "}
              total transactions
            </p>
          </div>

          <div className="p-6">
            <TransactionsTable
              transactions={transactionsData?.transactions ?? []}
              isLoading={isLoading}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransactions}
              onView={handleEditTransaction}
              pageIndex={pageIndex}
              pageSize={pageSize}
              totalCount={transactionsData?.totalCount ?? 0}
              onPageChange={(newPageIndex, newPageSize) => {
                setPageIndex(newPageIndex);
                if (
                  typeof newPageSize === "number" &&
                  newPageSize !== pageSize
                ) {
                  setPageSize(newPageSize);
                  setPageIndex(0);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <TransactionForm
        open={openTx}
        onOpenChange={(open) => {
          setOpenTx(open);
          if (!open) setSelectedTransaction(null);
        }}
        initialValues={
          selectedTransaction
            ? {
                ...selectedTransaction,
                paymentMethod: selectedTransaction.paymentMethod ?? undefined,
              }
            : null
        }
      />

      <BulkImportDialog
        open={openBulkImport}
        onOpenChange={setOpenBulkImport}
      />
    </div>
  );
}
