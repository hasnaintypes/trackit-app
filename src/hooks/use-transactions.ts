"use client";

import { api } from "@/trpc/react";

export function useTransactions() {
  const utils = api.useUtils();
  const listQuery = api.transaction.list.useQuery;
  const getByIdQuery = api.transaction.getById.useQuery;

  const invalidateAll = async () => {
    await Promise.all([
      utils.transaction.list.invalidate(),
      utils.account.list.invalidate(),
    ]);
  };

  const create = api.transaction.create.useMutation({
    onSuccess: invalidateAll,
  });

  const update = api.transaction.update.useMutation({
    onSuccess: invalidateAll,
  });

  const remove = api.transaction.delete.useMutation({
    onSuccess: invalidateAll,
  });

  const bulkCreate = api.transaction.bulkCreate.useMutation({
    onSuccess: invalidateAll,
  });

  return {
    listQuery,
    getByIdQuery,
    create,
    update,
    remove,
    bulkCreate,
  } as const;
}

export default useTransactions;
