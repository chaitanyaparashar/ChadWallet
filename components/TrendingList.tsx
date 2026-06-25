import Link from "next/link";
import type { Token } from "@/types";

function formatPrice(priceUsd: number): string {
  if (priceUsd >= 1) {
    return `$${priceUsd.toFixed(2)}`;
  }
  // Sub-dollar tokens need more precision to be meaningful.
  return `$${priceUsd.toFixed(6)}`;
}

function formatChange(change24h: number): string {
  const sign = change24h >= 0 ? "+" : "";
  return `${sign}${change24h.toFixed(2)}%`;
}

function TrendingListRow({ token, isActive }: { token: Token; isActive: boolean }) {
  const isUp = token.change24h >= 0;
  return (
    <Link
      href={`/trade/${token.mint}`}
      data-testid={`row-${token.mint}`}
      data-active={isActive ? "true" : "false"}
      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
        isActive ? "bg-border/60 text-foreground" : "text-muted hover:bg-border/30 hover:text-foreground"
      }`}
    >
      <span className="flex flex-col">
        <span className="font-medium text-foreground">{token.symbol}</span>
        <span className="text-xs cw-text-muted">{token.name}</span>
      </span>
      <span className="flex flex-col items-end">
        <span className="cw-num text-foreground">{formatPrice(token.priceUsd)}</span>
        <span className={`cw-num text-xs ${isUp ? "cw-text-up" : "cw-text-down"}`}>
          {formatChange(token.change24h)}
        </span>
      </span>
    </Link>
  );
}

/**
 * Left-column rail listing trending tokens. Each row links to its trade
 * page; the row matching `activeMint` is visually highlighted.
 */
export function TrendingList({ tokens, activeMint }: { tokens: Token[]; activeMint: string }) {
  return (
    <div data-testid="trending-list" className="cw-card flex flex-col gap-1 p-2">
      <h2 className="px-3 py-1 text-xs font-medium uppercase tracking-wide cw-text-muted">
        Trending
      </h2>
      {tokens.length === 0 ? (
        <p className="px-3 py-2 text-sm cw-text-muted">No trending tokens</p>
      ) : (
        tokens.map((token) => (
          <TrendingListRow key={token.mint} token={token} isActive={token.mint === activeMint} />
        ))
      )}
    </div>
  );
}
