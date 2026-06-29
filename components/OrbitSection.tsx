import Link from "next/link";
import Image from "next/image";

const DEFAULT_MINT = "So11111111111111111111111111111111111111112";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";

type Avatar = { angle: number; size: number };

function ChadAvatar({ size }: { size: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-full border border-border bg-panel shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo/chad.png"
        alt=""
        aria-hidden
        width={size}
        height={size}
        style={{ width: size * 0.7, height: size * 0.7 }}
      />
    </span>
  );
}

/**
 * One orbit ring: a dashed circle, plus avatars that spin around it. The ring
 * wrapper rotates; each avatar counter-rotates at the same speed so it stays
 * upright while still orbiting.
 */
function Ring({
  radiusPct,
  duration,
  reverse,
  avatars,
}: {
  radiusPct: number;
  duration: number;
  reverse?: boolean;
  avatars: Avatar[];
}) {
  const spin = reverse ? "cw-orbit-rev" : "cw-orbit";
  const counter = reverse ? "cw-orbit" : "cw-orbit-rev";
  const inset = 50 - radiusPct; // dashed ring inset so its radius matches the avatars

  return (
    <>
      <div
        aria-hidden
        className="absolute rounded-full border border-dashed border-white/10"
        style={{ inset: `${inset}%` }}
      />
      <div className={`absolute inset-0 ${spin}`} style={{ animationDuration: `${duration}s` }}>
        {avatars.map((a, i) => {
          const rad = (a.angle * Math.PI) / 180;
          const left = 50 + radiusPct * Math.cos(rad);
          const top = 50 + radiusPct * Math.sin(rad);
          return (
            <div
              key={i}
              className="absolute"
              style={{ left: `${left}%`, top: `${top}%`, transform: "translate(-50%, -50%)" }}
            >
              <div className={counter} style={{ animationDuration: `${duration}s` }}>
                <ChadAvatar size={a.size} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/**
 * fomo's "a trading app for the rest of us" section: centered copy ringed by
 * orbiting avatars on two concentric dashed circles spinning at different
 * speeds and directions.
 */
export function OrbitSection({ launchMint }: { launchMint?: string }) {
  const launchHref = `/trade/${launchMint ?? DEFAULT_MINT}`;

  return (
    <section className="relative isolate flex min-h-[80vh] items-center justify-center overflow-hidden bg-background-2 px-6 py-24">
      <div
        aria-hidden
        className="cw-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[140px]"
      />

      {/* Orbit rings, centered behind the copy. */}
      <div
        aria-hidden
        className="pointer-events-none absolute aspect-square w-[min(92vw,720px)]"
      >
        <Ring
          radiusPct={47}
          duration={52}
          avatars={[
            { angle: -90, size: 56 },
            { angle: -30, size: 40 },
            { angle: 35, size: 48 },
            { angle: 110, size: 36 },
            { angle: 180, size: 52 },
            { angle: 225, size: 42 },
          ]}
        />
        <Ring
          radiusPct={29}
          duration={36}
          reverse
          avatars={[
            { angle: -60, size: 44 },
            { angle: 60, size: 34 },
            { angle: 170, size: 40 },
            { angle: 280, size: 32 },
          ]}
        />
      </div>

      <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
        <h2
          className="cw-display text-foreground"
          style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
        >
          a trading app
          <br />
          for the rest of us
        </h2>
        <p className="mt-5 text-base text-muted sm:text-lg">
          join thousands of chads making their name on ChadWallet.
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
      </div>
    </section>
  );
}
