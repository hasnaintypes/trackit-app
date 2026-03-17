import { useCallback } from "react";
import { api } from "@/trpc/react";
import { invalidateSessions } from "@/lib/trpc/invalidation";
import type { SessionItem } from "@/types/session";

export function useSessions() {
  const listQuery = api.session.list.useQuery(undefined, {
    staleTime: 1000 * 30,
  });

  const utils = api.useUtils();

  const revoke = api.session.revoke.useMutation({
    onSuccess() {
      void invalidateSessions(utils);
    },
  });

  const revokeAll = api.session.revokeAll.useMutation({
    onSuccess() {
      void invalidateSessions(utils);
    },
  });

  const list = listQuery.data ?? [];

  const reload = useCallback(() => void invalidateSessions(utils), [utils]);

  return {
    sessions: list as SessionItem[],
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    revoke: revoke.mutateAsync,
    revokeAll: revokeAll.mutateAsync,
    reload,
  } as const;
}

export default useSessions;
