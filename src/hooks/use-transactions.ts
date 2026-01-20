"use client";

import { api } from "@/trpc/react";

export function useTransactions() {
  // Expose tRPC hooks directly so consumers can call them with React lifecycle
  // semantics (useQuery/useMutation) as in other hooks in this repo.
  const listQuery = api.transaction.list.useQuery;
  const getByIdQuery = api.transaction.getById.useQuery;

  const create = api.transaction.create.useMutation();
  const update = api.transaction.update.useMutation();
  const remove = api.transaction.delete.useMutation();

  return {
    listQuery,
    getByIdQuery,
    create,
    update,
    remove,
  } as const;
}

export default useTransactions;
