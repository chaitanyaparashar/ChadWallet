import Link from "next/link";
import Image from "next/image";

const DEFAULT_MINT = "So11111111111111111111111111111111111111112";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";

/**
 * fomo-style hero: a giant lowercase wordmark over a drifting starfield and an
 * ambient green glow, with two CTAs and a floating Chad mark.
 *
 * `launchMint` is the token the "Start trading" CTA opens; the landing page
 * passes the top trending token, falling back to SOL.
 */
export function Hero({ launchMint }: { launchMint?: string }) {
  const launchHref = `/trade/${launchMint ?? DEFAULT_MINT}`;

  return (
    <section className="relative isolate flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Drifting starfield + ambient glow (both pure CSS, always in motion). */}
      <div aria-hidden className="cw-stars -z-10 opacity-80" />
      <div
        aria-hidden
        className="cw-glow pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-accent/15 blur-[150px]"
      />

      <h1
        className="cw-display text-foreground"
        style={{ fontSize: "clamp(2.75rem, 9vw, 7.5rem)" }}
      >
        chad<span className="text-accent">wallet</span>
      </h1>

      <p
        className="cw-display mt-3 text-foreground"
        style={{ fontSize: "clamp(1.5rem, 3.6vw, 3rem)" }}
      >
        where chads become legends.
      </p>

      <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
        From memecoins to viral tokens, trade any Solana token in seconds.
      </p>

      <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
        <Link href={launchHref} className="cw-btn cw-btn-primary">
          Start trading
        </Link>
        <a
          href={GOOGLE_PLAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="cw-btn cw-btn-secondary"
        >
          Download app
        </a>
      </div>

      <Image
        src="/logo/chad.png"
        alt=""
        aria-hidden
        width={150}
        height={150}
        className="cw-float pointer-events-none mt-14 opacity-90 drop-shadow-[0_0_40px_rgba(22,199,132,0.25)]"
      />
    </section>
  );
}
