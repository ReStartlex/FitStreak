import { auth } from "@/lib/auth";

/**
 * Returns true when the currently authenticated user is listed in the
 * `ADMIN_EMAILS` env var (comma-separated). This is intentionally
 * small — full role/permission management would land in the User
 * schema later. For now, an env list is enough to expose a moderation
 * surface to the founders.
 */
export async function isAdmin(): Promise<{
  ok: boolean;
  userId: string | null;
  email: string | null;
}> {
  const session = await auth();
  const email = session?.user?.email ?? null;
  const userId = session?.user?.id ?? null;
  if (!email || !userId) return { ok: false, userId, email };
  const raw = process.env.ADMIN_EMAILS ?? "";
  const allow = new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  return { ok: allow.has(email.toLowerCase()), userId, email };
}
