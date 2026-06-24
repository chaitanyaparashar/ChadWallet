"use client";

import { useContext } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { isPlaceholder, publicEnv } from "@/lib/env";
import { AuthFallbackContext, type AuthState } from "@/lib/auth-fallback-context";

const PLACEHOLDER_MODE = isPlaceholder(publicEnv.privyAppId);

/**
 * Real-mode implementation: wraps `usePrivy()` (auth state) and `useWallets()`
 * from `@privy-io/react-auth/solana` (embedded Solana wallet), exposing the
 * first connected Solana wallet's address.
 *
 * Only rendered when `PrivyProviderWrapper` has mounted a real `PrivyProvider`,
 * since these hooks throw without one.
 */
function useRealAuth(): AuthState {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();

  return {
    ready,
    authenticated,
    solanaAddress: wallets[0]?.address,
    login: (options) => login(options),
    logout: () => {
      void logout();
    },
  };
}

/**
 * Placeholder-mode implementation: reads the no-op fallback context that
 * `PrivyProviderWrapper` provides instead of a real `PrivyProvider`.
 */
function useFallbackAuth(): AuthState {
  const fallback = useContext(AuthFallbackContext);
  if (!fallback) {
    throw new Error("useAuth() must be used within <PrivyProviderWrapper>");
  }
  return fallback;
}

/**
 * Unified auth hook for ChadWallet. Returns `{ ready, authenticated, solanaAddress, login, logout }`
 * whether or not a real `PrivyProvider` is mounted.
 *
 * `PLACEHOLDER_MODE` is derived once from `NEXT_PUBLIC_PRIVY_APP_ID` at module load
 * (inlined at build time by Next.js for `NEXT_PUBLIC_*` vars), so it never changes
 * across renders within a given build — `useAuth` always calls the same one of
 * `useFallbackAuth`/`useRealAuth` on every render, satisfying the rules of hooks.
 */
export function useAuth(): AuthState {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- PLACEHOLDER_MODE is a build-time constant, never changes across renders
  return PLACEHOLDER_MODE ? useFallbackAuth() : useRealAuth();
}
