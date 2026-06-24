import { getHolders } from "@/lib/birdeye";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;
  return Response.json(await getHolders(mint));
}
