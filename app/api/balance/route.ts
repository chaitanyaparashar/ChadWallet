import { getPosition } from "@/lib/solana";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const address = searchParams.get("address") ?? "";
  const mint = searchParams.get("mint") ?? "";
  const price = Number(searchParams.get("price")) || 0;
  return Response.json(await getPosition(address, mint, price));
}
