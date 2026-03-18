import { useCallback } from "react";
import { api } from "@/trpc/react";
import { invalidateAccounts } from "@/trpc/invalidation";
import type { ApiBankAccount } from "@/types/account";

/**
 * useAccounts hook
 * - provides list, create, update, delete helpers for bank accounts
 */
export function useAccounts() {
  const utils = api.useUtils();

  const listQuery = api.account.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 2,
  });

  // Safe types inferred from tRPC — we cast only the return data structure
  // if tRPC types are lost or overly broad.
  const apiAccounts = (listQuery.data ?? []) as ApiBankAccount[];

  const createMutation = api.account.create.useMutation({
    async onSuccess() {
      await invalidateAccounts(utils);
    },
  });

  const updateMutation = api.account.update.useMutation({
    async onSuccess() {
      await invalidateAccounts(utils);
    },
  });

  const deleteMutation = api.account.delete.useMutation({
    async onSuccess() {
      await invalidateAccounts(utils);
    },
  });

  const createAccount = useCallback(
    (data: Parameters<typeof createMutation.mutateAsync>[0]) =>
      createMutation.mutateAsync(data),
    [createMutation],
  );
  const updateAccount = useCallback(
    (data: Parameters<typeof updateMutation.mutateAsync>[0]) =>
      updateMutation.mutateAsync(data),
    [updateMutation],
  );
  const deleteAccount = useCallback(
    (data: Parameters<typeof deleteMutation.mutateAsync>[0]) =>
      deleteMutation.mutateAsync(data),
    [deleteMutation],
  );

  const setDefaultAccount = useCallback(
    async (id: string) => {
      const prev = utils.account.list.getData();

      utils.account.list.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((a) => ({ ...a, isDefault: a.id === id }));
      });

      try {
        await updateMutation.mutateAsync({ id, isDefault: true });
      } catch (err) {
        // rollback on error
        utils.account.list.setData(undefined, () => prev);
        throw err;
      } finally {
        await invalidateAccounts(utils);
      }
    },
    [updateMutation, utils],
  );

  return {
    accounts: apiAccounts,
    isLoading: listQuery.isLoading,
    isFetched: listQuery.isFetched,
    refetch: listQuery.refetch,
    createAccount,
    updateAccount,
    deleteAccount,
    setDefaultAccount,
    createStatus: createMutation.status,
    updateStatus: updateMutation.status,
    deleteStatus: deleteMutation.status,
  } as const;
}

export default useAccounts;
