"use client";

import { useState } from "react";
import type { TokenOverview } from "@/types";
import { truncateAddress } from "@/lib/format";

function TokenLogo({ overview }: { overview: TokenOverview }) {
  if (overview.logoURI) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={overview.logoURI} alt="" className="h-9 w-9 rounded-full bg-border object-cover" />;
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-border text-sm font-semibold text-foreground">
      {overview.symbol.slice(0, 1)}
    </span>
  );
}

/**
 * Compact fomo-style token identity row: logo, symbol/name, copyable mint
 * address, and social glyphs. Numeric stats live in the StatPills strip.
 */
export function TokenHeader({
  overview,
  loading,
}: {
  overview: TokenOverview | null;
  loading?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  if (loading && !overview) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-border" />
        <div className="h-4 w-40 animate-pulse rounded bg-border" />
      </div>
    );
  }
  if (!overview) {
    return <span className="text-sm cw-text-muted">Token not found</span>;
  }

  function copy() {
    navigator.clipboard?.writeText(overview!.mint);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <TokenLogo overview={overview} />
      <div className="flex flex-col">
        <span className="text-base font-semibold leading-tight text-foreground">{overview.symbol}</span>
        <span className="text-xs cw-text-muted">{overview.name}</span>
      </div>

      <button
        type="button"
        onClick={copy}
        className="cw-num flex items-center gap-1.5 rounded-md border border-border bg-panel px-2 py-1 text-xs cw-text-muted transition-colors hover:text-foreground"
        title="Copy mint address"
      >
        {truncateAddress(overview.mint)}
        <span className="text-[10px]">{copied ? "✓" : "⧉"}</span>
      </button>

      <div className="flex items-center gap-1.5 text-sm cw-text-muted">
        <a
          href={`https://x.com/search?q=${overview.symbol}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-panel hover:text-foreground"
        >
          𝕏
        </a>
        <a
          href={`https://solscan.io/token/${overview.mint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-panel hover:text-foreground"
        >
          ⌕
        </a>
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-panel">
          ☆
        </span>
      </div>
    </div>
  );
}
