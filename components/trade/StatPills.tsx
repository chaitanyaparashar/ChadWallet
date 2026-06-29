import type { TokenOverview } from "@/types";
import { formatPrice, formatChange, formatCompactUsd, formatCompact } from "@/lib/format";

function Pill({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  const toneClass = tone === "up" ? "cw-text-up" : tone === "down" ? "cw-text-down" : "text-foreground";
  return (
    <div className="flex min-w-[92px] flex-col rounded-lg border border-border bg-panel px-3 py-2">
      <span className="text-[11px] uppercase tracking-wide cw-text-muted">{label}</span>
      <span className={`cw-num text-sm font-medium ${toneClass}`}>{value}</span>
    </div>
  );
}

/**
 * fomo-style stat strip under the token header: market cap, price, 24h
 * change, volume, liquidity, holders — each in its own bordered cell.
 */
export function StatPills({
  overview,
  holdersCount,
}: {
  overview: TokenOverview | null;
  holdersCount: number;
}) {
  if (!overview) return null;
  const up = overview.change24h >= 0;

  return (
    <div className="flex flex-wrap gap-2">
      <Pill label="Market cap" value={formatCompactUsd(overview.marketCap)} />
      <Pill label="Price" value={formatPrice(overview.priceUsd)} />
      <Pill label="24H change" value={formatChange(overview.change24h)} tone={up ? "up" : "down"} />
      <Pill label="24H Vol" value={formatCompactUsd(overview.volume24h)} />
      <Pill label="Liquidity" value={formatCompactUsd(overview.liquidity)} />
      <Pill label="Holders" value={formatCompact(holdersCount)} />
    </div>
  );
}
