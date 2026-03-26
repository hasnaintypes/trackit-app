import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { dashClient, sentinelClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  plugins: [
    nextCookies(),
    adminClient(),
    dashClient(),
    sentinelClient({ autoSolveChallenge: true }),
  ],
});
