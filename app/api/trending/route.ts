import { getTrending } from "@/lib/birdeye";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getTrending());
}
