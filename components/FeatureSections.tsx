interface Feature {
  title: string;
  description: string;
  glyph: string;
}

const FEATURES: Feature[] = [
  {
    glyph: "01",
    title: "No seed phrases, ever",
    description:
      "Sign in with Google and get a self-custodial embedded wallet instantly. No 12 words to lose, no browser extension to install.",
  },
  {
    glyph: "02",
    title: "Trade any Solana token",
    description:
      "Jump from a trending banner straight into a swap. Every token on Solana is one tap away — no manual contract pasting.",
  },
  {
    glyph: "03",
    title: "Live prices & charts",
    description:
      "Real-time price feeds, candlestick charts, holder breakdowns, and live trade flow — the same signal the pros watch.",
  },
  {
    glyph: "04",
    title: "Self-custodial, always",
    description:
      "Your keys, your coins. ChadWallet never holds your funds — Privy-backed embedded wallets keep custody with you.",
  },
];

/**
 * Solana-focused value props, presented as a deliberate asymmetric grid
 * rather than a uniform centered card row.
 */
export function FeatureSections() {
  return (
    <section id="features" className="px-6 py-20 sm:py-24 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex flex-col gap-3 sm:max-w-xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need.{" "}
            <span className="text-muted">Nothing you don&apos;t.</span>
          </h2>
          <p className="text-base text-muted sm:text-lg">
            Built for people who want exposure to Solana memecoins without
            wrestling with wallets.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="cw-card group relative overflow-hidden p-6 transition-colors hover:border-accent/50"
            >
              <span className="cw-num text-sm font-semibold text-accent/70">
                {feature.glyph}
              </span>
              <h3 className="mt-3 text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
