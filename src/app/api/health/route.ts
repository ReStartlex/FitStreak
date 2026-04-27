import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  let dbOk = false;
  try {
    await db.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }
  return Response.json({
    ok: dbOk,
    env: {
      database: env.hasDatabase,
      auth: env.hasAuthSecret,
      oauth: env.oauth,
      resend: env.resend.enabled,
    },
    time: new Date().toISOString(),
  });
}
