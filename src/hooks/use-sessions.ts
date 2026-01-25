import { useCallback } from "react";
import { api } from "@/trpc/react";
import type { SessionItem } from "@/types/session";

export function useSessions() {
  const listQuery = api.session.list.useQuery(undefined, {
    staleTime: 1000 * 30,
  });

  const utils = api.useContext();

  const revoke = api.session.revoke.useMutation({
    onSuccess() {
      void utils.session.list.invalidate();
    },
  });

  const revokeAll = api.session.revokeAll.useMutation({
    onSuccess() {
      void utils.session.list.invalidate();
    },
  });

  const list = listQuery.data ?? [];

  const reload = useCallback(
    () => void utils.session.list.invalidate(),
    [utils],
  );

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
