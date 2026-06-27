"use client";

import { useParams } from "next/navigation";
import { TrendingList } from "@/components/TrendingList";
import { TokenHeader } from "@/components/TokenHeader";
import { PriceChart } from "@/components/PriceChart";
import { TradeTabs } from "@/components/TradeTabs";
import { TradePanel } from "@/components/TradePanel";
import { PositionCard } from "@/components/PositionCard";
import { DemoDataPill } from "@/components/DemoDataPill";
import { useTrending } from "@/lib/hooks/useTrending";
import { useToken } from "@/lib/hooks/useToken";
import { BrandMark } from "@/components/BrandMark";
import { PrivyAuthButton } from "@/components/PrivyAuthButton";

export default function TradePage() {
  const { mint } = useParams<{ mint: string }>();
  const { tokens, degraded: trendingDegraded } = useTrending();
  const { overview, candles, holders, trades, degraded: tokenDegraded, loading } = useToken(mint);

  const degraded = trendingDegraded || tokenDegraded;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 p-4">
      <header className="flex items-center justify-between border-b border-border pb-3">
        <BrandMark size={32} href="/" />
        <PrivyAuthButton />
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_320px]">
        {/* LEFT: trending rail */}
        <TrendingList tokens={tokens} activeMint={mint} />

        {/* MIDDLE: token header + chart/holders/trades (Task 12 slots in below) */}
        <div className="flex flex-col gap-4">
          <TokenHeader overview={overview} loading={loading} />

          <PriceChart candles={candles} />
          <TradeTabs holders={holders} trades={trades} />
        </div>

        {/* RIGHT: trade panel + position */}
        <div className="flex flex-col gap-4">
          <TradePanel mint={mint} overview={overview} />
          <PositionCard mint={mint} priceUsd={overview?.priceUsd ?? 0} />
        </div>
      </div>

      {degraded && <DemoDataPill />}
    </div>
  );
}
