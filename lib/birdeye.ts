import type { Candle, DataResult, Holder, Token, TokenOverview, Trade } from "@/types";
import { isPlaceholder, serverEnv } from "./env";
import { mockCandles, mockHolders, mockOverview, mockTrades, mockTrending } from "./mock";

const BASE_URL = "https://public-api.birdeye.so";

function headers(key: string): HeadersInit {
  return { "X-API-KEY": key, "x-chain": "solana" };
}

async function fetchJson(path: string, key: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: headers(key) });
  if (!res.ok) {
    throw new Error(`BirdEye request failed: ${res.status} ${path}`);
  }
  return res.json();
}

// --- Defensive normalizers: BirdEye's response shapes are not guaranteed, so
// every field access is optional-chained / coerced. If the result wouldn't be
// usable we throw, which sends the caller down the mock-fallback path. ---

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null;
}

function get(obj: unknown, key: string): unknown {
  return isObject(obj) ? obj[key] : undefined;
}

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toStr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function firstArray(...candidates: unknown[]): unknown[] | undefined {
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return undefined;
}

function normalizeToken(raw: unknown): Token {
  const mint = get(raw, "address") ?? get(raw, "mint");
  if (typeof mint !== "string" || mint.length === 0) {
    throw new Error("BirdEye token missing address/mint");
  }
  const symbol = toStr(get(raw, "symbol"), mint.slice(0, 4).toUpperCase());
  return {
    mint,
    symbol,
    name: toStr(get(raw, "name"), symbol),
    priceUsd: toNumber(get(raw, "price") ?? get(raw, "priceUsd")),
    change24h: toNumber(get(raw, "price24hChangePercent") ?? get(raw, "change24h")),
    logoURI: typeof get(raw, "logoURI") === "string" ? (get(raw, "logoURI") as string) : undefined,
  };
}

function normalizeTrending(json: unknown): Token[] {
  const data = get(json, "data");
  const list = firstArray(get(data, "tokens"), get(data, "items"), data);
  if (!list || list.length === 0) {
    throw new Error("BirdEye trending response had no tokens");
  }
  return list.map(normalizeToken);
}

function normalizeOverview(json: unknown, mint: string): TokenOverview {
  const d = get(json, "data");
  if (!isObject(d)) throw new Error("BirdEye overview response missing data");
  const symbol = toStr(get(d, "symbol"), mint.slice(0, 4).toUpperCase());
  return {
    mint,
    symbol,
    name: toStr(get(d, "name"), symbol),
    priceUsd: toNumber(get(d, "price")),
    change24h: toNumber(get(d, "priceChange24hPercent")),
    logoURI: typeof get(d, "logoURI") === "string" ? (get(d, "logoURI") as string) : undefined,
    marketCap: toNumber(get(d, "mc") ?? get(d, "marketCap")),
    volume24h: toNumber(get(d, "v24hUSD") ?? get(d, "volume24h")),
    liquidity: toNumber(get(d, "liquidity")),
  };
}

function normalizeOhlcv(json: unknown): Candle[] {
  const data = get(json, "data");
  const items = firstArray(get(data, "items"), data);
  if (!items || items.length === 0) {
    throw new Error("BirdEye ohlcv response had no items");
  }
  return items.map((c) => ({
    time: toNumber(get(c, "unixTime") ?? get(c, "time")),
    open: toNumber(get(c, "o") ?? get(c, "open")),
    high: toNumber(get(c, "h") ?? get(c, "high")),
    low: toNumber(get(c, "l") ?? get(c, "low")),
    close: toNumber(get(c, "c") ?? get(c, "close")),
  }));
}

function normalizeHolders(json: unknown): Holder[] {
  const data = get(json, "data");
  const items = firstArray(get(data, "items"), data);
  if (!items || items.length === 0) {
    throw new Error("BirdEye holders response had no items");
  }
  return items.map((h) => ({
    owner: toStr(get(h, "owner") ?? get(h, "address"), "unknown"),
    amount: toNumber(get(h, "amount") ?? get(h, "ui_amount") ?? get(h, "uiAmount")),
    percentage: toNumber(get(h, "percentage") ?? get(h, "percent")),
  }));
}

function normalizeTrades(json: unknown): Trade[] {
  const data = get(json, "data");
  const items = firstArray(get(data, "items"), data);
  if (!items || items.length === 0) {
    throw new Error("BirdEye trades response had no items");
  }
  return items.map((t) => ({
    txHash: toStr(get(t, "txHash") ?? get(t, "tx_hash"), "unknown"),
    side: (get(t, "side") ?? get(t, "txType")) === "sell" ? "sell" : "buy",
    amountUsd: toNumber(get(t, "volumeUSD") ?? get(t, "amountUsd")),
    tokenAmount: toNumber(get(t, "uiAmount") ?? get(t, "tokenAmount")),
    priceUsd: toNumber(get(t, "price") ?? get(t, "priceUsd")),
    timestamp: toNumber(get(t, "blockUnixTime") ?? get(t, "timestamp")),
    owner: toStr(get(t, "owner") ?? get(t, "address"), "unknown"),
  }));
}

export async function getTrending(): Promise<DataResult<Token[]>> {
  const key = serverEnv.birdeyeKey;
  if (isPlaceholder(key)) {
    return { data: mockTrending(), degraded: true };
  }
  try {
    const json = await fetchJson("/defi/token_trending?sort_by=rank&sort_type=asc&limit=20", key!);
    return { data: normalizeTrending(json), degraded: false };
  } catch {
    return { data: mockTrending(), degraded: true };
  }
}

export async function getTokenOverview(mint: string): Promise<DataResult<TokenOverview>> {
  const key = serverEnv.birdeyeKey;
  if (isPlaceholder(key)) {
    return { data: mockOverview(mint), degraded: true };
  }
  try {
    const json = await fetchJson(`/defi/token_overview?address=${mint}`, key!);
    return { data: normalizeOverview(json, mint), degraded: false };
  } catch {
    return { data: mockOverview(mint), degraded: true };
  }
}

export async function getOhlcv(mint: string, interval = "1H"): Promise<DataResult<Candle[]>> {
  const key = serverEnv.birdeyeKey;
  if (isPlaceholder(key)) {
    return { data: mockCandles(mint), degraded: true };
  }
  try {
    const json = await fetchJson(`/defi/ohlcv?address=${mint}&type=${interval}`, key!);
    return { data: normalizeOhlcv(json), degraded: false };
  } catch {
    return { data: mockCandles(mint), degraded: true };
  }
}

export async function getHolders(mint: string): Promise<DataResult<Holder[]>> {
  const key = serverEnv.birdeyeKey;
  if (isPlaceholder(key)) {
    return { data: mockHolders(mint), degraded: true };
  }
  try {
    const json = await fetchJson(`/defi/v3/token/holder?address=${mint}&limit=20`, key!);
    return { data: normalizeHolders(json), degraded: false };
  } catch {
    return { data: mockHolders(mint), degraded: true };
  }
}

export async function getTrades(mint: string): Promise<DataResult<Trade[]>> {
  const key = serverEnv.birdeyeKey;
  if (isPlaceholder(key)) {
    return { data: mockTrades(mint), degraded: true };
  }
  try {
    const json = await fetchJson(`/defi/txs/token?address=${mint}&tx_type=swap&limit=30`, key!);
    return { data: normalizeTrades(json), degraded: false };
  } catch {
    return { data: mockTrades(mint), degraded: true };
  }
}
