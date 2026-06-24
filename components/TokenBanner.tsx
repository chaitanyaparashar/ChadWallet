import Link from "next/link";
import type { Token } from "@/types";

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

function TokenBannerItem({ token }: { token: Token }) {
  const isUp = token.change24h >= 0;
  return (
    <Link
      href={`/trade/${token.mint}`}
      className="flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap"
    >
      <span className="font-medium text-foreground">{token.symbol}</span>
      <span className="cw-num cw-text-muted">{formatPrice(token.priceUsd)}</span>
      <span className={`cw-num ${isUp ? "cw-text-up" : "cw-text-down"}`}>
        {formatChange(token.change24h)}
      </span>
    </Link>
  );
}

/**
 * Rotating marquee of tokens used at the top/bottom of the landing page.
 * The track renders the token list twice so the CSS translateX animation
 * can loop seamlessly: when the first copy scrolls fully offscreen, the
 * second copy is exactly in its place.
 */
export function TokenBanner({
  tokens,
  direction,
}: {
  tokens: Token[];
  direction: "left" | "right";
}) {
  if (tokens.length === 0) {
    return <div className="cw-marquee-container" />;
  }

  const animationName = direction === "left" ? "marquee-left" : "marquee-right";

  return (
    <div className="cw-marquee-container">
      <div
        className="cw-marquee-track"
        style={{ animationName, animationDuration: `${tokens.length * 4}s` }}
      >
        {tokens.map((token) => (
          <TokenBannerItem key={`a-${token.mint}`} token={token} />
        ))}
        {tokens.map((token) => (
          <TokenBannerItem key={`b-${token.mint}`} token={token} />
        ))}
      </div>
    </div>
  );
}
