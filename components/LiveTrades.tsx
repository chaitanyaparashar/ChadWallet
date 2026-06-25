"use client";

import { useEffect, useState } from "react";
import type { Trade } from "@/types";

function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function formatUsd(amountUsd: number): string {
  return `$${amountUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function formatTokenAmount(tokenAmount: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(
    tokenAmount
  );
}

function formatPrice(priceUsd: number): string {
  if (priceUsd >= 1) return `$${priceUsd.toFixed(2)}`;
  return `$${priceUsd.toFixed(6)}`;
}

function formatRelativeTime(timestampSeconds: number, nowMs: number): string {
  const deltaSeconds = Math.max(0, Math.floor(nowMs / 1000 - timestampSeconds));
  if (deltaSeconds < 60) return `${deltaSeconds}s ago`;
  const deltaMinutes = Math.floor(deltaSeconds / 60);
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`;
  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) return `${deltaHours}h ago`;
  const deltaDays = Math.floor(deltaHours / 24);
  return `${deltaDays}d ago`;
}

/**
 * Recent-trades feed for the trade page's "Live Trades" tab. `trades` is
 * re-fetched on a poll by `useToken`; this component re-renders every
 * second purely to keep the "Ns ago" labels fresh between polls.
 */
export function LiveTrades({ trades }: { trades: Trade[] }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (trades.length === 0) {
    return <p className="p-4 text-sm cw-text-muted">No recent trades</p>;
  }

  return (
    <table className="cw-table">
      <thead>
        <tr>
          <th>Side</th>
          <th>Amount</th>
          <th>Tokens</th>
          <th>Price</th>
          <th>Owner</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {trades.map((trade) => {
          const isBuy = trade.side === "buy";
          return (
            <tr key={trade.txHash}>
              <td className={`cw-num font-medium ${isBuy ? "cw-text-up" : "cw-text-down"}`}>
                {isBuy ? "BUY" : "SELL"}
              </td>
              <td className="cw-num text-foreground">{formatUsd(trade.amountUsd)}</td>
              <td className="cw-num text-foreground">{formatTokenAmount(trade.tokenAmount)}</td>
              <td className="cw-num text-muted">{formatPrice(trade.priceUsd)}</td>
              <td className="cw-num text-muted">{truncateAddress(trade.owner)}</td>
              <td className="cw-num text-muted">{formatRelativeTime(trade.timestamp, now)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
