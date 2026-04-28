import { db } from "@/lib/db";
import { ok, unauthorized, serverError } from "@/lib/api/response";
import { verifyCron } from "@/lib/api/cron-auth";
import { brandedEmailHtml, sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Weekly digest. Should be invoked by Vercel cron Sunday 09:00.
 * For every user who logged any activity in the past 7 days and
 * opted-in to email reminders, send a short summary:
 *
 *   - total Energy + xp
 *   - active days / 7
 *   - top exercise
 *   - current streak
 */
export async function GET(req: Request) {
  if (!verifyCron(req)) return unauthorized();
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60_000);

    const candidates = await db.user.findMany({
      where: {
        emailVerified: { not: null },
        reminders: {
          enabled: true,
          emailEnabled: true,
        },
        lastActiveAt: { gte: since },
      },
      select: {
        id: true,
        email: true,
        name: true,
        locale: true,
        currentStreak: true,
        bestStreak: true,
        level: true,
      },
      take: 5000,
    });

    let sent = 0;

    for (const u of candidates) {
      const [agg, perEx, activeDays] = await Promise.all([
        db.activityRecord.aggregate({
          where: { userId: u.id, recordedAt: { gte: since } },
          _sum: { energy: true, xp: true, kcal: true },
          _count: { _all: true },
        }),
        db.activityRecord.groupBy({
          by: ["exerciseId"],
          where: { userId: u.id, recordedAt: { gte: since } },
          _sum: { amount: true, energy: true },
          orderBy: { _sum: { energy: "desc" } },
          take: 1,
        }),
        db.activityRecord.findMany({
          where: { userId: u.id, recordedAt: { gte: since } },
          select: { recordedAt: true },
        }),
      ]);

      const energy = agg._sum.energy ?? 0;
      if (energy === 0 || agg._count._all === 0) continue;

      const days = new Set(
        activeDays.map((r) => r.recordedAt.toISOString().slice(0, 10)),
      ).size;
      const top = perEx[0]?.exerciseId ?? null;

      const subject =
        u.locale === "en"
          ? `Your week on FitStreak`
          : `Твоя неделя на FitStreak`;
      const html = brandedEmailHtml(subject, {
        preheader:
          u.locale === "en"
            ? `${energy} ES this week · ${days}/7 active days`
            : `${energy} ES за неделю · ${days}/7 активных дней`,
        greeting:
          u.locale === "en"
            ? `Hi ${u.name?.split(" ")[0] ?? "there"}`
            : `Привет, ${u.name?.split(" ")[0] ?? "атлет"}`,
        body:
          u.locale === "en"
            ? `<table style="width:100%;border-collapse:separate;border-spacing:0 8px;">
              ${row("Energy", `${energy} ES`)}
              ${row("XP gained", `+${agg._sum.xp ?? 0}`)}
              ${row("Active days", `${days} / 7`)}
              ${row("Current streak", `${u.currentStreak} days`)}
              ${top ? row("Top exercise", String(top)) : ""}
            </table>`
            : `<table style="width:100%;border-collapse:separate;border-spacing:0 8px;">
              ${row("Energy", `${energy} ES`)}
              ${row("XP", `+${agg._sum.xp ?? 0}`)}
              ${row("Активных дней", `${days} / 7`)}
              ${row("Серия", `${u.currentStreak} дн.`)}
              ${top ? row("Любимое упражнение", String(top)) : ""}
            </table>`,
        ctaLabel:
          u.locale === "en"
            ? "Open dashboard →"
            : "Открыть дашборд →",
        ctaHref: "https://fitstreak.ru/dashboard",
      });
      const text =
        u.locale === "en"
          ? `Energy ${energy} ES, ${days}/7 active days, streak ${u.currentStreak}.`
          : `Energy ${energy} ES, ${days}/7 активных дней, серия ${u.currentStreak} дн.`;
      const r = await sendEmail({ to: u.email, subject, text, html });
      if (r.ok) sent++;
    }

    return ok({ candidates: candidates.length, sent });
  } catch (error) {
    return serverError(error);
  }
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#a8b3b9;">${label}</td>
    <td style="padding:6px 0;text-align:right;color:#bdfb4d;font-weight:700;">${value}</td>
  </tr>`;
}
