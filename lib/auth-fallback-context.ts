import { createContext } from "react";

/** Login providers ChadWallet offers as distinct entry points. */
export type LoginMethod = "google" | "apple";

/** Options forwarded to Privy's `login()` in real mode (ignored in placeholder mode). */
export type LoginOptions = {
  loginMethods?: LoginMethod[];
};

/**
 * Shape of the auth state exposed by `useAuth()`.
 * Mirrors the subset of the real Privy API that ChadWallet needs.
 */
export type AuthState = {
  ready: boolean;
  authenticated: boolean;
  solanaAddress: string | undefined;
  login: (options?: LoginOptions) => void;
  logout: () => void;
};

/**
 * Set by `PrivyProviderWrapper` only when running in placeholder mode
 * (no real `NEXT_PUBLIC_PRIVY_APP_ID`). When this context has a value,
 * `useAuth()` returns it directly instead of calling the real Privy hooks,
 * which would otherwise throw without a valid app id.
 */
export const AuthFallbackContext = createContext<AuthState | null>(null);
