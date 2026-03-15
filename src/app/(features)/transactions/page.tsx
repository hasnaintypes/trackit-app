"use client";

import React, { useState, useMemo, useCallback } from "react";
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
import { createLogger } from "@/lib/logging";

const logger = createLogger("transactions-page");

export default function TransactionsPage() {
  const { listQuery, remove } = useTransactions();
  const utils = api.useUtils();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const { data: transactionsData, isLoading } = listQuery({
    limit: pageSize,
    page: pageIndex + 1,
  });

  const transactions = useMemo(
    () => transactionsData?.transactions ?? [],
    [transactionsData?.transactions],
  );

  const [openTx, setOpenTx] = useState(false);
  const [openBulkImport, setOpenBulkImport] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const handlePageChange = useCallback(
    (newPageIndex: number, newPageSize?: number) => {
      setPageIndex(newPageIndex);
      if (typeof newPageSize === "number" && newPageSize !== pageSize) {
        setPageSize(newPageSize);
        setPageIndex(0);
      }
    },
    [pageSize],
  );

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setOpenTx(true);
  }, []);

  const handleDeleteTransactions = useCallback(
    async (ids: string[]) => {
      try {
        await Promise.all(ids.map((id) => remove.mutateAsync({ id })));
        await Promise.all([
          utils.transaction.list.invalidate(),
          utils.account.list.invalidate(),
          utils.budget.all.invalidate(),
        ]);
      } catch (err) {
        logger.error("Failed to delete transactions", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    },
    [remove, utils.transaction.list, utils.account.list, utils.budget.all],
  );

  return (
    <div className="space-y-8 pt-8">
      <TransactionsHeader
        onAdd={() => {
          setSelectedTransaction(null);
          setOpenTx(true);
        }}
        onImport={() => setOpenBulkImport(true)}
      />

      <TransactionsList
        transactions={transactions}
        isLoading={isLoading}
        totalCount={transactionsData?.totalCount ?? 0}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransactions}
        onPageChange={handlePageChange}
      />

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
                categoryId: selectedTransaction.categoryId ?? undefined,
                notes: selectedTransaction.notes ?? undefined,
                description: selectedTransaction.description ?? undefined,
                receipt_url: selectedTransaction.receipt_url ?? undefined,
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
