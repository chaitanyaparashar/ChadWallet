export interface Token {
  mint: string;
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
  logoURI?: string;
}

export interface TokenOverview extends Token {
  marketCap: number;
  volume24h: number;
  liquidity: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Holder {
  owner: string;
  amount: number;
  percentage: number;
}

export interface Trade {
  txHash: string;
  side: "buy" | "sell";
  amountUsd: number;
  tokenAmount: number;
  priceUsd: number;
  timestamp: number;
  owner: string;
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  minReceived: string;
}

export interface Position {
  sol: number;
  tokenAmount: number;
  tokenValueUsd: number;
}

export interface DataResult<T> {
  data: T;
  degraded: boolean;
}
