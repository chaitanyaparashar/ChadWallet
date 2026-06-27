"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import type { Position } from "@/types";

const POLL_INTERVAL_MS = 15000;

export interface UsePositionResult {
  position: Position | null;
  loading: boolean;
  degraded: boolean;
}

/**
 * Fetches `/api/balance?address=&mint=&price=` on mount and re-polls every 15s.
 * Skips fetching entirely (and returns a null position) when `address` is
 * undefined — there's nothing to look up before a wallet is connected.
 * Cancels the interval and ignores in-flight responses after unmount.
 */
export function usePosition(
  address: string | undefined,
  mint: string,
  priceUsd: number
): UsePositionResult {
  const [fetchedPosition, setFetchedPosition] = useState<Position | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      return;
    }

    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const result = await apiGet<Position>(
          `/api/balance?address=${encodeURIComponent(address!)}&mint=${encodeURIComponent(
            mint
          )}&price=${priceUsd}`
        );
        if (!mounted) return;
        setFetchedPosition(result.data);
        setDegraded(result.degraded);
      } catch {
        if (!mounted) return;
        setDegraded(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    const id = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [address, mint, priceUsd]);

  // No address means no wallet connected — ignore any stale fetched
  // position from before rather than resetting state inside the effect.
  const position = address ? fetchedPosition : null;

  return { position, loading: address ? loading : false, degraded: address ? degraded : false };
}
