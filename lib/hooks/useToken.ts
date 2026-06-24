"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import type { Candle, Holder, TokenOverview, Trade } from "@/types";

const REFRESH_INTERVAL_MS = 10000;

export interface UseTokenResult {
  overview: TokenOverview | null;
  candles: Candle[];
  holders: Holder[];
  trades: Trade[];
  degraded: boolean;
  loading: boolean;
}

/**
 * Fetches the four per-token endpoints (overview, ohlcv, holders, trades) in
 * parallel on mount and whenever `mint` changes. Overview + trades re-poll
 * every 10s; candles/holders are refreshed on the same tick (cheap and keeps
 * the hook simple — no need for independent intervals here).
 *
 * `degraded` is true if any of the four responses came back degraded.
 */
export function useToken(mint: string): UseTokenResult {
  const [overview, setOverview] = useState<TokenOverview | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [degraded, setDegraded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let firstRun = true;

    async function load() {
      // Reset state on the first run for a new mint so stale data from a
      // previous token doesn't linger while the new fetch is in flight.
      if (firstRun) {
        firstRun = false;
        setOverview(null);
        setCandles([]);
        setHolders([]);
        setTrades([]);
        setDegraded(false);
        setLoading(true);
      }
      try {
        const [overviewRes, candlesRes, holdersRes, tradesRes] = await Promise.all([
          apiGet<TokenOverview>(`/api/token/${mint}`),
          apiGet<Candle[]>(`/api/token/${mint}/ohlcv?interval=1H`),
          apiGet<Holder[]>(`/api/token/${mint}/holders`),
          apiGet<Trade[]>(`/api/token/${mint}/trades`),
        ]);
        if (!mounted) return;
        setOverview(overviewRes.data);
        setCandles(candlesRes.data);
        setHolders(holdersRes.data);
        setTrades(tradesRes.data);
        setDegraded(
          overviewRes.degraded || candlesRes.degraded || holdersRes.degraded || tradesRes.degraded
        );
      } catch {
        if (!mounted) return;
        setDegraded(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    const id = setInterval(load, REFRESH_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [mint]);

  return { overview, candles, holders, trades, degraded, loading };
}
