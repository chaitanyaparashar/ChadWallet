"use client";

import { useParams } from "next/navigation";
import { TrendingList } from "@/components/TrendingList";
import { TokenHeader } from "@/components/TokenHeader";
import { PriceChart } from "@/components/PriceChart";
import { TradeTabs } from "@/components/TradeTabs";
import { DemoDataPill } from "@/components/DemoDataPill";
import { useTrending } from "@/lib/hooks/useTrending";
import { useToken } from "@/lib/hooks/useToken";

export default function TradePage() {
  const { mint } = useParams<{ mint: string }>();
  const { tokens, degraded: trendingDegraded } = useTrending();
  const { overview, candles, holders, trades, degraded: tokenDegraded, loading } = useToken(mint);

  const degraded = trendingDegraded || tokenDegraded;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 p-4">
      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_320px]">
        {/* LEFT: trending rail */}
        <TrendingList tokens={tokens} activeMint={mint} />

        {/* MIDDLE: token header + chart/holders/trades (Task 12 slots in below) */}
        <div className="flex flex-col gap-4">
          <TokenHeader overview={overview} loading={loading} />

          <PriceChart candles={candles} />
          <TradeTabs holders={holders} trades={trades} />
        </div>

        {/* RIGHT: trade panel + position (Task 13 slots in here) */}
        <div data-testid="trade-panel" className="cw-card flex flex-col gap-2 p-4 text-sm cw-text-muted">
          <p>Trade panel</p>
          <p className="text-xs">(Task 13: buy/sell panel + position)</p>
        </div>
      </div>

      {degraded && <DemoDataPill />}
    </div>
  );
}
