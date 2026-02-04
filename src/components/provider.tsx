"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import Image from "next/image";

import { authClient } from "@/lib/auth-client";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => {
        // Clear router cache (protected routes)
        router.refresh();
      }}
      Link={Link}
      social={{
        providers: ["github", "google"],
      }}
      multiSession
      magicLink
      passkey
      account={{
        basePath: "/dashboard",
        fields: ["image", "name"],
      }}
      localizeErrors={false}
      viewPaths={{
        SIGN_IN: "/signin",
        SIGN_UP: "/signup",
      }}
    >
      {children}
    </AuthUIProvider>
  );
}
