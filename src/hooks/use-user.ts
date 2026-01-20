import { useCallback, useEffect } from "react";
import { api } from "@/trpc/react";
import { useUserStore } from "@/store/userStore";
import type { User, Gender, Country, Timezone } from "@/types/user";

type APIUser = Omit<User, "createdAt" | "updatedAt" | "banExpires"> & {
  createdAt: string;
  updatedAt: string;
  banExpires: string | null;
};

function mapAPIToUser(apiUser: Record<string, unknown>): APIUser {
  const idVal = apiUser.id;
  const createdVal = apiUser.createdAt;
  const updatedVal = apiUser.updatedAt;
  const banExpiresVal = apiUser.banExpires;

  return {
    id:
      typeof idVal === "string" || typeof idVal === "number"
        ? String(idVal)
        : "",
    name: (apiUser.name as string) ?? "",
    email: (apiUser.email as string) ?? "",
    emailVerified: Boolean(apiUser.emailVerified ?? false),
    image: (apiUser.image as string) ?? "",
    gender: (apiUser.gender as Gender) ?? null,
    country: (apiUser.country as Country) ?? null,
    timezone: (apiUser.timezone as Timezone) ?? null,
    banned: (apiUser.banned as boolean) ?? false,
    banReason: (apiUser.banReason as string) ?? null,
    banExpires:
      typeof banExpiresVal === "string" || typeof banExpiresVal === "number"
        ? String(banExpiresVal)
        : null,
    role: (apiUser.role as string) ?? "user",
    createdAt:
      typeof createdVal === "string" || typeof createdVal === "number"
        ? String(createdVal)
        : new Date().toISOString(),
    updatedAt:
      typeof updatedVal === "string" || typeof updatedVal === "number"
        ? String(updatedVal)
        : new Date().toISOString(),
  };
}

/**
 * useUser hook
 *
 * - reads the current user via `api.user.getMe`
 * - exposes `updateProfile` and `uploadProfileImage` helpers
 * - provides a convenience `uploadFile` that accepts a File and performs
 *   a data-URL conversion before calling the upload mutation.
 *
 * This hook relies on react-query (via tRPC) for caching and invalidation.
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

    const apiUser = getMe.data as unknown as Record<string, unknown>;
    const mappedAPIUser = mapAPIToUser(apiUser);

    const mappedUser: User = {
      ...mappedAPIUser,
      createdAt: new Date(mappedAPIUser.createdAt),
      updatedAt: new Date(mappedAPIUser.updatedAt),
      banExpires: mappedAPIUser.banExpires
        ? new Date(mappedAPIUser.banExpires)
        : null,
    };

    setUser(mappedUser);
  }, [getMe.data, setUser]);

  const utils = api.useContext();

  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: (updatedUser) => {
      const apiUser = updatedUser as unknown as Record<string, unknown>;
      const mappedAPIUser = mapAPIToUser(apiUser);

      // Update react-query cache immediately with API format
      utils.user.getMe.setData(undefined, mappedAPIUser);

      // Then trigger a background refresh to ensure data consistency
      void utils.user.getMe.invalidate();

      return updatedUser;
    },
  });

  const uploadProfileImageMutation = api.user.uploadProfileImage.useMutation({
    onSuccess: (updatedUser) => {
      const apiUser = updatedUser as unknown as Record<string, unknown>;
      const mappedAPIUser = mapAPIToUser(apiUser);

      // When updating cache, use the API format (with string dates)
      utils.user.getMe.setData(undefined, mappedAPIUser);

      // For the Zustand store, convert to User type with Date objects
      const mappedUser: User = {
        ...mappedAPIUser,
        createdAt: new Date(mappedAPIUser.createdAt),
        updatedAt: new Date(mappedAPIUser.updatedAt),
        banExpires: mappedAPIUser.banExpires
          ? new Date(mappedAPIUser.banExpires)
          : null,
      };

      // Update Zustand store with typed User
      setUser(mappedUser);

      // Then trigger a background refresh
      void utils.user.getMe.invalidate();

      return mappedUser;
    },
  });

  const uploadFile = useCallback(
    async (file: File, opts?: { fileName?: string; folder?: string }) => {
      // Read file as data URL
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

      // Call the upload mutation
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
