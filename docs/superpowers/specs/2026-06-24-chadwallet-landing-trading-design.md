# ChadWallet — Landing + Trading App Design

**Date:** 2026-06-24
**Status:** Approved (pending spec review)
**Deadline:** Ship live preview by 2026-06-28

## 1. Goal

Build a [fomo.family](https://fomo.family)-style web app for the **ChadWallet** brand:

- **Minimum:** A polished landing page with rotating token banners (top + bottom),
  Apple/Google sign-in via Privy, and Solana support.
- **Bonus (in scope for this build):** A full trading page (trending list, token info,
  price chart, holders, live trades, buy/sell, user position).

Powered by **real data** where API keys are present, with a **graceful mock fallback**
so the app is always alive (never blank) even with placeholder env keys. Deployed to
**Vercel** on free tiers across all services.

## 2. Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Server components + route handlers |
| Styling | Tailwind CSS v4 | Utility-first, dark trading aesthetic |
| Auth + Wallet | Privy | Apple/Google login, embedded Solana wallet |
| Market data | BirdEye Data API | Trending, price, OHLCV, holders, trades |
| RPC | Alchemy (Solana) | Balances, send transactions |
| Swaps | Jupiter | Quote + swap transaction build |
| Chart | TradingView **Lightweight Charts** (MIT) | Substitute for gated Advanced lib |
| Persistence | Supabase (thin) | Watchlist / last-viewed; optional |
| Hosting | Vercel | Public preview URL |

**Explicitly excluded:** Cloudflare (Vercel covers hosting/CDN), TradingView Advanced
Charting Library (gated private-repo access — not free-tier/deadline-friendly), brand
image assets (user provides later — placeholders used now).

## 3. Architecture

### 3.1 Graceful data-adapter layer

Every external service is reached through a single adapter module in `lib/`. Each adapter:

1. Reads its key/URL from env.
2. If the key is missing or still the placeholder sentinel value, returns realistic
   **mock data** (deterministic, seeded) instead of calling the network.
3. Otherwise calls the real API and normalizes the response to our internal types.

This means: placeholder env → app runs fully with mock data; real key dropped in → real
data flows with **zero code change**. A helper `isPlaceholder(key)` centralizes the check.

Adapters:
- `lib/birdeye.ts` — `getTrending()`, `getTokenOverview(mint)`, `getOhlcv(mint, interval)`,
  `getHolders(mint)`, `getTrades(mint)`.
- `lib/solana.ts` — `getSolBalance(addr)`, `getTokenBalance(addr, mint)` via Alchemy RPC.
- `lib/jupiter.ts` — `getQuote(input, output, amount)`, `buildSwap(quote, userPubkey)`.
- `lib/supabase.ts` — `getWatchlist(userId)`, `toggleWatchlist(userId, mint)` (no-op mock if unset).
- `lib/mock/` — seeded fixtures backing all of the above.

### 3.2 API routes (server-side, keys never sent to client)

BirdEye/Alchemy/Jupiter keys stay server-side. Client calls our own Next.js route handlers:

- `GET /api/trending`
- `GET /api/token/[mint]` (overview)
- `GET /api/token/[mint]/ohlcv?interval=`
- `GET /api/token/[mint]/holders`
- `GET /api/token/[mint]/trades`
- `GET /api/balance?address=&mint=`
- `POST /api/swap/quote`
- `POST /api/swap/build`

Each handler delegates to its adapter, so mock fallback is automatic and uniform.

### 3.3 Types

Shared types in `types/index.ts`: `Token`, `TokenOverview`, `Candle`, `Holder`,
`Trade`, `SwapQuote`, `Position`.

## 4. Pages & Components

### 4.1 Landing (`/`)

- `TokenBanner` (top) — auto-scrolling marquee of trending tokens (symbol, price, % change,
  sparkline-style color). Each item links to `/trade/[mint]`.
- `Hero` — ChadWallet name/tagline, primary CTA, **App Store + Play Store** buttons using
  the provided URLs:
  - Android: `https://play.google.com/store/apps/details?id=xyz.chadwallet.www`
  - iPhone: `https://apps.apple.com/us/app/chadwallet/id6757367474`
- `PrivyAuthButton` — "Sign in with Apple" / "Sign in with Google" (Privy).
- `FeatureSections` — Solana-focused value props (fomo.family-style copy blocks).
- `TokenBanner` (bottom) — second marquee, opposite scroll direction.
- `Footer` — links, store badges.

### 4.2 Trade (`/trade/[mint]`)

Three-column responsive layout (stacks on mobile):

- **Left** — `TrendingList`: clickable trending tokens; active token highlighted.
- **Middle**:
  - `TokenHeader` — logo placeholder, symbol/name, price, mcap, 24h %, links.
  - `PriceChart` — Lightweight Charts candlestick from `/ohlcv`; interval toggle.
  - Tabs: `HoldersTable` (top holders, %) and `LiveTrades` (recent buys/sells, polled).
- **Right**:
  - `TradePanel` — Buy/Sell toggle, amount input, Jupiter quote (price impact, min received),
    "Connect to trade" if unauthenticated, execute via Privy-signed tx through Alchemy.
  - `PositionCard` — user's SOL balance + balance/value of the current token.

### 4.3 Shared

`PrivyProviderWrapper` (root layout), `Header` (logo + auth state), theme tokens.

## 5. Data Flow

1. **Banners/trending:** client → `/api/trending` → BirdEye adapter (mock fallback) → marquee + left list.
2. **Token view:** route param `mint` → parallel fetch overview/ohlcv/holders/trades.
3. **Chart:** OHLCV candles → Lightweight Charts series; interval toggle refetches.
4. **Live trades/price:** polled every ~10s (no websockets in free-tier scope).
5. **Position:** Privy wallet address → `/api/balance` → Alchemy RPC.
6. **Swap:** amount → `/api/swap/quote` (Jupiter) → on confirm, `/api/swap/build` returns
   serialized tx → signed by Privy Solana wallet → sent via Alchemy → toast with signature.

## 6. Error Handling

- Adapter network/parse errors → log server-side, fall back to mock + `degraded: true` flag
  surfaced subtly in UI (small "demo data" pill) so reviewers know when keys aren't set.
- Swap failures (no route, slippage, rejected signature) → inline error in `TradePanel`,
  no crash.
- Unauthenticated trade attempt → CTA to sign in, not an error.
- Missing/invalid `mint` → friendly "token not found", link back to a default token.

## 7. Testing

- **Unit:** adapter mock-fallback logic (`isPlaceholder`, normalization), quote math
  (min-received, price-impact display), marquee item mapping. Vitest.
- **Component:** `TokenBanner` renders items + links, `TradePanel` buy/sell toggle and
  disabled states, `PriceChart` mounts with candle data. React Testing Library.
- **Smoke/E2E (light):** landing renders both banners + store links; clicking a banner item
  routes to `/trade/[mint]`; trade page renders all three columns with mock data. Playwright.
- **Manual verify before deploy:** run locally, screenshot landing + trade, confirm Privy
  modal opens, confirm deploy build passes.

## 8. Environment Variables

`.env.example` documents every key with placeholder sentinels:

```
NEXT_PUBLIC_PRIVY_APP_ID=placeholder-privy-app-id
PRIVY_APP_SECRET=placeholder-privy-secret
BIRDEYE_API_KEY=placeholder-birdeye-key
ALCHEMY_SOLANA_RPC_URL=placeholder-alchemy-rpc-url
NEXT_PUBLIC_SUPABASE_URL=placeholder-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-supabase-anon-key
JUPITER_BASE_URL=https://quote-api.jup.ag
```

Adapters treat any value starting with `placeholder-` as unset → mock mode.

## 9. Build Sequence (for the implementation plan)

1. Scaffold Next.js + Tailwind + TypeScript, types, env example.
2. Adapter layer + mock fixtures + `isPlaceholder`, with unit tests.
3. API route handlers over adapters.
4. Privy provider + auth button.
5. Landing page: banners (top/bottom), hero w/ store links, features, footer.
6. Trade page: layout + TrendingList + TokenHeader + PriceChart.
7. HoldersTable + LiveTrades tabs.
8. TradePanel (Jupiter quote) + PositionCard (balance) + swap execution.
9. Polish, responsive, demo-data pill, smoke tests.
10. Deploy to Vercel, share preview URL.

## 10. Out of Scope (YAGNI for deadline)

Real non-Privy custody, limit/DCA orders, multi-chain, websocket streams, full Supabase
backend, brand image assets, TradingView Advanced library, i18n.
