interface Stat {
  value: string;
  label: string;
}

const STATS: Stat[] = [
  { value: "$420M+", label: "volume traded" },
  { value: "180K+", label: "chads onboarded" },
  { value: "2.5M+", label: "trades executed" },
  { value: "<1s", label: "to your first swap" },
];

/**
 * fomo-style "by the numbers" band: a single row of oversized stats that gives
 * the page a beat of social proof between the hero and the orbit CTA.
 */
export function StatsSection() {
  return (
    <section className="relative isolate overflow-hidden border-y border-border bg-background-2 px-6 py-16 sm:py-20">
      <div
        aria-hidden
        className="cw-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[24rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[160px]"
      />
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-y-10 text-center sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2">
            <span
              className="cw-display text-foreground"
              style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
            >
              {stat.value}
            </span>
            <span className="text-sm text-muted sm:text-base">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
