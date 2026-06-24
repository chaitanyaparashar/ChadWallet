import type { DataResult, SwapQuote } from "@/types";
import { isPlaceholder, serverEnv } from "./env";

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null;
}

function get(obj: unknown, key: string): unknown {
  return isObject(obj) ? obj[key] : undefined;
}

function toStr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Pure integer-math helper: applies slippage (in basis points) to an output
 * amount and returns the minimum amount the swap should be allowed to
 * receive. Uses BigInt to avoid floating point error on raw token amounts.
 */
export function computeMinReceived(outAmount: string, slippageBps: number): string {
  return ((BigInt(outAmount) * BigInt(10000 - slippageBps)) / BigInt(10000)).toString();
}

function mockQuote(inputMint: string, outputMint: string, amount: number, slippageBps: number): SwapQuote {
  const inAmount = Math.trunc(amount).toString();
  // Deterministic mock: assume a 1:1 rate (no oracle available offline).
  const outAmount = inAmount;
  return {
    inputMint,
    outputMint,
    inAmount,
    outAmount,
    priceImpactPct: 0,
    minReceived: computeMinReceived(outAmount, slippageBps),
  };
}

function normalizeQuote(json: unknown, inputMint: string, outputMint: string, slippageBps: number): SwapQuote {
  const inAmount = get(json, "inAmount");
  const outAmount = get(json, "outAmount");
  if (typeof inAmount !== "string" || typeof outAmount !== "string") {
    throw new Error("Jupiter quote response missing inAmount/outAmount");
  }
  return {
    inputMint: toStr(get(json, "inputMint"), inputMint),
    outputMint: toStr(get(json, "outputMint"), outputMint),
    inAmount,
    outAmount,
    priceImpactPct: toNumber(get(json, "priceImpactPct")),
    minReceived: computeMinReceived(outAmount, slippageBps),
  };
}

export async function getQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps = 50
): Promise<DataResult<SwapQuote>> {
  const baseUrl = serverEnv.jupiterBaseUrl;
  if (isPlaceholder(baseUrl)) {
    return { data: mockQuote(inputMint, outputMint, amount, slippageBps), degraded: true };
  }
  try {
    const url = `${baseUrl}/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${Math.trunc(
      amount
    )}&slippageBps=${slippageBps}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Jupiter quote request failed: ${res.status}`);
    }
    const json = await res.json();
    return { data: normalizeQuote(json, inputMint, outputMint, slippageBps), degraded: false };
  } catch {
    return { data: mockQuote(inputMint, outputMint, amount, slippageBps), degraded: true };
  }
}

export async function buildSwap(
  quoteRaw: unknown,
  userPublicKey: string
): Promise<DataResult<{ swapTransaction: string }>> {
  const baseUrl = serverEnv.jupiterBaseUrl;
  const mockSwap = { swapTransaction: "mock-swap-transaction-base64" };
  if (isPlaceholder(baseUrl)) {
    return { data: mockSwap, degraded: true };
  }
  try {
    const res = await fetch(`${baseUrl}/v6/swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quoteResponse: quoteRaw, userPublicKey }),
    });
    if (!res.ok) {
      throw new Error(`Jupiter swap request failed: ${res.status}`);
    }
    const json = await res.json();
    const swapTransaction = get(json, "swapTransaction");
    if (typeof swapTransaction !== "string" || swapTransaction.length === 0) {
      throw new Error("Jupiter swap response missing swapTransaction");
    }
    return { data: { swapTransaction }, degraded: false };
  } catch {
    return { data: mockSwap, degraded: true };
  }
}
