"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { usePosition } from "@/lib/hooks/usePosition";

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(
    amount
  );
}

function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Shows the connected wallet's SOL balance and its holdings of the active
 * token (amount + USD value), polled via `usePosition`. Renders a
 * "Connect to see your position" prompt when no wallet is connected.
 */
export function PositionCard({ mint, priceUsd }: { mint: string; priceUsd: number }) {
  const { authenticated, solanaAddress } = useAuth();
  const { position, loading } = usePosition(
    authenticated ? solanaAddress : undefined,
    mint,
    priceUsd
  );

  if (!authenticated) {
    return (
      <div data-testid="position-card" className="cw-card flex flex-col gap-3 p-4 text-sm">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-foreground">Your positions</p>
          <span className="rounded-md bg-panel px-2 py-0.5 text-xs cw-text-muted">Open</span>
        </div>
        <p className="cw-text-muted">Connect to see your position</p>
      </div>
    );
  }

  return (
    <div data-testid="position-card" className="cw-card flex flex-col gap-3 p-4 text-sm">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-foreground">Your positions</p>
        <div className="flex gap-1 rounded-md border border-border p-0.5 text-xs">
          <span className="rounded bg-accent/15 px-2 py-0.5 font-medium text-accent">Open</span>
          <span className="px-2 py-0.5 cw-text-muted">Closed</span>
        </div>
      </div>

      {loading && !position ? (
        <div className="flex flex-col gap-2">
          <div className="h-4 w-24 animate-pulse rounded bg-border" />
          <div className="h-4 w-32 animate-pulse rounded bg-border" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="cw-text-muted">SOL balance</span>
            <span className="cw-num text-foreground">{formatAmount(position?.sol ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="cw-text-muted">Token amount</span>
            <span className="cw-num text-foreground">{formatAmount(position?.tokenAmount ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="cw-text-muted">Value</span>
            <span className="cw-num text-foreground">{formatUsd(position?.tokenValueUsd ?? 0)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
