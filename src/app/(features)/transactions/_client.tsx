"use client";

import React, { Suspense, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTransactions } from "@/hooks/use-transactions";

const TransactionForm = dynamic(
  () => import("@/components/forms/transaction/transaction-form"),
  { ssr: false, loading: () => null },
);
const BulkImportDialog = dynamic(
  () =>
    import(
      "@/components/pages/(protected)/transactions/bulk-import/bulk-import-dialog"
    ).then((m) => ({ default: m.BulkImportDialog })),
  { ssr: false, loading: () => null },
);
import { TransactionsHeader } from "@/components/pages/(protected)/transactions/transactions-header";
import { TransactionsList } from "@/components/pages/(protected)/transactions/transactions-list";
import type { Transaction } from "@/types/transaction";
import { api } from "@/trpc/react";
import { invalidateTransactions } from "@/trpc/invalidation";
import { createLogger } from "@/lib/logging";

const logger = createLogger("transactions-page");

export default function TransactionsPageClient() {
  const { listQuery, remove } = useTransactions();
  const utils = api.useUtils();

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [dialogState, setDialogState] = useState<{
    openTx: boolean;
    openBulkImport: boolean;
    selectedTransaction: Transaction | null;
  }>({
    openTx: false,
    openBulkImport: false,
    selectedTransaction: null,
  });

  const { data: transactionsData, isLoading } = listQuery({
    limit: pagination.pageSize,
    page: pagination.pageIndex + 1,
  });

  const transactions = useMemo(
    () => transactionsData?.transactions ?? [],
    [transactionsData?.transactions],
  );

  const handlePageChange = useCallback(
    (newPageIndex: number, newPageSize?: number) => {
      setPagination((prev) => {
        if (typeof newPageSize === "number" && newPageSize !== prev.pageSize) {
          return { pageIndex: 0, pageSize: newPageSize };
        }
        return { ...prev, pageIndex: newPageIndex };
      });
    },
    [],
  );

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setDialogState((prev) => ({
      ...prev,
      openTx: true,
      selectedTransaction: transaction,
    }));
  }, []);

  const handleAdd = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      openTx: true,
      selectedTransaction: null,
    }));
  }, []);

  const handleImport = useCallback(() => {
    setDialogState((prev) => ({ ...prev, openBulkImport: true }));
  }, []);

  const handleTxOpenChange = useCallback((open: boolean) => {
    setDialogState((prev) => ({
      ...prev,
      openTx: open,
      selectedTransaction: open ? prev.selectedTransaction : null,
    }));
  }, []);

  const handleBulkImportOpenChange = useCallback((open: boolean) => {
    setDialogState((prev) => ({ ...prev, openBulkImport: open }));
  }, []);

  const handleDeleteTransactions = useCallback(
    async (ids: string[]) => {
      try {
        await Promise.all(ids.map((id) => remove.mutateAsync({ id })));
        await invalidateTransactions(utils);
      } catch (err) {
        logger.error("Failed to delete transactions", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },
    [remove, utils],
  );

  return (
    <div className="animate-in fade-in-50 flex flex-col space-y-12 duration-500">
      <TransactionsHeader onAdd={handleAdd} onImport={handleImport} />

      <div>
        <TransactionsList
          transactions={transactions}
          isLoading={isLoading}
          totalCount={transactionsData?.totalCount ?? 0}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransactions}
          onPageChange={handlePageChange}
        />
      </div>

      <Suspense fallback={null}>
        <TransactionForm
          open={dialogState.openTx}
          onOpenChange={handleTxOpenChange}
          initialValues={
            dialogState.selectedTransaction
              ? {
                  ...dialogState.selectedTransaction,
                  paymentMethod:
                    dialogState.selectedTransaction.paymentMethod ?? undefined,
                  categoryId:
                    dialogState.selectedTransaction.categoryId ?? undefined,
                  notes: dialogState.selectedTransaction.notes ?? undefined,
                  description:
                    dialogState.selectedTransaction.description ?? undefined,
                  receipt_url:
                    dialogState.selectedTransaction.receipt_url ?? undefined,
                }
              : null
          }
        />
      </Suspense>

      <Suspense fallback={null}>
        <BulkImportDialog
          open={dialogState.openBulkImport}
          onOpenChange={handleBulkImportOpenChange}
        />
      </Suspense>
    </div>
  );
}
