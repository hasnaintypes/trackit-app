import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [nextCookies(), adminClient()],
});
