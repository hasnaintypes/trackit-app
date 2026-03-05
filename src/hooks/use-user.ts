import { useCallback, useEffect } from "react";
import { api } from "@/trpc/react";
import { useUserStore } from "@/store/userStore";
import type { User, ApiUser } from "@/types/user";

function mapApiToUser(apiUser: ApiUser): User {
  return {
    ...apiUser,
    createdAt: new Date(apiUser.createdAt),
    updatedAt: new Date(apiUser.updatedAt),
    banExpires: apiUser.banExpires ? new Date(apiUser.banExpires) : null,
  };
}

/**
 * useUser hook
 *
 * - reads the current user via `api.user.getMe`
 * - exposes `updateProfile` and `uploadProfileImage` helpers
 * - provides a convenience `uploadFile` that accepts a File and performs
 *   a data-URL conversion before calling the upload mutation.
 */
export function useUser() {
  const getMe = api.user.getMe.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    if (!getMe.data) {
      setUser(null);
      return;
    }

    const typedUser = getMe.data as ApiUser;
    setUser(mapApiToUser(typedUser));
  }, [getMe.data, setUser]);

  const utils = api.useUtils();

  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: (updatedUser) => {
      const typedUser = updatedUser as ApiUser;
      utils.user.getMe.setData(undefined, typedUser);
      void utils.user.getMe.invalidate();
      return updatedUser;
    },
  });

  const uploadProfileImageMutation = api.user.uploadProfileImage.useMutation({
    onSuccess: (updatedUser) => {
      const typedUser = updatedUser as ApiUser;
      utils.user.getMe.setData(undefined, typedUser);
      setUser(mapApiToUser(typedUser));
      void utils.user.getMe.invalidate();
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
