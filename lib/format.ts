/** Shared number/address formatters for the trading UI. */

export function formatPrice(priceUsd: number): string {
  if (priceUsd >= 1) return `$${priceUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (priceUsd >= 0.01) return `$${priceUsd.toFixed(4)}`;
  if (priceUsd > 0) return `$${priceUsd.toPrecision(4)}`;
  return "$0";
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

/** Compact USD: 339800 → "$339.8K". */
export function formatCompactUsd(value: number): string {
  return `$${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value)}`;
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value);
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function formatRelativeTime(timestampSeconds: number, nowMs: number): string {
  const delta = Math.max(0, Math.floor(nowMs / 1000 - timestampSeconds));
  if (delta < 60) return `${delta}s`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h`;
  return `${Math.floor(delta / 86400)}d`;
}
