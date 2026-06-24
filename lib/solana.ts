import type { DataResult, Position } from "@/types";
import { isPlaceholder, serverEnv } from "./env";
import { mockPosition } from "./mock";

const LAMPORTS_PER_SOL = 1_000_000_000;

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

async function rpcCall(rpcUrl: string, method: string, params: unknown[]): Promise<unknown> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) {
    throw new Error(`Alchemy RPC request failed: ${res.status} ${method}`);
  }
  const json = await res.json();
  const error = get(json, "error");
  if (error !== undefined) {
    throw new Error(`Alchemy RPC error for ${method}: ${JSON.stringify(error)}`);
  }
  return get(json, "result");
}

function normalizeBalance(result: unknown): number {
  const lamports = get(result, "value");
  if (typeof lamports !== "number") {
    throw new Error("Alchemy getBalance response missing value");
  }
  return lamports / LAMPORTS_PER_SOL;
}

function normalizeTokenAmount(result: unknown): number {
  const value = get(result, "value");
  if (!Array.isArray(value)) {
    throw new Error("Alchemy getTokenAccountsByOwner response missing value");
  }
  let total = 0;
  for (const account of value) {
    const accountInfo = get(account, "account");
    const data = get(accountInfo, "data");
    const parsed = get(data, "parsed");
    const info = get(parsed, "info");
    const tokenAmount = get(info, "tokenAmount");
    const uiAmount = get(tokenAmount, "uiAmount");
    total += toNumber(uiAmount, 0);
  }
  return total;
}

export async function getPosition(
  address: string,
  mint: string,
  priceUsd: number
): Promise<DataResult<Position>> {
  const rpcUrl = serverEnv.alchemyRpcUrl;
  if (isPlaceholder(rpcUrl)) {
    return { data: mockPosition(), degraded: true };
  }
  try {
    const [balanceResult, tokenAccountsResult] = await Promise.all([
      rpcCall(rpcUrl!, "getBalance", [address]),
      rpcCall(rpcUrl!, "getTokenAccountsByOwner", [
        address,
        { mint },
        { encoding: "jsonParsed" },
      ]),
    ]);
    const sol = normalizeBalance(balanceResult);
    const tokenAmount = normalizeTokenAmount(tokenAccountsResult);
    return {
      data: { sol, tokenAmount, tokenValueUsd: tokenAmount * priceUsd },
      degraded: false,
    };
  } catch {
    return { data: mockPosition(), degraded: true };
  }
}
