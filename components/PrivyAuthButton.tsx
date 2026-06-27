"use client";

import { useAuth } from "@/lib/hooks/useAuth";

function truncateAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Sign-in / account button. Shows the Google login option when signed out,
 * or the truncated Solana wallet address + a disconnect action when signed in.
 */
export function PrivyAuthButton() {
  const { ready, authenticated, solanaAddress, login, logout } = useAuth();

  if (!ready) {
    return (
      <div className="h-10 w-32 animate-pulse rounded-full bg-panel" />
    );
  }

  if (authenticated) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-border bg-panel px-4 py-2 text-sm text-foreground">
        <span className="font-mono">
          {solanaAddress ? truncateAddress(solanaAddress) : "Connected"}
        </span>
        <button
          type="button"
          onClick={logout}
          className="cw-text-muted transition-colors hover:text-foreground"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => login({ loginMethods: ["google"] })}
      className="rounded-full border border-border bg-panel px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-border"
    >
      Continue with Google
    </button>
  );
}
