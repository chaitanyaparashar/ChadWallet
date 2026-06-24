"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import type { Token } from "@/types";

const POLL_INTERVAL_MS = 15000;

/**
 * Fetches `/api/trending` on mount and re-polls every 15s.
 * Cancels the interval and ignores in-flight responses after unmount.
 */
export function useTrending(): { tokens: Token[]; degraded: boolean; loading: boolean } {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [degraded, setDegraded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const result = await apiGet<Token[]>("/api/trending");
        if (!mounted) return;
        setTokens(result.data);
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
  }, []);

  return { tokens, degraded, loading };
}
