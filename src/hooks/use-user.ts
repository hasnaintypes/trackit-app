import { useCallback } from "react";
import { api } from "@/trpc/react";
import { invalidateUser } from "@/trpc/invalidation";
import type { ApiUser } from "@/types/user";

/**
 * useUser hook
 *
 * Single source of truth for user data via React Query / tRPC.
 * - reads the current user via `api.user.getMe`
 * - exposes `updateProfile` and `uploadProfileImage` helpers
 * - provides a convenience `uploadFile` that accepts a File and performs
 *   a data-URL conversion before calling the upload mutation.
 */
export function useUser() {
  const getMe = api.user.getMe.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const utils = api.useUtils();

  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: (updatedUser) => {
      const typedUser = updatedUser as ApiUser;
      utils.user.getMe.setData(undefined, typedUser);
      void invalidateUser(utils);
      return updatedUser;
    },
  });

  const uploadProfileImageMutation = api.user.uploadProfileImage.useMutation({
    onSuccess: (updatedUser) => {
      const typedUser = updatedUser as ApiUser;
      utils.user.getMe.setData(undefined, typedUser);
      void invalidateUser(utils);
      return updatedUser;
    },
  });

  const uploadFile = useCallback(
    async (file: File, opts?: { fileName?: string; folder?: string }) => {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onerror = () => reject(new Error("Failed to read file"));
        fr.onload = () => {
          const result = fr.result;
          if (typeof result === "string") resolve(result);
          else reject(new Error("Unexpected FileReader result type"));
        };
        fr.readAsDataURL(file);
      });

      return uploadProfileImageMutation.mutateAsync({
        file: dataUrl,
        fileName: opts?.fileName,
        folder: opts?.folder,
      });
    },
    [uploadProfileImageMutation],
  );

  return {
    user: getMe.data ?? null,
    isLoading: getMe.isLoading,
    isFetched: getMe.isFetched,
    refetch: getMe.refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    uploadProfileImage: uploadProfileImageMutation.mutateAsync,
    uploadFile,
    status: getMe.status,
  } as const;
}

export default useUser;
