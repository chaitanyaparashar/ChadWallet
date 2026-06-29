"use client";

import { useParams } from "next/navigation";
import { TrendingList } from "@/components/TrendingList";
import { TokenHeader } from "@/components/TokenHeader";
import { PriceChart } from "@/components/PriceChart";
import { TradeTabs } from "@/components/TradeTabs";
import { TradePanel } from "@/components/TradePanel";
import { PositionCard } from "@/components/PositionCard";
import { DemoDataPill } from "@/components/DemoDataPill";
import { TradeTopBar } from "@/components/trade/TradeTopBar";
import { StatPills } from "@/components/trade/StatPills";
import { AboutCard } from "@/components/trade/AboutCard";
import { useTrending } from "@/lib/hooks/useTrending";
import { useToken } from "@/lib/hooks/useToken";
import { formatPrice, formatChange } from "@/lib/format";

const CHART_RANGES = ["1D", "1W", "1M", "3M", "1Y"];

function ChartToolbar({
  symbol,
  candles,
}: {
  symbol: string;
  candles: { open: number; high: number; low: number; close: number }[];
}) {
  const last = candles[candles.length - 1];
  const change = last && last.open ? ((last.close - last.open) / last.open) * 100 : 0;
  const up = change >= 0;

  return (
    <div className="flex flex-col gap-2 border-b border-border px-3 py-2">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md border border-border bg-background px-2 py-1 font-medium text-foreground">
          1m
        </span>
        <span className="cw-text-muted">Indicators</span>
        <div className="ml-auto flex items-center gap-1 rounded-md border border-border p-0.5">
          <span className="rounded bg-accent/15 px-2 py-0.5 font-medium text-accent">Price</span>
          <span className="px-2 py-0.5 cw-text-muted">MCap</span>
        </div>
      </div>
      {last && (
        <div className="cw-num flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="font-medium text-foreground">{symbol} · 1m</span>
          <span className="cw-text-muted">O {formatPrice(last.open)}</span>
          <span className="cw-text-muted">H {formatPrice(last.high)}</span>
          <span className="cw-text-muted">L {formatPrice(last.low)}</span>
          <span className="cw-text-muted">C {formatPrice(last.close)}</span>
          <span className={up ? "cw-text-up" : "cw-text-down"}>{formatChange(change)}</span>
        </div>
      )}
    </div>
  );
}

export default function TradePage() {
  const { mint } = useParams<{ mint: string }>();
  const { tokens, degraded: trendingDegraded } = useTrending();
  const { overview, candles, holders, trades, degraded: tokenDegraded, loading } = useToken(mint);

  const degraded = trendingDegraded || tokenDegraded;
  const priceUsd = overview?.priceUsd ?? 0;
  const symbol = overview?.symbol ?? "TOKEN";

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TradeTopBar mint={mint} priceUsd={priceUsd} />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_1fr_344px]">
        {/* LEFT: trending rail */}
        <div className="hidden min-h-0 lg:block">
          <TrendingList tokens={tokens} activeMint={mint} />
        </div>

        {/* MIDDLE: header, stats, chart, holders/swaps */}
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto p-3">
          <TokenHeader overview={overview} loading={loading} />
          <StatPills overview={overview} holdersCount={holders.length} />

          <div className="cw-card shrink-0 overflow-hidden">
            <ChartToolbar symbol={symbol} candles={candles} />
            <PriceChart candles={candles} />
            <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs">
              <div className="flex gap-1">
                {CHART_RANGES.map((r, i) => (
                  <span
                    key={r}
                    className={`rounded px-2 py-1 ${
                      i === 0 ? "bg-panel font-medium text-foreground" : "cw-text-muted"
                    }`}
                  >
                    {r}
                  </span>
                ))}
              </div>
              <div className="flex gap-1 cw-text-muted">
                <span className="rounded px-2 py-1">%</span>
                <span className="rounded px-2 py-1">log</span>
                <span className="rounded bg-panel px-2 py-1 text-foreground">auto</span>
              </div>
            </div>
          </div>

          <TradeTabs holders={holders} trades={trades} />
        </div>

        {/* RIGHT: trade panel, about, positions */}
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto border-l border-border p-3">
          <TradePanel mint={mint} overview={overview} />
          <AboutCard overview={overview} trades={trades} candles={candles} />
          <PositionCard mint={mint} priceUsd={priceUsd} />
        </div>
      </div>

      {degraded && <DemoDataPill />}
    </div>
  );
}
