import type { TokenOverview } from "@/types";

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

function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(
    value
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs cw-text-muted">{label}</span>
      <span className="cw-num text-sm text-foreground">{value}</span>
    </div>
  );
}

/**
 * Trade-page header: symbol/name, price, 24h change, market cap, and
 * volume for the active token. Renders a skeleton while loading and "—"
 * placeholders once loaded with no overview (e.g. unknown mint).
 */
export function TokenHeader({
  overview,
  loading,
}: {
  overview: TokenOverview | null;
  loading?: boolean;
}) {
  if (loading && !overview) {
    return (
      <div className="cw-card flex items-center gap-4 p-4">
        <div className="h-10 w-10 flex-none animate-pulse rounded-full bg-border" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-4 w-32 animate-pulse rounded bg-border" />
          <div className="h-3 w-48 animate-pulse rounded bg-border" />
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="cw-card flex items-center justify-between p-4">
        <span className="text-sm cw-text-muted">Token not found</span>
        <span className="cw-num text-sm cw-text-muted">—</span>
      </div>
    );
  }

  const isUp = overview.change24h >= 0;

  return (
    <div className="cw-card flex flex-wrap items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-border text-sm font-semibold text-foreground"
        >
          {overview.symbol.slice(0, 1)}
        </span>
        <div className="flex flex-col">
          <span className="text-base font-semibold text-foreground">{overview.symbol}</span>
          <span className="text-xs cw-text-muted">{overview.name}</span>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <span className="cw-num text-lg text-foreground">{formatPrice(overview.priceUsd)}</span>
        <span className={`cw-num text-sm ${isUp ? "cw-text-up" : "cw-text-down"}`}>
          {formatChange(overview.change24h)}
        </span>
      </div>

      <div className="flex gap-6">
        <Stat label="Market Cap" value={`$${formatCompact(overview.marketCap)}`} />
        <Stat label="24h Volume" value={`$${formatCompact(overview.volume24h)}`} />
      </div>
    </div>
  );
}
