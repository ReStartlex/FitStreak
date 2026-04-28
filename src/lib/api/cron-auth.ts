import { env } from "@/lib/env";

/**
 * Validates a Vercel-cron request:
 *   1. `Authorization: Bearer $CRON_SECRET` (set as Vercel env var)
 *   2. or the special `x-vercel-cron` header that Vercel injects on
 *      its scheduler invocations (gives extra safety in case the
 *      secret is missing in dev).
 *
 * Returns true if the request is authentic.
 */
export function verifyCron(req: Request): boolean {
  const auth = req.headers.get("authorization") ?? "";
  if (env.CRON_SECRET && auth === `Bearer ${env.CRON_SECRET}`) return true;
  // Vercel sends this header on scheduled invocations.
  if (req.headers.get("x-vercel-cron") === "1") return true;
  return false;
}
