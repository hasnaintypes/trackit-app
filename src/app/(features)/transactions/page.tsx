"use client";

import React, { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import TransactionForm from "@/components/forms/transaction/transaction-form";
import { BulkImportDialog } from "@/components/pages/(protected)/transactions/bulk-import/bulk-import-dialog";
import { TransactionsHeader } from "@/components/pages/(protected)/transactions/transactions-header";
import { TransactionsAnalytics } from "@/components/pages/(protected)/transactions/transactions-analytics";
import { TransactionsList } from "@/components/pages/(protected)/transactions/transactions-list";
import { format } from "date-fns";
import type { ChartConfig } from "@/components/ui/chart";
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

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setOpenTx(true);
  };

  const handleDeleteTransactions = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => remove.mutateAsync({ id })));
      // Ensure everything is fresh after bulk operation
      await Promise.all([
        utils.transaction.list.invalidate(),
        utils.account.list.invalidate(),
      ]);
    } catch (err) {
      logger.error("Failed to delete transactions", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  // Prepare Analytics Data (Daily trend)
  const chartData = useMemo(() => {
    const dailyBuckets: Record<
      string,
      { date: string; income: number; expense: number }
    > = {};

    transactions.forEach((tx) => {
      const amount = Math.abs(parseFloat(tx.amount));
      const dateLabel = format(new Date(tx.date), "MMM dd");

      dailyBuckets[dateLabel] ??= { date: dateLabel, income: 0, expense: 0 };

      if (tx.type === "CREDIT") {
        dailyBuckets[dateLabel].income += amount;
      } else if (tx.type === "DEBIT") {
        dailyBuckets[dateLabel].expense += amount;
      }
    });

    return Object.values(dailyBuckets).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [transactions]);

  const chartConfig = {
    income: {
      label: "Income",
      color: "var(--chart-1)",
    },
    expense: {
      label: "Expense",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br pb-10">
      {/* 1. Header Section with visual separation from body */}
      <div className="bg-background/50 sticky top-0 z-10 border-b backdrop-blur-xl">
        <TransactionsHeader
          onAdd={() => {
            setSelectedTransaction(null);
            setOpenTx(true);
          }}
          onImport={() => setOpenBulkImport(true)}
        />
      </div>

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        {/* 2. Analytics Section */}
        <section className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
            <p className="text-muted-foreground text-sm">
              A quick look at your income vs expenses trends for this period.
            </p>
          </div>

          <TransactionsAnalytics
            chartData={chartData}
            chartConfig={chartConfig}
          />
        </section>

        {/* 3. List Section */}
        <section className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold tracking-tight">
              Transaction History
            </h2>
            <p className="text-muted-foreground text-sm">
              Manage and view all your recent transactions.
            </p>
          </div>

          <TransactionsList
            transactions={transactions}
            isLoading={isLoading}
            totalCount={transactionsData?.totalCount ?? 0}
            pageIndex={pageIndex}
            pageSize={pageSize}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransactions}
            onPageChange={(newPageIndex, newPageSize) => {
              setPageIndex(newPageIndex);
              if (typeof newPageSize === "number" && newPageSize !== pageSize) {
                setPageSize(newPageSize);
                setPageIndex(0);
              }
            }}
          />
        </section>
      </main>

      {/* Dialogs - Kept separate from flow */}
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
