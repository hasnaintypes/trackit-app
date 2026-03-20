"use client";

import React, { Suspense, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Wallet, PlusCircle } from "lucide-react";

import { Button } from "@ui/button";
import { Skeleton } from "@ui/skeleton";

const AccountForm = dynamic(
  () => import("@/components/forms/accounts/account-form"),
  { ssr: false, loading: () => null },
);
import { DeleteDialog } from "@common/delete-dialog";
import { useAccounts } from "@/hooks/use-accounts";
import { useFormatter } from "@/hooks/use-formatter";
import type { BankAccount as Account } from "@/types/account";
import {
  AccountCard,
  type ApiAccount,
} from "@/components/pages/(protected)/accounts/account-card";

const mapToInitialValues = (a: Account | ApiAccount) => ({
  id: a.id,
  name: a.name,
  type: a.type,
  currency: a.currency,
  balance: String(a.balance ?? "0"),
  color: a.color ?? undefined,
  icon: a.icon ?? undefined,
  isDefault: !!a.isDefault,
});

export default function AccountsPageClient() {
  const router = useRouter();
  const { accounts, isLoading } = useAccounts();
  const { formatAmount, formatDate } = useFormatter();

  const [modalState, setModalState] = useState<{
    isCreateOpen: boolean;
    editingAccount: Account | ApiAccount | null;
    deletingId: string | null;
  }>({ isCreateOpen: false, editingAccount: null, deletingId: null });

  const handleOpenCreate = useCallback(() => {
    setModalState((prev) => ({ ...prev, isCreateOpen: true }));
  }, []);

  const handleCreateOpenChange = useCallback((open: boolean) => {
    setModalState((prev) => ({ ...prev, isCreateOpen: open }));
  }, []);

  const handleEditOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setModalState((prev) => ({ ...prev, editingAccount: null }));
    }
  }, []);

  const handleDeleteOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setModalState((prev) => ({ ...prev, deletingId: null }));
    }
  }, []);

  const handleEdit = useCallback(
    (e: React.MouseEvent, account: Account | ApiAccount) => {
      e.stopPropagation();
      setModalState((prev) => ({ ...prev, editingAccount: account }));
    },
    [],
  );

  const handleDeleteClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setModalState((prev) => ({ ...prev, deletingId: id }));
  }, []);

  const { deleteAccount } = useAccounts();

  const handleDeleteConfirm = useCallback(async () => {
    if (!modalState.deletingId) return;
    try {
      await deleteAccount({ id: modalState.deletingId });
    } finally {
      setModalState((prev) => ({ ...prev, deletingId: null }));
    }
  }, [modalState.deletingId, deleteAccount]);

  return (
    <div className="animate-in fade-in-50 flex flex-col space-y-12 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Accounts
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your bank accounts, credit cards, and cash wallets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {accounts.length > 0 && (
            <Button onClick={handleOpenCreate} className="gap-2 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              Add Account
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <AccountSkeleton />
      ) : accounts.length === 0 ? (
        <EmptyState onCreate={handleOpenCreate} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onClick={() => router.push(`/accounts/${account.id}`)}
              formatAmount={formatAmount}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      <Suspense fallback={null}>
        <AccountForm
          open={modalState.isCreateOpen}
          onOpenChange={handleCreateOpenChange}
        />
      </Suspense>

      {modalState.editingAccount && (
        <Suspense fallback={null}>
          <AccountForm
            open={true}
            onOpenChange={handleEditOpenChange}
            initialValues={mapToInitialValues(modalState.editingAccount)}
          />
        </Suspense>
      )}

      <DeleteDialog
        open={!!modalState.deletingId}
        onOpenChange={handleDeleteOpenChange}
        title="Delete Account"
        description="Are you sure you want to delete this account? All associated transactions will be permanently removed."
        confirmText="Delete Account"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card/50 space-y-4 rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="pt-4">
            <Skeleton className="h-8 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-muted/10 animate-in zoom-in-95 flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center duration-500">
      <div className="bg-primary/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <Wallet className="text-primary h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">No accounts yet</h2>
      <p className="text-muted-foreground mt-2 mb-8 max-w-md">
        You have not added any accounts yet. Connect your bank accounts, credit
        cards, or cash wallets to start tracking your finances.
      </p>
      <Button
        onClick={onCreate}
        size="lg"
        className="gap-2 shadow-lg transition-all hover:shadow-xl"
      >
        <PlusCircle className="h-5 w-5" />
        Add Your First Account
      </Button>
    </div>
  );
}
