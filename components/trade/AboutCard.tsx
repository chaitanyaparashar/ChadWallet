import type { Candle, Trade, TokenOverview } from "@/types";
import { formatChange, formatCompactUsd, formatCompact } from "@/lib/format";

/** % change over the last `barsAgo` 1H candles. */
function changeOver(candles: Candle[], barsAgo: number): number | null {
  if (candles.length < barsAgo + 1) return null;
  const last = candles[candles.length - 1].close;
  const prev = candles[candles.length - 1 - barsAgo].close;
  if (!prev) return null;
  return ((last - prev) / prev) * 100;
}

function TimeframeChip({ label, change }: { label: string; change: number | null }) {
  const up = (change ?? 0) >= 0;
  return (
    <div className="flex flex-1 flex-col items-center rounded-lg border border-border bg-background py-2">
      <span className="text-[11px] cw-text-muted">{label}</span>
      <span className={`cw-num text-xs font-medium ${up ? "cw-text-up" : "cw-text-down"}`}>
        {change === null ? "—" : formatChange(change)}
      </span>
    </div>
  );
}

function SplitBar({
  leftLabel,
  rightLabel,
  left,
  right,
}: {
  leftLabel: string;
  rightLabel: string;
  left: number;
  right: number;
}) {
  const total = left + right;
  const leftPct = total > 0 ? (left / total) * 100 : 50;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="cw-num cw-text-up">{leftLabel}</span>
        <span className="cw-num cw-text-down">{rightLabel}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-danger">
        <div className="h-full rounded-l-full bg-accent" style={{ width: `${leftPct}%` }} />
      </div>
    </div>
  );
}

/**
 * fomo-style "About" card: a row of timeframe % chips computed from the OHLCV
 * candles, plus buy/sell, volume, and buyer/seller split bars computed from
 * the recent trades feed.
 */
export function AboutCard({
  overview,
  trades,
  candles,
}: {
  overview: TokenOverview | null;
  trades: Trade[];
  candles: Candle[];
}) {
  const buys = trades.filter((t) => t.side === "buy");
  const sells = trades.filter((t) => t.side === "sell");
  const buyVol = buys.reduce((s, t) => s + t.amountUsd, 0);
  const sellVol = sells.reduce((s, t) => s + t.amountUsd, 0);
  const buyers = new Set(buys.map((t) => t.owner)).size;
  const sellers = new Set(sells.map((t) => t.owner)).size;

  return (
    <div className="cw-card flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          About {overview?.symbol ?? ""}
        </span>
        <span className="text-xs cw-text-muted">{overview?.name ?? ""}</span>
      </div>

      <div className="flex gap-1.5">
        <TimeframeChip label="1H" change={changeOver(candles, 1)} />
        <TimeframeChip label="4H" change={changeOver(candles, 4)} />
        <TimeframeChip label="24H" change={overview ? overview.change24h : changeOver(candles, 24)} />
        <TimeframeChip label="7D" change={changeOver(candles, 167)} />
      </div>

      <div className="flex flex-col gap-3">
        <SplitBar
          leftLabel={`${formatCompact(buys.length)} buys`}
          rightLabel={`${formatCompact(sells.length)} sells`}
          left={buys.length}
          right={sells.length}
        />
        <SplitBar
          leftLabel={`${formatCompactUsd(buyVol)} vol`}
          rightLabel={`${formatCompactUsd(sellVol)} vol`}
          left={buyVol}
          right={sellVol}
        />
        <SplitBar
          leftLabel={`${formatCompact(buyers)} buyers`}
          rightLabel={`${formatCompact(sellers)} sellers`}
          left={buyers}
          right={sellers}
        />
      </div>
    </div>
  );
}
