"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
// no Card used here; page header layout
import { Button } from "@/components/ui/button";
import { ICONS } from "@/components/common/icon-picker";
import { PlusCircle } from "lucide-react";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import TransactionForm from "@/components/forms/transaction/transaction-form";
import { TransactionsTable } from "@/components/common/transactions-table";
import type { Transaction } from "@/types/transaction";

export default function AccountDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { accounts, isLoading } = useAccounts();
  const { listQuery, remove } = useTransactions();
  const { data: transactionsData, isLoading: isLoadingTransactions } =
    listQuery({ accountId: id });
  const [openTx, setOpenTx] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

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

  const Icon = ICONS.find((i) => i.name === account.icon)?.Icon;

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: account.currency,
  }).format(Number(account.balance));

  return (
    <div className="p-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-lg text-lg font-bold text-white shadow-sm"
            style={{ background: account.color ?? "#666" }}
          >
            {Icon ? <Icon className="h-7 w-7" /> : account.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl leading-tight font-bold">{account.name}</h1>
            <div className="text-muted-foreground text-sm">{account.type}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xl font-bold">{formattedBalance}</div>
            <div className="text-muted-foreground text-xs">
              {account.currency}
            </div>
          </div>

          <Button onClick={() => setOpenTx(true)} className="ml-2">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </header>

      <TransactionForm
        open={openTx}
        onOpenChange={(open) => {
          setOpenTx(open);
          if (!open) setSelectedTransaction(null);
        }}
        accountId={account.id}
        initialValues={
          selectedTransaction
            ? {
                ...selectedTransaction,
                paymentMethod: selectedTransaction.paymentMethod ?? undefined,
              }
            : null
        }
      />

      <main>
        <TransactionsTable
          transactions={transactionsData?.transactions ?? []}
          isLoading={isLoadingTransactions}
          onEdit={(transaction) => {
            setSelectedTransaction(transaction);
            setOpenTx(true);
          }}
          onDelete={async (ids) => {
            await Promise.all(ids.map((id) => remove.mutateAsync({ id })));
          }}
          onView={(transaction) => {
            setSelectedTransaction(transaction);
            setOpenTx(true);
          }}
          accountId={account.id}
        />
      </main>
    </div>
  );
}
