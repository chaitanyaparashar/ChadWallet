"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";
import { isPlaceholder, publicEnv } from "@/lib/env";
import { AuthFallbackContext, type AuthState } from "@/lib/auth-fallback-context";

function warnNotConfigured() {
  console.warn("Set NEXT_PUBLIC_PRIVY_APP_ID");
  if (typeof window !== "undefined") {
    window.alert("Set NEXT_PUBLIC_PRIVY_APP_ID");
  }
}

const placeholderAuthState: AuthState = {
  ready: true,
  authenticated: false,
  solanaAddress: undefined,
  login: warnNotConfigured,
  logout: () => {},
};

/**
 * Wraps the app in Privy's auth provider so `useAuth()` and `<PrivyAuthButton>`
 * work anywhere in the tree.
 *
 * In placeholder mode (no real `NEXT_PUBLIC_PRIVY_APP_ID` configured), the real
 * `PrivyProvider` throws when it tries to initialize with a dummy app id. To keep
 * the app buildable and runnable before a real key is added, we skip mounting
 * `PrivyProvider` entirely and instead provide a no-op fallback auth context whose
 * `login()` just warns the developer to configure the env var.
 */
export function PrivyProviderWrapper({ children }: { children: ReactNode }) {
  if (isPlaceholder(publicEnv.privyAppId)) {
    return (
      <AuthFallbackContext.Provider value={placeholderAuthState}>
        {children}
      </AuthFallbackContext.Provider>
    );
  }

  return (
    <PrivyProvider
      appId={publicEnv.privyAppId!}
      config={{
        loginMethods: ["google"],
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
