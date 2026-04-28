import { NextRequest } from "next/server";

import { listFollowEdges } from "@/lib/api/follow-list";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Params {
  username: string;
}

/** GET /api/users/:username/followers?limit=30&cursor=<followId> */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { username } = await params;
  return listFollowEdges("followers", request, username);
}
