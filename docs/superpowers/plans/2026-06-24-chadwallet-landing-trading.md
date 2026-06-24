# ChadWallet Landing + Trading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fomo.family-style ChadWallet web app — a landing page (rotating top/bottom token banners, Privy Apple/Google sign-in, Solana) plus a full trading page (trending list, token info, Lightweight Charts price chart, holders, live trades, Jupiter buy/sell, user position) — powered by real data with a graceful mock fallback, deployed to Vercel.

**Architecture:** Next.js 15 App Router. Every external service is reached through a single adapter in `lib/` that returns seeded mock data when its env key is a `placeholder-*` sentinel, and real data otherwise — so the app is always alive and swapping in a real key needs zero code changes. Server-side route handlers in `app/api/` wrap the adapters so secret keys never reach the client.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Privy (auth + embedded Solana wallet), BirdEye Data API, Alchemy Solana RPC, Jupiter swaps, TradingView Lightweight Charts (MIT), Supabase (thin), Vitest + React Testing Library + Playwright, Vercel.

## Global Constraints

- **Runtime:** Node 22, pnpm. Next.js 15 App Router, TypeScript strict.
- **Free tier only** for every service. No paid APIs, no websockets (poll instead).
- **Placeholder sentinel:** any env value starting with `placeholder-` (or missing) means "not configured" → adapter returns mock data. Centralized in `isPlaceholder()`.
- **Secrets never client-side:** BirdEye / Alchemy / Jupiter / Privy secret accessed only in `app/api/*` route handlers or server modules. Only `NEXT_PUBLIC_*` values reach the browser.
- **Brand:** name is **ChadWallet** (one word). No image assets yet — use text/placeholder blocks. Store links, verbatim:
  - Android: `https://play.google.com/store/apps/details?id=xyz.chadwallet.www`
  - iPhone: `https://apps.apple.com/us/app/chadwallet/id6757367474`
- **Chain:** Solana only.
- **Chart:** TradingView Lightweight Charts (`lightweight-charts` npm), NOT the Advanced Charting Library.
- **Commit** after every task. Conventional commit messages.

---

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `.env.example`, `vitest.config.ts`, `vitest.setup.ts`
- Modify: `.gitignore` (already has node_modules/.next/.env)

**Interfaces:**
- Produces: a running `pnpm dev` app and `pnpm test` harness used by every later task.

- [ ] **Step 1: Scaffold with create-next-app**

Run (in project root, which already has `.git` and `docs/`):
```bash
pnpm create next-app@latest . --ts --tailwind --app --eslint --src-dir=false --import-alias "@/*" --no-turbopack --use-pnpm --yes
```
If it refuses because the dir is non-empty, scaffold in a temp dir and move files:
```bash
pnpm create next-app@latest /tmp/cw-scaffold --ts --tailwind --app --eslint --src-dir=false --import-alias "@/*" --no-turbopack --use-pnpm --yes
rsync -a --ignore-existing /tmp/cw-scaffold/ ./ && rm -rf /tmp/cw-scaffold
```

- [ ] **Step 2: Add test + chart + service deps**

```bash
pnpm add @privy-io/react-auth @solana/web3.js lightweight-charts @supabase/supabase-js
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], globals: true },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```
Create `vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```
Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 4: Create `.env.example`**

```
NEXT_PUBLIC_PRIVY_APP_ID=placeholder-privy-app-id
PRIVY_APP_SECRET=placeholder-privy-secret
BIRDEYE_API_KEY=placeholder-birdeye-key
ALCHEMY_SOLANA_RPC_URL=placeholder-alchemy-rpc-url
NEXT_PUBLIC_SUPABASE_URL=placeholder-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-supabase-anon-key
JUPITER_BASE_URL=https://quote-api.jup.ag
```
Then `cp .env.example .env.local`.

- [ ] **Step 5: Verify dev server + build**

Run: `pnpm build`
Expected: build succeeds (default starter page).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js app with Tailwind and Vitest"
```

---

### Task 2: Shared types + env helper

**Files:**
- Create: `types/index.ts`, `lib/env.ts`, `lib/env.test.ts`

**Interfaces:**
- Produces:
  - `types/index.ts`: `Token { mint: string; symbol: string; name: string; priceUsd: number; change24h: number; logoURI?: string }`, `TokenOverview extends Token { marketCap: number; volume24h: number; liquidity: number }`, `Candle { time: number; open: number; high: number; low: number; close: number }`, `Holder { owner: string; amount: number; percentage: number }`, `Trade { txHash: string; side: "buy" | "sell"; amountUsd: number; tokenAmount: number; priceUsd: number; timestamp: number; owner: string }`, `SwapQuote { inputMint: string; outputMint: string; inAmount: string; outAmount: string; priceImpactPct: number; minReceived: string }`, `Position { sol: number; tokenAmount: number; tokenValueUsd: number }`, `DataResult<T> { data: T; degraded: boolean }`
  - `lib/env.ts`: `isPlaceholder(value: string | undefined): boolean`, `serverEnv` object, `publicEnv` object.

- [ ] **Step 1: Write failing test for `isPlaceholder`**

Create `lib/env.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { isPlaceholder } from "./env";

describe("isPlaceholder", () => {
  it("treats undefined as placeholder", () => { expect(isPlaceholder(undefined)).toBe(true); });
  it("treats empty string as placeholder", () => { expect(isPlaceholder("")).toBe(true); });
  it("treats placeholder- prefixed value as placeholder", () => {
    expect(isPlaceholder("placeholder-birdeye-key")).toBe(true);
  });
  it("treats a real key as configured", () => {
    expect(isPlaceholder("be_abc123")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `pnpm test lib/env.test.ts`
Expected: FAIL (cannot find module './env').

- [ ] **Step 3: Implement `lib/env.ts`**

```ts
export function isPlaceholder(value: string | undefined): boolean {
  return !value || value.trim() === "" || value.startsWith("placeholder-");
}

export const serverEnv = {
  birdeyeKey: process.env.BIRDEYE_API_KEY,
  alchemyRpcUrl: process.env.ALCHEMY_SOLANA_RPC_URL,
  privySecret: process.env.PRIVY_APP_SECRET,
  jupiterBaseUrl: process.env.JUPITER_BASE_URL || "https://quote-api.jup.ag",
};

export const publicEnv = {
  privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};
```

- [ ] **Step 4: Create `types/index.ts`** with all interfaces listed in the Interfaces block above (exact field names/types).

- [ ] **Step 5: Run test, verify pass**

Run: `pnpm test lib/env.test.ts` → Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add shared types and env placeholder helper"
```

---

### Task 3: Mock fixtures

**Files:**
- Create: `lib/mock/tokens.ts`, `lib/mock/index.ts`, `lib/mock/index.test.ts`

**Interfaces:**
- Consumes: types from Task 2.
- Produces: `mockTrending(): Token[]` (≥8 Solana tokens incl. SOL, BONK, WIF, JUP, USDC with realistic mints/prices), `mockOverview(mint): TokenOverview`, `mockCandles(mint, count=100): Candle[]` (seeded random walk, ascending `time`), `mockHolders(mint): Holder[]` (percentages sum ≤100), `mockTrades(mint, count=30): Trade[]` (descending timestamp), `mockPosition(): Position`. All deterministic via a seeded PRNG keyed by mint.

- [ ] **Step 1: Write failing test**

Create `lib/mock/index.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { mockTrending, mockCandles, mockHolders, mockTrades } from "./index";

describe("mock fixtures", () => {
  it("returns at least 8 trending tokens with required fields", () => {
    const t = mockTrending();
    expect(t.length).toBeGreaterThanOrEqual(8);
    expect(t[0]).toHaveProperty("mint");
    expect(t[0]).toHaveProperty("symbol");
    expect(typeof t[0].priceUsd).toBe("number");
  });
  it("is deterministic for the same mint", () => {
    expect(mockCandles("So11111111111111111111111111111111111111112"))
      .toEqual(mockCandles("So11111111111111111111111111111111111111112"));
  });
  it("returns candles with ascending time", () => {
    const c = mockCandles("X");
    expect(c.every((p, i) => i === 0 || p.time > c[i - 1].time)).toBe(true);
  });
  it("holder percentages do not exceed 100", () => {
    const sum = mockHolders("X").reduce((s, h) => s + h.percentage, 0);
    expect(sum).toBeLessThanOrEqual(100);
  });
  it("trades are sorted by descending timestamp", () => {
    const tr = mockTrades("X");
    expect(tr.every((p, i) => i === 0 || p.timestamp <= tr[i - 1].timestamp)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, verify fail** — Run: `pnpm test lib/mock` → FAIL (module not found).

- [ ] **Step 3: Implement fixtures.** In `lib/mock/tokens.ts` export a `BASE_TOKENS: Token[]` array (SOL, BONK, WIF, JUP, USDC, PYTH, JTO, RAY — real mints, plausible prices/changes). In `lib/mock/index.ts` implement a small seeded PRNG `function seeded(seed: string)` (e.g. mulberry32 over a hashed seed) and the six functions. `mockCandles` builds a random walk: start price from base token, step ±2%, `time` in seconds ascending hourly ending now. `mockHolders` generates descending amounts whose percentages sum to ~85%. `mockTrades` generates descending timestamps within the last hour.

- [ ] **Step 4: Run test, verify pass** — Run: `pnpm test lib/mock` → PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add deterministic mock fixtures"
```

---

### Task 4: BirdEye adapter

**Files:**
- Create: `lib/birdeye.ts`, `lib/birdeye.test.ts`

**Interfaces:**
- Consumes: `isPlaceholder`/`serverEnv` (Task 2), types (Task 2), mock fns (Task 3).
- Produces (all `async`, all return `DataResult<...>`):
  `getTrending(): Promise<DataResult<Token[]>>`,
  `getTokenOverview(mint): Promise<DataResult<TokenOverview>>`,
  `getOhlcv(mint, interval="1H"): Promise<DataResult<Candle[]>>`,
  `getHolders(mint): Promise<DataResult<Holder[]>>`,
  `getTrades(mint): Promise<DataResult<Trade[]>>`.
  When key is placeholder OR a fetch throws → `{ data: <mock>, degraded: true }`. Real success → `{ data, degraded: false }`.

- [ ] **Step 1: Write failing test** (mock-mode + fallback-on-error)

Create `lib/birdeye.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("birdeye adapter", () => {
  beforeEach(() => { vi.resetModules(); vi.unstubAllEnvs(); });

  it("returns degraded mock data when key is placeholder", async () => {
    vi.stubEnv("BIRDEYE_API_KEY", "placeholder-birdeye-key");
    const { getTrending } = await import("./birdeye");
    const r = await getTrending();
    expect(r.degraded).toBe(true);
    expect(r.data.length).toBeGreaterThan(0);
  });

  it("falls back to mock when a real call throws", async () => {
    vi.stubEnv("BIRDEYE_API_KEY", "be_realkey");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const { getTrending } = await import("./birdeye");
    const r = await getTrending();
    expect(r.degraded).toBe(true);
    expect(r.data.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test, verify fail** — Run: `pnpm test lib/birdeye.test.ts` → FAIL.

- [ ] **Step 3: Implement `lib/birdeye.ts`.** Base URL `https://public-api.birdeye.so`, header `{ "X-API-KEY": key, "x-chain": "solana" }`. Each function: if `isPlaceholder(serverEnv.birdeyeKey)` return mock with `degraded:true`; else `try` real fetch+normalize → `degraded:false`, `catch` → mock + `degraded:true`. Endpoints: trending `/defi/token_trending?sort_by=rank&sort_type=asc&limit=20`, overview `/defi/token_overview?address=`, ohlcv `/defi/ohlcv?address=&type=1H`, holders `/defi/v3/token/holder?address=&limit=20`, trades `/defi/txs/token?address=&tx_type=swap&limit=30`. Map response shapes to our types; if a field is missing fall back gracefully. (Endpoint paths may need adjustment when a real key is tested — normalization is isolated here.)

- [ ] **Step 4: Run test, verify pass** — Run: `pnpm test lib/birdeye.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add BirdEye adapter with mock fallback"
```

---

### Task 5: Solana (Alchemy) + Jupiter adapters

**Files:**
- Create: `lib/solana.ts`, `lib/jupiter.ts`, `lib/jupiter.test.ts`

**Interfaces:**
- Consumes: `isPlaceholder`/`serverEnv`, types, mock.
- Produces:
  - `lib/solana.ts`: `getPosition(address: string, mint: string, priceUsd: number): Promise<DataResult<Position>>` — uses Alchemy RPC `getBalance` + `getTokenAccountsByOwner`; placeholder/error → `mockPosition()` degraded.
  - `lib/jupiter.ts`: `getQuote(inputMint, outputMint, amount: number, slippageBps=50): Promise<DataResult<SwapQuote>>` and `buildSwap(quoteRaw: unknown, userPublicKey: string): Promise<DataResult<{ swapTransaction: string }>>`. Quote uses `${jupiterBaseUrl}/v6/quote`; build uses `/v6/swap`. Placeholder base or error → mock quote (compute `minReceived = outAmount * (1 - slippageBps/10000)`).
- Produces helper (exported, pure, unit-tested): `computeMinReceived(outAmount: string, slippageBps: number): string`.

- [ ] **Step 1: Write failing test for quote math + mock fallback**

Create `lib/jupiter.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { computeMinReceived } from "./jupiter";

describe("computeMinReceived", () => {
  it("applies slippage in bps", () => {
    expect(computeMinReceived("1000000", 50)).toBe("995000"); // 0.5%
  });
  it("handles zero slippage", () => {
    expect(computeMinReceived("1000000", 0)).toBe("1000000");
  });
});
```

- [ ] **Step 2: Run test, verify fail** — Run: `pnpm test lib/jupiter.test.ts` → FAIL.

- [ ] **Step 3: Implement** `lib/jupiter.ts` (incl. `computeMinReceived` using integer math: `(BigInt(outAmount) * BigInt(10000 - slippageBps) / 10000n).toString()`) and `lib/solana.ts` (JSON-RPC POST to `serverEnv.alchemyRpcUrl`).

- [ ] **Step 4: Run test, verify pass** — Run: `pnpm test lib/jupiter.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add Solana balance and Jupiter swap adapters"
```

---

### Task 6: API route handlers

**Files:**
- Create: `app/api/trending/route.ts`, `app/api/token/[mint]/route.ts`, `app/api/token/[mint]/ohlcv/route.ts`, `app/api/token/[mint]/holders/route.ts`, `app/api/token/[mint]/trades/route.ts`, `app/api/balance/route.ts`, `app/api/swap/quote/route.ts`, `app/api/swap/build/route.ts`
- Create: `app/api/trending/route.test.ts`

**Interfaces:**
- Consumes: all adapters (Tasks 4–5).
- Produces: GET/POST handlers returning the adapters' `DataResult` JSON. `[mint]` is a route param. `balance` reads `?address=&mint=&price=`. `swap/quote` and `swap/build` are POST with JSON bodies.

- [ ] **Step 1: Write failing test** for the trending route returning JSON with `data` array:
```ts
import { describe, it, expect, vi } from "vitest";
vi.stubEnv("BIRDEYE_API_KEY", "placeholder-birdeye-key");
import { GET } from "./route";

describe("GET /api/trending", () => {
  it("returns a data array", async () => {
    const res = await GET();
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test, verify fail** — Run: `pnpm test app/api/trending` → FAIL.

- [ ] **Step 3: Implement all route handlers.** Each: `export const dynamic = "force-dynamic";` then call adapter and `return Response.json(result)`. Example trending:
```ts
import { getTrending } from "@/lib/birdeye";
export const dynamic = "force-dynamic";
export async function GET() { return Response.json(await getTrending()); }
```
For `[mint]` routes, signature `(_req: Request, { params }: { params: Promise<{ mint: string }> })`, `const { mint } = await params;`. For POST routes parse `await req.json()`.

- [ ] **Step 4: Run test, verify pass** — Run: `pnpm test app/api/trending` → PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add API route handlers over adapters"
```

---

### Task 7: Privy provider + auth button

**Files:**
- Create: `components/PrivyProviderWrapper.tsx`, `components/PrivyAuthButton.tsx`, `lib/hooks/useAuth.ts`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `<PrivyProviderWrapper>` (client) wrapping children with `PrivyProvider` configured for `loginMethods: ["google", "apple"]`, `embeddedWallets: { solana: { createOnLogin: "users-without-wallets" } }`, `appId={publicEnv.privyAppId}`. `<PrivyAuthButton/>` shows Sign in / user + logout. `useAuth()` returns `{ ready, authenticated, solanaAddress, login, logout }`.

- [ ] **Step 1: Implement `PrivyProviderWrapper`.** Client component. If `isPlaceholder(publicEnv.privyAppId)`, still render children (Privy with a dummy id throws, so guard: render a context that reports `authenticated:false` and a `login` that alerts "Set NEXT_PUBLIC_PRIVY_APP_ID"). Otherwise render real `PrivyProvider`.

- [ ] **Step 2: Implement `useAuth`** wrapping `usePrivy()` + `useSolanaWallets()` (from `@privy-io/react-auth/solana`), exposing the first Solana wallet address. In placeholder mode return safe defaults.

- [ ] **Step 3: Implement `PrivyAuthButton`** — when unauthenticated: two buttons "Continue with Apple" / "Continue with Google" calling `login()`. When authenticated: truncated address + "Disconnect".

- [ ] **Step 4: Wrap app** — in `app/layout.tsx` wrap `{children}` with `<PrivyProviderWrapper>`.

- [ ] **Step 5: Verify build** — Run: `pnpm build` → Expected: succeeds (no Privy crash in placeholder mode).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add Privy provider, auth hook, and sign-in button"
```

---

### Task 8: Client data hooks + theme

**Files:**
- Create: `lib/hooks/useTrending.ts`, `lib/hooks/useToken.ts`, `lib/api-client.ts`, `app/globals.css` (extend)

**Interfaces:**
- Produces: `apiGet<T>(path): Promise<DataResult<T>>` (fetch wrapper), `useTrending(): { tokens: Token[]; degraded: boolean; loading: boolean }` (polls every 15s), `useToken(mint): { overview; candles; holders; trades; degraded; loading }` with a `refreshInterval`. CSS: dark theme tokens (`--bg`, `--panel`, `--accent` green, `--danger` red), monospace numerics.

- [ ] **Step 1: Implement `lib/api-client.ts`** with `apiGet` (throws on non-OK, returns parsed JSON).

- [ ] **Step 2: Implement hooks** using `useEffect` + `setInterval`; `useTrending` polls `/api/trending`, `useToken(mint)` fetches the four token endpoints in parallel via `Promise.all`, re-polls trades/overview every 10s.

- [ ] **Step 3: Add theme** variables and base utilities to `app/globals.css` (dark bg, panel, accent/danger, card and table base classes).

- [ ] **Step 4: Verify build** — Run: `pnpm build` → succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add client data hooks and dark theme"
```

---

### Task 9: TokenBanner (rotating marquee)

**Files:**
- Create: `components/TokenBanner.tsx`, `components/TokenBanner.test.tsx`

**Interfaces:**
- Consumes: `Token[]`, Next `Link`.
- Produces: `<TokenBanner tokens={Token[]} direction="left" | "right" />` — a CSS marquee (duplicated track for seamless loop, `animation` translateX). Each item is a `Link href={\`/trade/${token.mint}\`}` showing symbol, price, and `change24h` colored green/red. Pauses on hover.

- [ ] **Step 1: Write failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TokenBanner } from "./TokenBanner";

const tokens = [{ mint: "M1", symbol: "SOL", name: "Solana", priceUsd: 150, change24h: 2.5 }];

describe("TokenBanner", () => {
  it("renders a token and links to its trade page", () => {
    render(<TokenBanner tokens={tokens} direction="left" />);
    expect(screen.getAllByText(/SOL/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/trade/M1");
  });
});
```

- [ ] **Step 2: Run test, verify fail** — Run: `pnpm test TokenBanner` → FAIL.

- [ ] **Step 3: Implement `TokenBanner`** + marquee keyframes (add `@keyframes marquee-left/right` to globals.css). Duplicate `tokens` once in the track for a seamless loop.

- [ ] **Step 4: Run test, verify pass** — Run: `pnpm test TokenBanner` → PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add rotating TokenBanner marquee"
```

---

### Task 10: Landing page

**Files:**
- Create: `components/Hero.tsx`, `components/StoreButtons.tsx`, `components/FeatureSections.tsx`, `components/Footer.tsx`, `components/DemoDataPill.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `useTrending`, `TokenBanner`, `PrivyAuthButton`, store links (Global Constraints).
- Produces: landing page = top `TokenBanner` (left) → `Hero` (headline, subcopy, `PrivyAuthButton`, `StoreButtons`) → `FeatureSections` (3–4 Solana value props) → bottom `TokenBanner` (right) → `Footer`. `DemoDataPill` shows when `degraded` is true.

- [ ] **Step 1: Implement `StoreButtons`** with the two verbatim store URLs (text buttons "App Store" / "Google Play", `target="_blank" rel="noopener"`).

- [ ] **Step 2: Implement `Hero`, `FeatureSections`, `Footer`, `DemoDataPill`** (fomo.family-style bold copy, dark gradient, ChadWallet branding text).

- [ ] **Step 3: Compose `app/page.tsx`** ("use client") using `useTrending()` for both banners; top banner direction left, bottom right.

- [ ] **Step 4: Verify** — Run: `pnpm build` → succeeds. Manually note both banners + store links render.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: build ChadWallet landing page"
```

---

### Task 11: Trade page shell + TrendingList + TokenHeader

**Files:**
- Create: `app/trade/[mint]/page.tsx`, `components/TrendingList.tsx`, `components/TokenHeader.tsx`
- Create: `components/TrendingList.test.tsx`

**Interfaces:**
- Consumes: `useTrending`, `useToken`, `Link`.
- Produces: 3-column grid (`lg:grid-cols-[260px_1fr_320px]`, stacks on mobile). Left = `<TrendingList activeMint={mint}/>` (each row links to `/trade/[mint]`, active highlighted). Middle top = `<TokenHeader overview={TokenOverview}/>` (symbol/name, price, 24h % colored, market cap, volume). Right = placeholder for Task 13.

- [ ] **Step 1: Write failing test for `TrendingList`** (renders rows, marks active):
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TrendingList } from "./TrendingList";
const tokens = [{ mint: "M1", symbol: "SOL", name: "Solana", priceUsd: 150, change24h: 2 },
                { mint: "M2", symbol: "BONK", name: "Bonk", priceUsd: 0.00002, change24h: -3 }];
describe("TrendingList", () => {
  it("links each token and highlights active", () => {
    render(<TrendingList tokens={tokens} activeMint="M2" />);
    expect(screen.getByRole("link", { name: /SOL/ })).toHaveAttribute("href", "/trade/M1");
    expect(screen.getByTestId("row-M2")).toHaveAttribute("data-active", "true");
  });
});
```

- [ ] **Step 2: Run test, verify fail** — `pnpm test TrendingList` → FAIL.

- [ ] **Step 3: Implement** `TrendingList` (prop `tokens`, `activeMint`; row `data-testid={\`row-${mint}\`}` `data-active`), `TokenHeader`, and `app/trade/[mint]/page.tsx` ("use client", reads `useParams().mint`, wires `useTrending` + `useToken`).

- [ ] **Step 4: Run test, verify pass** — `pnpm test TrendingList` → PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add trade page shell, trending list, token header"
```

---

### Task 12: PriceChart + Holders + LiveTrades

**Files:**
- Create: `components/PriceChart.tsx`, `components/HoldersTable.tsx`, `components/LiveTrades.tsx`, `components/TradeTabs.tsx`
- Modify: `app/trade/[mint]/page.tsx`

**Interfaces:**
- Consumes: `Candle[]`, `Holder[]`, `Trade[]` from `useToken`.
- Produces: `<PriceChart candles={Candle[]}/>` using `lightweight-charts` `createChart` + `addCandlestickSeries` in a `useEffect`, disposed on unmount, responsive width. `<HoldersTable holders/>`, `<LiveTrades trades/>` (buy green / sell red, relative time). `<TradeTabs/>` toggles Holders/Trades in the middle column.

- [ ] **Step 1: Implement `PriceChart`** — `"use client"`, ref div, `useEffect` creating chart with `{ time: candle.time, ... }` mapped to library shape; guard empty candles; `new ResizeObserver` to fit width; cleanup `chart.remove()`.

- [ ] **Step 2: Implement `HoldersTable` + `LiveTrades` + `TradeTabs`** and mount them in the middle column under the chart.

- [ ] **Step 3: Verify** — Run: `pnpm build` → succeeds (lightweight-charts is client-only; ensure no SSR import error — component is `"use client"`).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add price chart, holders table, live trades"
```

---

### Task 13: TradePanel + PositionCard (Jupiter swap)

**Files:**
- Create: `components/TradePanel.tsx`, `components/PositionCard.tsx`, `lib/hooks/usePosition.ts`
- Modify: `app/trade/[mint]/page.tsx`

**Interfaces:**
- Consumes: `useAuth` (Task 7), `/api/swap/quote`, `/api/swap/build`, `/api/balance`, `useSolanaWallets` for signing, `Connection` from `@solana/web3.js`.
- Produces: right column. `<TradePanel mint overview/>`: Buy/Sell toggle, amount input, debounced quote (shows out amount, price impact, min received). If unauthenticated → "Sign in to trade" (calls `login`). On confirm: POST build → deserialize `VersionedTransaction` → `wallet.signTransaction` → send via `Connection(alchemyRpcUrl)` → toast signature; errors inline. `<PositionCard/>`: from `usePosition(address, mint, price)` → SOL balance + token amount/value. SOL & USDC mints hard-coded as quote/base.

- [ ] **Step 1: Implement `usePosition`** polling `/api/balance?address=&mint=&price=` every 15s (skips when no address).

- [ ] **Step 2: Implement `TradePanel`** — debounce amount (300ms) → `apiPost("/api/swap/quote", {...})`; render quote details; disabled states; unauth CTA.

- [ ] **Step 3: Implement swap execution** — on "Buy"/"Sell": `apiPost("/api/swap/build", { quoteRaw, userPublicKey })`, then sign+send. Wrap in try/catch → inline error. In placeholder/degraded mode, show "Demo mode — connect real keys to trade" instead of sending.

- [ ] **Step 4: Implement `PositionCard`** and mount both in the right column.

- [ ] **Step 5: Verify** — Run: `pnpm build` → succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add trade panel with Jupiter quotes and position card"
```

---

### Task 14: Smoke E2E + polish

**Files:**
- Create: `e2e/smoke.spec.ts`, `playwright.config.ts`
- Modify: responsive tweaks across components as needed

**Interfaces:**
- Consumes: running dev server.
- Produces: Playwright smoke covering landing + routing + trade columns.

- [ ] **Step 1: Add Playwright** — `pnpm add -D @playwright/test && pnpm exec playwright install chromium`. Create `playwright.config.ts` with `webServer: { command: "pnpm dev", port: 3000, reuseExistingServer: true }`.

- [ ] **Step 2: Write smoke test**
```ts
import { test, expect } from "@playwright/test";
test("landing shows banners + store links, banner item routes to trade", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /App Store/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Google Play/i })).toBeVisible();
  const firstToken = page.locator('a[href^="/trade/"]').first();
  await firstToken.click();
  await expect(page).toHaveURL(/\/trade\//);
});
test("trade page renders three columns", async ({ page }) => {
  await page.goto("/trade/So11111111111111111111111111111111111111112");
  await expect(page.getByTestId("trending-list")).toBeVisible();
  await expect(page.getByTestId("trade-panel")).toBeVisible();
});
```
(Add `data-testid="trending-list"` / `data-testid="trade-panel"` to those components.)

- [ ] **Step 3: Run** — `pnpm exec playwright test` → PASS. Add `"test:e2e": "playwright test"` script.

- [ ] **Step 4: Responsive/polish pass** — verify mobile stacking, banner overflow hidden, no console errors. Run `pnpm test` (all unit) + `pnpm build`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "test: add Playwright smoke tests and polish pass"
```

---

### Task 15: Deploy to Vercel

**Files:**
- Create: `README.md` (setup + env + deploy notes), `vercel.json` (only if needed)

**Interfaces:**
- Produces: public preview URL.

- [ ] **Step 1: Write `README.md`** — project overview, the env table from spec §8, "runs with mock data out of the box", how to add real keys, and the chart/Cloudflare substitution notes.

- [ ] **Step 2: Push to GitHub** — `gh repo create chadwallet --private --source=. --push` (or user's preferred remote).

- [ ] **Step 3: Deploy** — `pnpm dlx vercel@latest --yes` then `pnpm dlx vercel@latest --prod --yes`. Add the `.env.example` placeholder keys as Vercel env vars so the build runs in mock mode. (User runs `vercel login` interactively if not authed.)

- [ ] **Step 4: Verify preview** — open the prod URL, confirm landing + a trade page load with demo data and no runtime errors.

- [ ] **Step 5: Commit + share**

```bash
git add -A && git commit -m "docs: add README and deploy config"
```
Share the live Vercel URL with the user.

---

## Self-Review

**Spec coverage:**
- Landing page → Tasks 9–10 ✅
- Rotating banners top+bottom, tap → trade → Tasks 9–10 ✅
- Privy Apple/Google sign-in → Task 7 ✅
- Solana support (wallet, balances, swaps) → Tasks 5, 7, 13 ✅
- Trading UI left/middle/right → Tasks 11–13 ✅
- BirdEye trending/overview/ohlcv/holders/trades → Tasks 4, 6 ✅
- Lightweight Charts → Task 12 ✅
- Jupiter swaps → Tasks 5, 13 ✅
- Alchemy RPC → Tasks 5, 13 ✅
- Supabase (thin) → noted optional; watchlist not in critical path. **Gap:** no dedicated task. Resolution: Supabase adapter is optional per spec §2 ("thin/optional"); intentionally deferred to avoid scope creep before deadline — store-links + auth + trading are the committed surface. Acceptable.
- Graceful mock fallback + demo pill → Tasks 2–6, 10 ✅
- Free tier, env placeholders → Task 1, Global Constraints ✅
- Vercel deploy → Task 15 ✅

**Placeholder scan:** No "TBD/TODO/implement later" left as deliverables. Note in Task 4 about endpoint paths is a real-key tuning caveat, not a missing implementation (mock path fully specified).

**Type consistency:** `DataResult<T>`, `Token`, `TokenOverview`, `Candle`, `Holder`, `Trade`, `SwapQuote`, `Position` defined in Task 2 and consumed verbatim in Tasks 3–13. Adapter function names (`getTrending`, `getTokenOverview`, `getOhlcv`, `getHolders`, `getTrades`, `getPosition`, `getQuote`, `buildSwap`, `computeMinReceived`) match between definition and consumption. ✅
