import { getQuote } from "@/lib/jupiter";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { inputMint, outputMint, amount, slippageBps } = body ?? {};

  if (typeof inputMint !== "string" || typeof outputMint !== "string" || amount === undefined) {
    return Response.json(
      { error: "inputMint, outputMint, and amount are required" },
      { status: 400 }
    );
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    return Response.json({ error: "amount must be a number" }, { status: 400 });
  }

  const numericSlippageBps =
    slippageBps === undefined ? undefined : Number(slippageBps);

  return Response.json(
    await getQuote(
      inputMint,
      outputMint,
      numericAmount,
      Number.isFinite(numericSlippageBps) ? numericSlippageBps : undefined
    )
  );
}
