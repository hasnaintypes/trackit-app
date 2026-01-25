import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/user";

type UserState = {
  user: User | null;
  setUser: (u: User | null) => void;
  clear: () => void;
};

/**
 * Optional lightweight Zustand store for user data.
 *
 * Note: server state (user profile) is already cached via react-query. Use this
 * store only for small UI-only pieces of state closely tied to the user that
 * you want to access outside React tree (or without hooks). Otherwise prefer
 * react-query + tRPC.
 */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u: User | null) => set({ user: u }),
      clear: () => set({ user: null }),
    }),
    {
      name: "cashio_user",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return localStorage;
        return {
          getItem: (_key: string) => null,
          setItem: (_key: string, _value: string) => {
            /* noop */
          },
          removeItem: (_key: string) => {
            /* noop */
          },
          clear: () => {
            /* noop */
          },
          key: (_index: number) => null,
          length: 0,
        };
      }),
    },
  ),
);

export default useUserStore;
