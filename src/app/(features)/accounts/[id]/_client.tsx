"use client";

import React, { Suspense, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ICON_MAP } from "@/components/common/icon-picker";
import { PlusCircle, Wallet } from "lucide-react";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { useFormatter } from "@/hooks/use-formatter";
import { TransactionsTable } from "@/components/common/transactions-table";

const TransactionForm = dynamic(
  () => import("@/components/forms/transaction/transaction-form"),
  { ssr: false, loading: () => null },
);
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";

export default function AccountDetailPageClient() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { accounts, isLoading } = useAccounts();
  const { formatAmount } = useFormatter();
  const { listQuery, remove } = useTransactions();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const { data: transactionsData, isLoading: isLoadingTransactions } =
    listQuery({
      accountId: id,
      limit: pagination.pageSize,
      page: pagination.pageIndex + 1,
    });
  const [txDialog, setTxDialog] = useState<{
    open: boolean;
    selected: Transaction | null;
  }>({ open: false, selected: null });

  const handleOpenTxDialog = useCallback(() => {
    setTxDialog((prev) => ({ ...prev, open: true }));
  }, []);

  const handleTxDialogOpenChange = useCallback((open: boolean) => {
    setTxDialog((prev) => ({
      open,
      selected: open ? prev.selected : null,
    }));
  }, []);

  const handleEditTx = useCallback((transaction: Transaction) => {
    setTxDialog({ open: true, selected: transaction });
  }, []);

  const handleDeleteTx = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => remove.mutateAsync({ id })));
    },
    [remove],
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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
      </div>
    );
  }

  const account = accounts.find((a) => a.id === id);

  if (!account) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Account not found.</p>
      </div>
    );
  }

  const Icon = ICON_MAP.get(account.icon ?? "") ?? Wallet;

  const formattedBalance = formatAmount(Number(account.balance));

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-sm"
              style={{ backgroundColor: account.color ?? "#6366f1" }}
            >
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl leading-tight font-bold">
                  {account.name}
                </h1>
                <Badge
                  variant="secondary"
                  className="text-muted-foreground h-5 px-1.5 text-[10px] font-medium uppercase"
                >
                  {account.type}
                </Badge>
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] font-medium"
                >
                  {account.currency}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Account details and transactions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-muted-foreground text-xs font-medium">
                Balance
              </p>
              <p
                className={cn(
                  "text-3xl font-bold tracking-tight",
                  Number(account.balance) < 0
                    ? "text-destructive"
                    : "text-foreground",
                )}
              >
                {formattedBalance}
              </p>
            </div>

            <Button onClick={handleOpenTxDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </div>
        </CardContent>
      </Card>

      <Suspense fallback={null}>
        <TransactionForm
          open={txDialog.open}
          onOpenChange={handleTxDialogOpenChange}
          accountId={account.id}
          initialValues={
            txDialog.selected
              ? {
                  ...txDialog.selected,
                  paymentMethod: txDialog.selected.paymentMethod ?? undefined,
                }
              : null
          }
        />
      </Suspense>

      <TransactionsTable
        transactions={transactionsData?.transactions ?? []}
        isLoading={isLoadingTransactions}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        totalCount={transactionsData?.totalCount ?? 0}
        onPageChange={handlePageChange}
        onEdit={handleEditTx}
        onDelete={handleDeleteTx}
        onView={handleEditTx}
        accountId={account.id}
      />
    </div>
  );
}
