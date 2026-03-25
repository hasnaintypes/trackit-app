import { useCallback } from "react";
import { api } from "@/trpc/react";
import { invalidateGroups } from "@/trpc/invalidation";

/**
 * useGroups hook
 * - provides list, create, update, archive, delete helpers for groups
 * - includes member management (add/remove)
 */
export function useGroups(includeArchived = false) {
  const utils = api.useUtils();

  const listQuery = api.group.list.useQuery(
    { includeArchived },
    { staleTime: 1000 * 60 * 2 },
  );

  const createMutation = api.group.create.useMutation({
    async onSuccess() {
      await invalidateGroups(utils);
    },
  });

  const updateMutation = api.group.update.useMutation({
    async onSuccess() {
      await invalidateGroups(utils);
    },
  });

  const archiveMutation = api.group.archive.useMutation({
    async onSuccess() {
      await invalidateGroups(utils);
    },
  });

  const unarchiveMutation = api.group.unarchive.useMutation({
    async onSuccess() {
      await invalidateGroups(utils);
    },
  });

  const deleteMutation = api.group.delete.useMutation({
    async onSuccess() {
      await invalidateGroups(utils);
    },
  });

  const addMemberMutation = api.group.addMember.useMutation({
    async onSuccess() {
      await invalidateGroups(utils);
    },
  });

  const removeMemberMutation = api.group.removeMember.useMutation({
    async onSuccess() {
      await invalidateGroups(utils);
    },
  });

  const createGroup = useCallback(
    (data: Parameters<typeof createMutation.mutateAsync>[0]) =>
      createMutation.mutateAsync(data),
    [createMutation],
  );

  const updateGroup = useCallback(
    (data: Parameters<typeof updateMutation.mutateAsync>[0]) =>
      updateMutation.mutateAsync(data),
    [updateMutation],
  );

  const archiveGroup = useCallback(
    (data: Parameters<typeof archiveMutation.mutateAsync>[0]) =>
      archiveMutation.mutateAsync(data),
    [archiveMutation],
  );

  const unarchiveGroup = useCallback(
    (data: Parameters<typeof unarchiveMutation.mutateAsync>[0]) =>
      unarchiveMutation.mutateAsync(data),
    [unarchiveMutation],
  );

  const deleteGroup = useCallback(
    (data: Parameters<typeof deleteMutation.mutateAsync>[0]) =>
      deleteMutation.mutateAsync(data),
    [deleteMutation],
  );

  const addMember = useCallback(
    (data: Parameters<typeof addMemberMutation.mutateAsync>[0]) =>
      addMemberMutation.mutateAsync(data),
    [addMemberMutation],
  );

  const removeMember = useCallback(
    (data: Parameters<typeof removeMemberMutation.mutateAsync>[0]) =>
      removeMemberMutation.mutateAsync(data),
    [removeMemberMutation],
  );

  return {
    groups: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    isFetched: listQuery.isFetched,
    refetch: listQuery.refetch,
    createGroup,
    updateGroup,
    archiveGroup,
    unarchiveGroup,
    deleteGroup,
    addMember,
    removeMember,
    createStatus: createMutation.status,
    updateStatus: updateMutation.status,
    deleteStatus: deleteMutation.status,
    archiveStatus: archiveMutation.status,
    addMemberStatus: addMemberMutation.status,
  } as const;
}

export default useGroups;
