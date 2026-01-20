import { useCallback } from "react";
import { api } from "@/trpc/react";
import type { BankAccount } from "@/types/account";

/**
 * useAccounts hook
 * - provides list, create, update, delete helpers for bank accounts
 */
export function useAccounts() {
  const utils = api.useContext();

  // The tRPC query result includes error-typed fields that ESLint flags as unsafe.
  // We only need the safe public properties (`data`, `isLoading`, `isFetched`, `refetch`).
  const listQuery = api.account.list.useQuery(undefined, {
    staleTime: 1000 * 60 * 2,
  });
  const isLoading = listQuery.isLoading;
  const isFetched = listQuery.isFetched;
  const refetch = listQuery.refetch;

  const createMutation = api.account.create.useMutation({
    async onSuccess() {
      await utils.account.list.invalidate();
    },
  });

  const updateMutation = api.account.update.useMutation({
    async onSuccess() {
      await Promise.all([utils.account.list.invalidate()]);
    },
  });

  const deleteMutation = api.account.delete.useMutation({
    async onSuccess() {
      await utils.account.list.invalidate();
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
        // rollback on error — restore previous snapshot as-is
        utils.account.list.setData(undefined, () => prev);
        throw err;
      } finally {
        // ensure server state is reflected
        await utils.account.list.invalidate();
      }
    },
    [updateMutation, utils.account.list],
  );

  // API returns the BankAccount shape but with date fields serialized to strings
  type ApiBankAccount = Omit<BankAccount, "createdAt" | "updatedAt"> & {
    createdAt: string;
    updatedAt: string;
  };

  // Convert the possibly error-typed `accounts` array to a local API-safe type.
  // Use an intermediate `unknown` cast to satisfy TypeScript when narrowing.
  const apiAccounts = (listQuery.data ?? []) as unknown as ApiBankAccount[];

  return {
    accounts: apiAccounts,
    isLoading,
    isFetched,
    refetch,
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
