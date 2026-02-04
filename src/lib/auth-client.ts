import { createAuthClient } from "better-auth/react";
import { env } from "./env";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [adminClient()],
});
export type SignInOptions = Parameters<typeof authClient.signIn.email>[0];
