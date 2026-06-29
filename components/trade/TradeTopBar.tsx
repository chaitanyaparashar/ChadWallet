"use client";

import { BrandMark } from "@/components/BrandMark";
import { PrivyAuthButton } from "@/components/PrivyAuthButton";
import { usePosition } from "@/lib/hooks/usePosition";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatUsd } from "@/lib/format";

/**
 * fomo-style trading top bar: brand, a wide search field, and the user's
 * cash balance pills on the right. Search is presentational (the assignment
 * doesn't require a working token search) but matches fomo's layout.
 */
export function TradeTopBar({ mint, priceUsd }: { mint: string; priceUsd: number }) {
  const { authenticated, solanaAddress } = useAuth();
  const { position } = usePosition(authenticated ? solanaAddress : undefined, mint, priceUsd);
  const sol = position?.sol ?? 0;
  const cashUsd = position?.tokenValueUsd ?? 0;

  return (
    <header className="flex items-center gap-4 border-b border-border px-4 py-2.5">
      <BrandMark size={28} href="/" />

      <div className="relative mx-auto hidden w-full max-w-xl md:block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">⌕</span>
        <input
          type="text"
          placeholder="Search for tokens or traders…"
          className="w-full rounded-lg border border-border bg-panel py-2 pl-9 pr-16 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent/60"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-border px-2 py-0.5 text-xs text-muted">
          /
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden rounded-lg border border-border bg-panel px-3 py-1.5 text-right sm:block">
          <div className="cw-num text-sm font-medium text-foreground">{formatUsd(sol)} SOL</div>
          <div className="text-[11px] text-accent">Deposit more</div>
        </div>
        <div className="hidden rounded-lg border border-border bg-panel px-3 py-1.5 text-right lg:block">
          <div className="cw-num text-sm font-medium text-foreground">{formatUsd(cashUsd)}</div>
          <div className="text-[11px] text-muted">holdings</div>
        </div>
        <PrivyAuthButton />
      </div>
    </header>
  );
}
