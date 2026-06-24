import { buildSwap } from "@/lib/jupiter";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { quoteRaw, userPublicKey } = body ?? {};

  if (quoteRaw === undefined || typeof userPublicKey !== "string" || userPublicKey.length === 0) {
    return Response.json(
      { error: "quoteRaw and userPublicKey are required" },
      { status: 400 }
    );
  }

  return Response.json(await buildSwap(quoteRaw, userPublicKey));
}
