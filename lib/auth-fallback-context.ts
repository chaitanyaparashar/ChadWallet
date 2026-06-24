import { createContext } from "react";

/**
 * Shape of the auth state exposed by `useAuth()`.
 * Mirrors the subset of the real Privy API that ChadWallet needs.
 */
export type AuthState = {
  ready: boolean;
  authenticated: boolean;
  solanaAddress: string | undefined;
  login: () => void;
  logout: () => void;
};

/**
 * Set by `PrivyProviderWrapper` only when running in placeholder mode
 * (no real `NEXT_PUBLIC_PRIVY_APP_ID`). When this context has a value,
 * `useAuth()` returns it directly instead of calling the real Privy hooks,
 * which would otherwise throw without a valid app id.
 */
export const AuthFallbackContext = createContext<AuthState | null>(null);
