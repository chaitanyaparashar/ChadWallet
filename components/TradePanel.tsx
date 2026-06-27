"use client";

import { useEffect, useRef, useState } from "react";
import { useWallets } from "@privy-io/react-auth/solana";
import { apiPost } from "@/lib/api-client";
import { useAuth } from "@/lib/hooks/useAuth";
import { isPlaceholder, publicEnv } from "@/lib/env";
import type { SwapQuote, TokenOverview } from "@/types";

const PLACEHOLDER_MODE = isPlaceholder(publicEnv.privyAppId);

const SOL_MINT = "So11111111111111111111111111111111111111112";
const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";

const QUOTE_DEBOUNCE_MS = 300;

type Side = "buy" | "sell";

/**
 * Wraps `useWallets` from `@privy-io/react-auth/solana`, which throws when no
 * real `PrivyProvider` is mounted (placeholder mode — see
 * `PrivyProviderWrapper`). Mirrors the `PLACEHOLDER_MODE` gating pattern used
 * by `useAuth()` so this component is safe to render with no Privy provider
 * in the tree.
 *
 * Signing goes through the wallet object's own `signTransaction` method
 * (the wallet-standard `solana:signTransaction` feature) rather than the
 * separate `useSignTransaction` hook — that hook's module pulls in
 * `@solana-program/memo`, which isn't installed and breaks the build.
 */
function useTradeWallet(): {
  address: string | undefined;
  signTransaction: (transaction: Uint8Array) => Promise<Uint8Array>;
} {
  if (PLACEHOLDER_MODE) {
    return {
      address: undefined,
      signTransaction: async () => {
        throw new Error("No wallet available in placeholder mode");
      },
    };
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks -- see above
  const { wallets } = useWallets();
  const wallet = wallets[0];

  return {
    address: wallet?.address,
    signTransaction: async (transaction: Uint8Array) => {
      if (!wallet) {
        throw new Error("No connected Solana wallet");
      }
      const { signedTransaction } = await wallet.signTransaction({ transaction });
      return signedTransaction;
    },
  };
}

function formatTokenAmount(raw: string): string {
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(n);
}

/**
 * Buy/Sell swap panel for the trade page's right column. Debounces the
 * amount input into a Jupiter quote request, and — when authenticated and
 * not in degraded/mock mode — builds, signs, and sends the swap transaction.
 *
 * Stays fully interactive (toggle, input, quote) in the default shipped
 * mock/degraded mode, but never attempts a real on-chain send in that mode;
 * it shows a "Demo mode" message on action instead.
 */
export function TradePanel({ mint, overview }: { mint: string; overview: TokenOverview | null }) {
  const { ready, authenticated, solanaAddress, login } = useAuth();
  const { signTransaction } = useTradeWallet();

  const [side, setSide] = useState<Side>("buy");
  const [amount, setAmount] = useState("1");
  const [fetchedQuote, setFetchedQuote] = useState<SwapQuote | null>(null);
  const [fetchedQuoteRaw, setFetchedQuoteRaw] = useState<unknown>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<"idle" | "pending">("idle");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const numericAmount = Number(amount);
  const canQuote = Number.isFinite(numericAmount) && numericAmount > 0;

  useEffect(() => {
    if (!canQuote) {
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const requestId = ++requestIdRef.current;
    debounceRef.current = setTimeout(() => {
      const inputMint = side === "buy" ? SOL_MINT : mint;
      const outputMint = side === "buy" ? mint : SOL_MINT;

      setQuoteLoading(true);
      setQuoteError(null);

      apiPost<SwapQuote>("/api/swap/quote", {
        inputMint,
        outputMint,
        amount: Math.round(numericAmount),
      })
        .then((result) => {
          if (requestId !== requestIdRef.current) return;
          setFetchedQuote(result.data);
          setFetchedQuoteRaw(result.data);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setFetchedQuote(null);
          setFetchedQuoteRaw(null);
          setQuoteError("Couldn't fetch a quote. Try again.");
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          setQuoteLoading(false);
        });
    }, QUOTE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- numericAmount is derived from amount, already a dep
  }, [canQuote, amount, side, mint]);

  // An invalid/empty amount means no quote applies — ignore any stale
  // fetched quote from before rather than resetting state inside the effect.
  const quote = canQuote ? fetchedQuote : null;
  const quoteRaw = canQuote ? fetchedQuoteRaw : null;

  async function handleAction() {
    if (!solanaAddress || !quoteRaw) return;

    setActionState("pending");
    setActionMessage(null);

    try {
      const buildResult = await apiPost<{ swapTransaction: string }>("/api/swap/build", {
        quoteRaw,
        userPublicKey: solanaAddress,
      });

      if (buildResult.degraded) {
        setActionMessage("Demo mode — connect real keys to trade");
        setActionState("idle");
        return;
      }

      // Heavy web3 deps are dynamic-imported here so they never bloat (or
      // break) SSR — this code path only runs client-side, on click, and
      // only once we know we're not in degraded/mock mode.
      const { VersionedTransaction, Connection } = await import("@solana/web3.js");

      const txBytes = Uint8Array.from(Buffer.from(buildResult.data.swapTransaction, "base64"));
      const transaction = VersionedTransaction.deserialize(txBytes);

      const signedBytes = await signTransaction(transaction.serialize());
      const signedTransaction = VersionedTransaction.deserialize(signedBytes);

      const connection = new Connection(SOLANA_RPC_URL, "confirmed");
      const signature = await connection.sendTransaction(signedTransaction);

      setActionMessage(`Swap submitted — signature ${signature.slice(0, 8)}...${signature.slice(-8)}`);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Swap failed. Try again.");
    } finally {
      setActionState("idle");
    }
  }

  const symbol = overview?.symbol ?? "TOKEN";

  return (
    <div data-testid="trade-panel" className="cw-card flex flex-col gap-4 p-4 text-sm">
      <div className="flex rounded-lg border border-border p-1">
        <button
          type="button"
          data-testid="trade-side-buy"
          onClick={() => setSide("buy")}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
            side === "buy" ? "bg-accent text-accent-foreground" : "cw-text-muted hover:text-foreground"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          data-testid="trade-side-sell"
          onClick={() => setSide("sell")}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
            side === "sell" ? "bg-danger text-foreground" : "cw-text-muted hover:text-foreground"
          }`}
        >
          Sell
        </button>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs cw-text-muted">
          Amount ({side === "buy" ? "SOL" : symbol})
        </span>
        <input
          type="number"
          min="0"
          step="any"
          data-testid="trade-amount-input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="cw-num rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
        />
      </label>

      <div data-testid="trade-quote" className="flex flex-col gap-1 rounded-md border border-border p-3 text-xs">
        {!canQuote && <span className="cw-text-muted">Enter an amount to see a quote.</span>}
        {canQuote && quoteLoading && <span className="cw-text-muted">Fetching quote…</span>}
        {canQuote && !quoteLoading && quoteError && <span className="cw-text-down">{quoteError}</span>}
        {canQuote && !quoteLoading && !quoteError && quote && (
          <>
            <div className="flex items-center justify-between">
              <span className="cw-text-muted">You receive</span>
              <span className="cw-num text-foreground">
                {formatTokenAmount(quote.outAmount)} {side === "buy" ? symbol : "SOL"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="cw-text-muted">Price impact</span>
              <span className="cw-num text-foreground">{quote.priceImpactPct.toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="cw-text-muted">Min received</span>
              <span className="cw-num text-foreground">{formatTokenAmount(quote.minReceived)}</span>
            </div>
          </>
        )}
      </div>

      {!ready ? (
        <div className="h-10 w-full animate-pulse rounded-md bg-border" />
      ) : !authenticated ? (
        <button
          type="button"
          data-testid="trade-signin"
          onClick={() => login()}
          className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:opacity-90"
        >
          Sign in to trade
        </button>
      ) : (
        <button
          type="button"
          data-testid="trade-action"
          disabled={!quoteRaw || actionState === "pending"}
          onClick={handleAction}
          className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            side === "buy"
              ? "bg-accent text-accent-foreground hover:opacity-90"
              : "bg-danger text-foreground hover:opacity-90"
          }`}
        >
          {actionState === "pending" ? "Submitting…" : side === "buy" ? `Buy ${symbol}` : `Sell ${symbol}`}
        </button>
      )}

      {actionMessage && (
        <p data-testid="trade-action-message" className="text-xs cw-text-muted">
          {actionMessage}
        </p>
      )}
    </div>
  );
}
