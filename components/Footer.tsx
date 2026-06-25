import Link from "next/link";
import { StoreButtons } from "@/components/StoreButtons";

/**
 * Closing strip: wordmark, minimal nav, store links, copyright.
 * Deliberately quiet — the banners and hero already did the selling.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-6 py-12 lg:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Chad<span className="text-accent">Wallet</span>
            </span>
            <p className="max-w-xs text-sm text-muted">
              The fastest way to trade Solana memecoins. Self-custodial.
              No seed phrase required.
            </p>
          </div>

          <nav aria-label="Footer" className="flex gap-6 text-sm text-muted">
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </a>
          </nav>

          <StoreButtons />
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {year} ChadWallet. All rights reserved.</span>
          <span>Not financial advice. Trade responsibly.</span>
        </div>
      </div>
    </footer>
  );
}
