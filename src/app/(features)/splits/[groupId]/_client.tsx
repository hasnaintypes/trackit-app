"use client";

import React, { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useGroupDetail } from "@/hooks/use-group-detail";
import { useFormatter } from "@/hooks/use-formatter";
import { GroupHeader } from "@/components/pages/(protected)/splits/group-detail/group-header";
import { GroupStats } from "@/components/pages/(protected)/splits/group-detail/group-stats";
import { BalanceSummary } from "@/components/pages/(protected)/splits/group-detail/balance-summary";
import { SimplifiedDebts } from "@/components/pages/(protected)/splits/group-detail/simplified-debts";
import { ExpenseList } from "@/components/pages/(protected)/splits/group-detail/expense-list";
import { ActivityFeed } from "@/components/pages/(protected)/splits/group-detail/activity-feed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { ScrollArea } from "@ui/scroll-area";
import {
  Receipt,
  BarChart3,
  HandCoins,
  Clock,
  Radar,
  Users,
} from "lucide-react";
import type { CreateExpenseInput } from "@/validation/expense";
import type { CreateSettlementInput } from "@/validation/settlement";

const ExpenseFormSheet = dynamic(
  () =>
    import(
      "@/components/pages/(protected)/splits/group-detail/expense-form-sheet"
    ).then((m) => ({ default: m.ExpenseFormSheet })),
  { ssr: false },
);

const SettleUpDialog = dynamic(
  () =>
    import(
      "@/components/pages/(protected)/splits/group-detail/settle-up-dialog"
    ).then((m) => ({ default: m.SettleUpDialog })),
  { ssr: false },
);

const SpendingRadarChart = dynamic(
  () =>
    import(
      "@/components/pages/(protected)/splits/group-detail/spending-radar-chart"
    ).then((m) => ({ default: m.SpendingRadarChart })),
  { ssr: false },
);

const MemberBalancesChart = dynamic(
  () =>
    import(
      "@/components/pages/(protected)/splits/group-detail/member-balances-chart"
    ).then((m) => ({ default: m.MemberBalancesChart })),
  { ssr: false },
);

interface SimplifiedDebt {
  from: { contactId: string | null; name: string; avatarUrl: string | null };
  to: { contactId: string | null; name: string; avatarUrl: string | null };
  amount: number;
}

export default function GroupDetailPageClient({
  groupId,
}: {
  groupId: string;
}) {
  const { formatAmount, formatDate } = useFormatter();

  const {
    group,
    balances,
    simplifiedDebts,
    activityFeed,
    expenses,
    isLoading,
    isBalancesLoading,
    isDebtsLoading,
    isFeedLoading,
    createExpense,
    deleteExpense,
    createSettlement,
    createExpenseStatus,
    createSettlementStatus,
  } = useGroupDetail(groupId);

  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);
  const [settleSheetOpen, setSettleSheetOpen] = useState(false);
  const [settleDebt, setSettleDebt] = useState<SimplifiedDebt | null>(null);

  const stats = useMemo(() => {
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const selfBalance =
      balances.find((b) => b.contactId === null)?.balance ?? 0;
    const yourShare = expenses.reduce((sum, e) => {
      const selfParticipant = e.participants.find((p) => p.contactId === null);
      return sum + (selfParticipant?.owedAmount ?? 0);
    }, 0);
    return { totalSpent, yourShare, yourBalance: selfBalance };
  }, [expenses, balances]);

  const handleAddExpense = useCallback(() => {
    setExpenseSheetOpen(true);
  }, []);

  const handleCreateExpense = useCallback(
    async (data: CreateExpenseInput) => {
      await createExpense(data);
      toast.success("Expense added");
    },
    [createExpense],
  );

  const handleDeleteExpense = useCallback(
    async (id: string) => {
      try {
        await deleteExpense({ id });
        toast.success("Expense deleted");
      } catch {
        toast.error("Failed to delete expense");
      }
    },
    [deleteExpense],
  );

  const handleSettle = useCallback((debt: SimplifiedDebt) => {
    setSettleDebt(debt);
    setSettleSheetOpen(true);
  }, []);

  const handleCreateSettlement = useCallback(
    async (data: CreateSettlementInput) => {
      await createSettlement(data);
    },
    [createSettlement],
  );

  if (!group && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground text-lg">Group not found</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-50 flex flex-col space-y-12 duration-500">
      {/* Header */}
      {group && (
        <GroupHeader
          name={group.name}
          type={group.type}
          currency={group.currency}
          color={group.color}
          members={group.members ?? []}
          onAddExpense={handleAddExpense}
        />
      )}

      {/* Stats — 3 cards */}
      <GroupStats
        totalSpent={stats.totalSpent}
        yourShare={stats.yourShare}
        yourBalance={stats.yourBalance}
        isLoading={isLoading}
        formatAmount={formatAmount}
      />

      {/* Tabbed content */}
      <Tabs defaultValue="expenses" className="w-full">
        <div className="bg-card rounded-xl border p-2">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="expenses" className="gap-1.5">
              <Receipt className="h-4 w-4" />
              Expenses
              {expenses.length > 0 && (
                <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                  {expenses.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="settle" className="gap-1.5">
              <HandCoins className="h-4 w-4" />
              Settle Up
              {simplifiedDebts.length > 0 && (
                <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                  {simplifiedDebts.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Expenses & Activity tab */}
        <TabsContent value="expenses" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Expense list — 3 cols */}
            <div className="col-span-full lg:col-span-3">
              <Card className="shadow-md dark:border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Receipt className="h-4 w-4" />
                    Expenses
                    {expenses.length > 0 && (
                      <span className="bg-primary/10 text-primary ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                        {expenses.length}
                      </span>
                    )}
                  </CardTitle>
                  <p className="text-muted-foreground text-xs">
                    All shared expenses in this group
                  </p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[520px] [&_[data-radix-scroll-area-scrollbar]]:hidden">
                    <ExpenseList
                      expenses={expenses}
                      isLoading={isLoading}
                      formatAmount={formatAmount}
                      formatDate={formatDate}
                      onDelete={handleDeleteExpense}
                    />
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Activity feed — 2 cols */}
            <div className="col-span-full lg:col-span-2">
              <Card className="shadow-md dark:border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Clock className="h-4 w-4" />
                    Activity
                  </CardTitle>
                  <p className="text-muted-foreground text-xs">
                    Recent expenses and settlements
                  </p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[520px] [&_[data-radix-scroll-area-scrollbar]]:hidden">
                    <ActivityFeed
                      items={activityFeed}
                      isLoading={isFeedLoading}
                      formatAmount={formatAmount}
                    />
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Charts tab */}
        <TabsContent value="charts" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {group && (
              <Card className="shadow-md dark:border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Radar className="h-4 w-4" />
                    Spending by Category
                  </CardTitle>
                  <p className="text-muted-foreground text-xs">
                    Per-member spending across categories
                  </p>
                </CardHeader>
                <CardContent>
                  <SpendingRadarChart
                    expenses={expenses}
                    members={group.members ?? []}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            )}

            <Card className="shadow-md dark:border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Users className="h-4 w-4" />
                  Member Balances
                </CardTitle>
                <p className="text-muted-foreground text-xs">
                  Net balance per group member
                </p>
              </CardHeader>
              <CardContent>
                <MemberBalancesChart
                  balances={balances}
                  isLoading={isBalancesLoading}
                  formatAmount={formatAmount}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settle Up tab */}
        <TabsContent value="settle" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <BalanceSummary
              balances={balances}
              isLoading={isBalancesLoading}
              formatAmount={formatAmount}
            />
            <SimplifiedDebts
              debts={simplifiedDebts}
              isLoading={isDebtsLoading}
              formatAmount={formatAmount}
              onSettle={handleSettle}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Sheets */}
      {group && (
        <ExpenseFormSheet
          open={expenseSheetOpen}
          onOpenChange={setExpenseSheetOpen}
          groupId={groupId}
          members={group.members ?? []}
          onSubmit={handleCreateExpense}
          isSubmitting={createExpenseStatus === "pending"}
        />
      )}

      <SettleUpDialog
        open={settleSheetOpen}
        onOpenChange={setSettleSheetOpen}
        groupId={groupId}
        from={settleDebt?.from ?? null}
        to={settleDebt?.to ?? null}
        amount={settleDebt?.amount ?? 0}
        onSubmit={handleCreateSettlement}
        isSubmitting={createSettlementStatus === "pending"}
      />
    </div>
  );
}
