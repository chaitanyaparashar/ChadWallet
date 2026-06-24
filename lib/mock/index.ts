import type { Candle, Holder, Position, Token, TokenOverview, Trade } from "@/types";
import { BASE_TOKENS } from "./tokens";

/** Hash a string seed into a 32-bit integer. */
function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** mulberry32 seeded PRNG, returns a function producing floats in [0, 1). */
function seeded(seed: string): () => number {
  let a = hashSeed(seed);
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function baseTokenFor(mint: string): Token {
  return (
    BASE_TOKENS.find((t) => t.mint === mint) ?? {
      mint,
      symbol: mint.slice(0, 4).toUpperCase(),
      name: `Unknown (${mint.slice(0, 6)})`,
      priceUsd: 1 + (hashSeed(mint) % 1000) / 100,
      change24h: ((hashSeed(mint) % 200) - 100) / 10,
    }
  );
}

export function mockTrending(): Token[] {
  return BASE_TOKENS;
}

export function mockOverview(mint: string): TokenOverview {
  const base = baseTokenFor(mint);
  const rand = seeded(`overview:${mint}`);
  const marketCap = base.priceUsd * (1_000_000 + rand() * 999_000_000);
  const volume24h = marketCap * (0.01 + rand() * 0.2);
  const liquidity = marketCap * (0.005 + rand() * 0.1);
  return {
    ...base,
    marketCap,
    volume24h,
    liquidity,
  };
}

export function mockCandles(mint: string, count = 100): Candle[] {
  const base = baseTokenFor(mint);
  const rand = seeded(`candles:${mint}`);
  const hourSeconds = 3600;
  const nowSeconds = Math.floor(Date.now() / 1000);
  const startTime = nowSeconds - (count - 1) * hourSeconds;

  const candles: Candle[] = [];
  let price = base.priceUsd;

  for (let i = 0; i < count; i++) {
    const open = price;
    const stepPct = (rand() * 2 - 1) * 0.02; // +/- 2%
    const close = Math.max(open * (1 + stepPct), 0.0000001);
    const high = Math.max(open, close) * (1 + rand() * 0.01);
    const low = Math.min(open, close) * (1 - rand() * 0.01);
    candles.push({
      time: startTime + i * hourSeconds,
      open,
      high,
      low,
      close,
    });
    price = close;
  }

  return candles;
}

export function mockHolders(mint: string): Holder[] {
  const rand = seeded(`holders:${mint}`);
  const holderCount = 10;
  const totalSupply = 1_000_000_000;
  const targetPercentage = 85;

  // Generate descending weights so amounts/percentages descend too.
  const weights: number[] = [];
  let weightSum = 0;
  for (let i = 0; i < holderCount; i++) {
    const w = (holderCount - i) * (0.5 + rand());
    weights.push(w);
    weightSum += w;
  }

  const holders: Holder[] = weights.map((w, i) => {
    const percentage = (w / weightSum) * targetPercentage;
    const amount = (percentage / 100) * totalSupply;
    return {
      owner: `${mint.slice(0, 4)}...holder${i}`,
      amount,
      percentage,
    };
  });

  return holders.sort((a, b) => b.percentage - a.percentage);
}

export function mockTrades(mint: string, count = 30): Trade[] {
  const base = baseTokenFor(mint);
  const rand = seeded(`trades:${mint}`);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const hourSeconds = 3600;

  const trades: Trade[] = [];
  for (let i = 0; i < count; i++) {
    const timestamp = nowSeconds - Math.floor(rand() * hourSeconds);
    const side: Trade["side"] = rand() > 0.5 ? "buy" : "sell";
    const priceUsd = base.priceUsd * (1 + (rand() * 2 - 1) * 0.03);
    const amountUsd = 10 + rand() * 5000;
    const tokenAmount = amountUsd / priceUsd;
    trades.push({
      txHash: `${mint.slice(0, 6)}${hashSeed(`${mint}:${i}`).toString(16)}`,
      side,
      amountUsd,
      tokenAmount,
      priceUsd,
      timestamp,
      owner: `trader${i}...${mint.slice(-4)}`,
    });
  }

  return trades.sort((a, b) => b.timestamp - a.timestamp);
}

export function mockPosition(): Position {
  return {
    sol: 2.5,
    tokenAmount: 15000,
    tokenValueUsd: 320.75,
  };
}
