import Link from "next/link";
import type { Token } from "@/types";
import { formatPrice, formatChange } from "@/lib/format";

function TokenIcon({ token }: { token: Token }) {
  if (token.logoURI) {
    // External CDN logos — plain img avoids next/image remote-domain config.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={token.logoURI}
        alt=""
        className="h-8 w-8 flex-none rounded-full bg-border object-cover"
      />
    );
  }
  return (
    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-border text-xs font-semibold text-foreground">
      {token.symbol.slice(0, 1)}
    </span>
  );
}

function TrendingListRow({ token, isActive }: { token: Token; isActive: boolean }) {
  const isUp = token.change24h >= 0;
  return (
    <Link
      href={`/trade/${token.mint}`}
      data-testid={`row-${token.mint}`}
      data-active={isActive ? "true" : "false"}
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${
        isActive ? "bg-panel" : "hover:bg-panel/60"
      }`}
    >
      <TokenIcon token={token} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{token.symbol}</span>
        <span className="cw-num truncate text-xs cw-text-muted">{formatPrice(token.priceUsd)}</span>
      </span>
      <span className={`cw-num text-xs font-medium ${isUp ? "cw-text-up" : "cw-text-down"}`}>
        {formatChange(token.change24h)}
      </span>
    </Link>
  );
}

const FILTERS = ["Watchlist", "Crypto", "Trending", "Most held"];

/**
 * Left-column rail listing trending tokens, fomo-style: section tabs, filter
 * chips (Trending active), then token rows linking to their trade pages.
 */
export function TrendingList({ tokens, activeMint }: { tokens: Token[]; activeMint: string }) {
  return (
    <div data-testid="trending-list" className="flex min-h-0 flex-col border-r border-border">
      <div className="flex items-center gap-4 border-b border-border px-3 py-2.5 text-sm">
        <span className="cw-text-muted">Alerts</span>
        <span className="font-semibold text-foreground">Tokens</span>
        <span className="cw-text-muted">Leaderboard</span>
      </div>

      <div className="flex flex-wrap gap-1.5 px-3 py-2.5">
        {FILTERS.map((f) => (
          <span
            key={f}
            className={`rounded-full px-2.5 py-1 text-xs ${
              f === "Trending"
                ? "bg-accent/15 font-medium text-accent"
                : "cw-text-muted hover:text-foreground"
            }`}
          >
            {f}
          </span>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1.5 pb-2">
        {tokens.length === 0 ? (
          <p className="px-3 py-2 text-sm cw-text-muted">No trending tokens</p>
        ) : (
          tokens.map((token) => (
            <TrendingListRow key={token.mint} token={token} isActive={token.mint === activeMint} />
          ))
        )}
      </div>
    </div>
  );
}
