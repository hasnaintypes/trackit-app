"use client";

import { TransactionsTable } from "@common/transactions-table";
import type { Transaction } from "@/types/transaction";

interface TransactionsListProps {
  transactions: Transaction[];
  isLoading: boolean;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  onEdit: (tx: Transaction) => void;
  onDelete: (ids: string[]) => Promise<void>;
  onPageChange: (index: number, size?: number) => void;
}

export function TransactionsList({
  transactions,
  isLoading,
  totalCount,
  pageIndex,
  pageSize,
  onEdit,
  onDelete,
  onPageChange,
}: TransactionsListProps) {
  return (
    <TransactionsTable
      transactions={transactions}
      isLoading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
      onView={onEdit}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalCount={totalCount}
      onPageChange={onPageChange}
    />
  );
}
