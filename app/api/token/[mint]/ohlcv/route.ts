import { getOhlcv } from "@/lib/birdeye";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  const interval = new URL(req.url).searchParams.get("interval") ?? "1H";
  return Response.json(await getOhlcv(mint, interval));
}
