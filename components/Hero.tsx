import Link from "next/link";
import { PrivyAuthButton } from "@/components/PrivyAuthButton";
import { StoreButtons } from "@/components/StoreButtons";
import { BrandMark } from "@/components/BrandMark";

const DEFAULT_MINT = "So11111111111111111111111111111111111111112";

/**
 * Top-of-page statement: brand, headline, CTAs. Designed to read as the
 * single most confident thing on the page — large type, one accent color,
 * minimal chrome.
 *
 * `launchMint` is the token the "Launch app" CTA opens in the trading view —
 * the landing page passes the top trending token; falls back to SOL.
 */
export function Hero({ launchMint }: { launchMint?: string }) {
  const launchHref = `/trade/${launchMint ?? DEFAULT_MINT}`;
  return (
    <section className="relative isolate overflow-hidden px-6 py-20 sm:py-28 lg:px-12">
      {/* Ambient glow — kept subtle, not a full hero image since we have none. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[36rem] w-[60rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/20 blur-[120px]"
      />

      <div className="mx-auto flex max-w-5xl flex-col items-start gap-8">
        <BrandMark size={44} />

        <span className="cw-num rounded-full border border-border bg-panel px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent">
          Built on Solana
        </span>

        <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Trade memecoins like a{" "}
          <span className="bg-gradient-to-r from-accent to-emerald-300 bg-clip-text text-transparent">
            Chad
          </span>
          .
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
          ChadWallet is the fastest way onto Solana. Sign in with Google,
          skip the seed phrase, and start trading any token in seconds —
          with live prices, real charts, and zero gatekeeping.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href={launchHref}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Launch app →
          </Link>
          <PrivyAuthButton />
          <StoreButtons />
        </div>

        <p className="cw-num text-xs uppercase tracking-wide text-muted">
          No seed phrases. No custody headaches. Just trade.
        </p>
      </div>
    </section>
  );
}
