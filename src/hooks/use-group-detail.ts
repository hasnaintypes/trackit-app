import { useCallback } from "react";
import { api } from "@/trpc/react";
import { invalidateGroupDetail } from "@/trpc/invalidation";

/**
 * useGroupDetail hook
 * Encapsulates all queries and mutations for a single group detail page.
 */
export function useGroupDetail(groupId: string) {
  const utils = api.useUtils();

  const groupQuery = api.group.getById.useQuery(
    { id: groupId },
    { staleTime: 1000 * 60 * 2 },
  );

  const balancesQuery = api.group.getBalances.useQuery(
    { id: groupId },
    { staleTime: 1000 * 60 * 2 },
  );

  const simplifiedDebtsQuery = api.group.getSimplifiedDebts.useQuery(
    { id: groupId },
    { staleTime: 1000 * 60 * 2 },
  );

  const activityFeedQuery = api.group.activityFeed.useQuery(
    { id: groupId, limit: 30 },
    { staleTime: 1000 * 60 * 2 },
  );

  const expensesQuery = api.expense.list.useQuery(
    { groupId, limit: 30 },
    { staleTime: 1000 * 60 * 2 },
  );

  const settlementsQuery = api.settlement.list.useQuery(
    { groupId, limit: 30 },
    { staleTime: 1000 * 60 * 2 },
  );

  const invalidate = useCallback(
    () => invalidateGroupDetail(utils, groupId),
    [utils, groupId],
  );

  const createExpenseMutation = api.expense.create.useMutation({
    async onSuccess() {
      await invalidate();
    },
  });

  const deleteExpenseMutation = api.expense.delete.useMutation({
    async onSuccess() {
      await invalidate();
    },
  });

  const createSettlementMutation = api.settlement.create.useMutation({
    async onSuccess() {
      await invalidate();
    },
  });

  const createExpense = useCallback(
    (data: Parameters<typeof createExpenseMutation.mutateAsync>[0]) =>
      createExpenseMutation.mutateAsync(data),
    [createExpenseMutation],
  );

  const deleteExpense = useCallback(
    (data: Parameters<typeof deleteExpenseMutation.mutateAsync>[0]) =>
      deleteExpenseMutation.mutateAsync(data),
    [deleteExpenseMutation],
  );

  const createSettlement = useCallback(
    (data: Parameters<typeof createSettlementMutation.mutateAsync>[0]) =>
      createSettlementMutation.mutateAsync(data),
    [createSettlementMutation],
  );

  return {
    group: groupQuery.data ?? null,
    balances: balancesQuery.data ?? [],
    simplifiedDebts: simplifiedDebtsQuery.data ?? [],
    activityFeed: activityFeedQuery.data ?? [],
    expenses: expensesQuery.data?.expenses ?? [],
    settlements: settlementsQuery.data?.settlements ?? [],
    isLoading:
      groupQuery.isLoading ||
      balancesQuery.isLoading ||
      expensesQuery.isLoading,
    isBalancesLoading: balancesQuery.isLoading,
    isDebtsLoading: simplifiedDebtsQuery.isLoading,
    isFeedLoading: activityFeedQuery.isLoading,
    createExpense,
    deleteExpense,
    createSettlement,
    createExpenseStatus: createExpenseMutation.status,
    deleteExpenseStatus: deleteExpenseMutation.status,
    createSettlementStatus: createSettlementMutation.status,
  } as const;
}

export default useGroupDetail;
