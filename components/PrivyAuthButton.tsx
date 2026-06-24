"use client";

import { useAuth } from "@/lib/hooks/useAuth";

function truncateAddress(address: string): string {
  if (address.length <= 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Sign-in / account button. Shows Apple + Google login options when signed out,
 * or the truncated Solana wallet address + a disconnect action when signed in.
 */
export function PrivyAuthButton() {
  const { ready, authenticated, solanaAddress, login, logout } = useAuth();

  if (!ready) {
    return (
      <div className="h-10 w-32 animate-pulse rounded-full bg-zinc-800" />
    );
  }

  if (authenticated) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-100">
        <span className="font-mono">
          {solanaAddress ? truncateAddress(solanaAddress) : "Connected"}
        </span>
        <button
          type="button"
          onClick={logout}
          className="text-zinc-400 transition-colors hover:text-zinc-100"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={login}
        className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
      >
        Continue with Apple
      </button>
      <button
        type="button"
        onClick={login}
        className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800"
      >
        Continue with Google
      </button>
    </div>
  );
}
