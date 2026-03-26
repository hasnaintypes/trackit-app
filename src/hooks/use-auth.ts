import { useState, useCallback } from "react";
import { authClient } from "@/lib/auth/client";
import type { User } from "@/types/user";
import { toError } from "@shared/error";
import { isUser } from "@/lib/utils";
import { createLogger } from "@/lib/logging";
import { api } from "@/trpc/react";

const logger = createLogger("use-auth");

interface SignUpPayload {
  name?: string;
  email: string;
  password: string;
  image?: string;
  callbackURL?: string;
  role?: string;
}

interface SignInPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
  callbackURL?: string;
}

export function useAuth() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const utils = api.useUtils();

  const invalidateUserCache = useCallback(() => {
    void utils.user.getMe.invalidate();
  }, [utils]);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data: session, error } = await authClient.getSession();
      if (error) throw toError(error);
      const maybeUser = session?.user ?? null;
      invalidateUserCache();
      logger.info("Fetched user session", { user: maybeUser });
    } catch (err) {
      setError(toError(err));
      logger.error("Failed to fetch user session", {
        error: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  }, [invalidateUserCache]);

  const signUp = useCallback(
    async (payload: SignUpPayload): Promise<User | null> => {
      setLoading(true);
      try {
        const finalPayload = {
          ...payload,
          name:
            typeof payload.name === "string" && payload.name.length > 0
              ? payload.name
              : payload.email.split("@")[0],
          callbackURL: payload.callbackURL ?? "/",
        } as Omit<SignUpPayload, "name"> & { name: string };

        const result = await authClient.signUp.email(finalPayload);
        if (result.error) throw toError(result.error);
        await fetchUser();
        const maybeUser = "user" in result ? result.user : null;
        logger.info("User signed up", { user: maybeUser });
        return isUser(maybeUser) ? maybeUser : null;
      } catch (err) {
        const errorObj = toError(err);
        setError(errorObj);
        logger.error("Sign up failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        throw errorObj;
      } finally {
        setLoading(false);
      }
    },
    [fetchUser],
  );

  const signIn = useCallback(
    async (payload: SignInPayload): Promise<User | null> => {
      setLoading(true);
      try {
        const result = await authClient.signIn.email(
          {
            ...payload,
            callbackURL: payload.callbackURL ?? "/",
          },
          {
            onError: (ctx: { error: { status: number; message: string } }) => {
              if (ctx.error.status === 403) {
                setError(new Error("Please verify your email address"));
              } else {
                setError(new Error(ctx.error.message));
              }
            },
          },
        );
        if (result.error) throw toError(result.error);
        await fetchUser();
        const maybeUser = "user" in result ? result.user : null;
        logger.info("User signed in", { user: maybeUser });
        return isUser(maybeUser) ? maybeUser : null;
      } catch (err) {
        const errorObj = toError(err);
        setError(errorObj);
        logger.error("Sign in failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        throw errorObj;
      } finally {
        setLoading(false);
      }
    },
    [fetchUser],
  );

  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      utils.user.getMe.setData(undefined, undefined);
      await authClient.signOut({
        fetchOptions: { onSuccess: () => invalidateUserCache() },
      });
      logger.info("User signed out");
    } catch (err) {
      const errorObj = toError(err);
      setError(errorObj);
      logger.error("Sign out failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [utils, invalidateUserCache]);

  const sendVerificationEmail = useCallback(
    async (email: string, callbackURL?: string): Promise<void> => {
      try {
        await authClient.sendVerificationEmail({
          email,
          callbackURL: callbackURL ?? "/",
        });
        logger.info("Sent verification email", { email });
      } catch (err) {
        const errorObj = toError(err);
        setError(errorObj);
        logger.error("Send verification email failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        throw errorObj;
      }
    },
    [],
  );

  const requestPasswordReset = useCallback(
    async (email: string, redirectTo?: string): Promise<void> => {
      try {
        await authClient.requestPasswordReset({
          email,
          redirectTo: redirectTo ?? "/reset-password",
        });
        logger.info("Requested password reset", { email });
      } catch (err) {
        const errorObj = toError(err);
        setError(errorObj);
        logger.error("Request password reset failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        throw errorObj;
      }
    },
    [],
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<void> => {
      try {
        const result = await authClient.resetPassword({ token, newPassword });
        if (result.error) {
          throw new Error(result.error.message ?? "Password reset failed");
        }
        logger.info("Password reset successfully");
        await fetchUser();
      } catch (err) {
        const errorObj = toError(err);
        setError(errorObj);
        logger.error("Password reset failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        throw errorObj;
      }
    },
    [fetchUser],
  );

  const changePassword = useCallback(
    async (
      newPassword: string,
      currentPassword: string,
      revokeOtherSessions?: boolean,
    ): Promise<void> => {
      try {
        await authClient.changePassword({
          newPassword,
          currentPassword,
          revokeOtherSessions,
        });
        logger.info("Password changed");
      } catch (err) {
        const errorObj = toError(err);
        setError(errorObj);
        logger.error("Change password failed", {
          error: err instanceof Error ? err.message : String(err),
        });
        throw errorObj;
      }
    },
    [],
  );

  const signInWithGoogle = useCallback(
    async (callbackURL?: string): Promise<void> => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackURL ?? "/overview",
      });
    },
    [],
  );

  return {
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    sendVerificationEmail,
    requestPasswordReset,
    resetPassword,
    changePassword,
    refetch: fetchUser,
  };
}
