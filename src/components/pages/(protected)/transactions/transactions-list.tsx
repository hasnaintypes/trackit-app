"use client";

import { TransactionsTable } from "@/components/common/transactions-table";
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
    <div className="border-border/50 bg-card/50 rounded-lg border shadow-sm backdrop-blur-sm">
      <div className="border-border/50 border-b px-6 py-4">
        <h2 className="text-foreground text-lg font-semibold">
          All Transactions
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {totalCount} total transactions
        </p>
      </div>

      <div className="p-6">
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
      </div>
    </div>
  );
}
