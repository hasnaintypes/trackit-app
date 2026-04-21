import { useCallback } from "react";
import { api } from "@/trpc/react";
import { invalidateContacts } from "@/trpc/invalidation";

/**
 * useContacts hook
 * - provides list, create, update, delete helpers for contacts
 */
export function useContacts(search?: string) {
  const utils = api.useUtils();

  const listQuery = api.contact.list.useQuery(
    { search, limit: 50 },
    { staleTime: 1000 * 60 * 2 },
  );

  const createMutation = api.contact.create.useMutation({
    async onSuccess() {
      await invalidateContacts(utils);
    },
  });

  const updateMutation = api.contact.update.useMutation({
    async onSuccess() {
      await invalidateContacts(utils);
    },
  });

  const deleteMutation = api.contact.delete.useMutation({
    async onSuccess() {
      await invalidateContacts(utils);
    },
  });

  const createContact = useCallback(
    (data: Parameters<typeof createMutation.mutateAsync>[0]) =>
      createMutation.mutateAsync(data),
    [createMutation],
  );

  const updateContact = useCallback(
    (data: Parameters<typeof updateMutation.mutateAsync>[0]) =>
      updateMutation.mutateAsync(data),
    [updateMutation],
  );

  const deleteContact = useCallback(
    (data: Parameters<typeof deleteMutation.mutateAsync>[0]) =>
      deleteMutation.mutateAsync(data),
    [deleteMutation],
  );

  return {
    contacts: listQuery.data?.contacts ?? [],
    isLoading: listQuery.isLoading,
    isFetched: listQuery.isFetched,
    refetch: listQuery.refetch,
    createContact,
    updateContact,
    deleteContact,
    createStatus: createMutation.status,
    updateStatus: updateMutation.status,
    deleteStatus: deleteMutation.status,
  } as const;
}

export default useContacts;
