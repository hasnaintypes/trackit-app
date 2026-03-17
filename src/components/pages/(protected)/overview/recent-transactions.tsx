"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionsTable } from "@/components/common/transactions-table";
import type { Transaction } from "@/types/transaction";

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (ids: string[]) => Promise<void>;
  onView?: (transaction: Transaction) => void;
}

export const RecentTransactions = React.memo(function RecentTransactions({
  transactions,
  isLoading,
  onEdit,
  onDelete,
  onView,
}: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between px-6">
        <CardTitle>Recent Transactions</CardTitle>

        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link href="/transactions">
            See all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="px-6 pb-4">
        <TransactionsTable
          transactions={transactions.slice(0, 10)}
          isLoading={isLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          className="border-none shadow-none"
        />
      </CardContent>
    </Card>
  );
});
