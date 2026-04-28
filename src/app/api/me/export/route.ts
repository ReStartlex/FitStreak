import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { unauthorized, serverError } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/me/export — CSV export of all activity records for GDPR
 * data portability. Streams a small file with a sane filename.
 *
 * Columns:
 *   recordedAt | exerciseId | amount | energy | xp | kcal | source
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const records = await db.activityRecord.findMany({
      where: { userId: session.user.id },
      orderBy: { recordedAt: "desc" },
      select: {
        recordedAt: true,
        exerciseId: true,
        amount: true,
        energy: true,
        xp: true,
        kcal: true,
        source: true,
      },
    });

    const escape = (v: unknown) => {
      if (v == null) return "";
      const s = String(v);
      // RFC 4180 — quote fields with commas/quotes/newlines
      if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const lines: string[] = [];
    lines.push(
      [
        "recorded_at",
        "exercise_id",
        "amount",
        "energy",
        "xp",
        "kcal",
        "source",
      ].join(","),
    );
    for (const r of records) {
      lines.push(
        [
          escape(r.recordedAt.toISOString()),
          escape(r.exerciseId),
          escape(r.amount),
          escape(r.energy),
          escape(r.xp),
          escape(r.kcal),
          escape(r.source),
        ].join(","),
      );
    }

    const body = lines.join("\n") + "\n";
    const today = new Date().toISOString().slice(0, 10);
    return new Response(body, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="fitstreak-activity-${today}.csv"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
