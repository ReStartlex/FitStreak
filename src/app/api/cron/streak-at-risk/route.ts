import { db } from "@/lib/db";
import { ok, unauthorized, serverError } from "@/lib/api/response";
import { verifyCron } from "@/lib/api/cron-auth";
import { createNotification } from "@/lib/notifications";
import { brandedEmailHtml, sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STREAK_MIN = 3;

/**
 * Daily streak-at-risk reminder. Runs late evening (Vercel cron):
 *
 *  - find users with streak >= 3 who haven't been active today
 *  - skip ones already nudged in the last 18h
 *  - drop a notification + transactional email (if enabled) so the
 *    user can save their streak
 */
export async function GET(req: Request) {
  if (!verifyCron(req)) return unauthorized();
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date(Date.now() - 18 * 60 * 60_000);

    const users = await db.user.findMany({
      where: {
        currentStreak: { gte: STREAK_MIN },
        OR: [{ lastActiveAt: null }, { lastActiveAt: { lt: today } }],
      },
      select: {
        id: true,
        email: true,
        name: true,
        currentStreak: true,
        streakFreezes: true,
        locale: true,
        emailVerified: true,
        reminders: { select: { enabled: true, emailEnabled: true } },
      },
      take: 5000,
    });

    let notified = 0;
    let emailed = 0;

    for (const u of users) {
      // De-duplicate: skip if we created an at-risk notification recently.
      const recent = await db.notification.findFirst({
        where: {
          userId: u.id,
          type: "STREAK_AT_RISK",
          createdAt: { gte: cutoff },
        },
        select: { id: true },
      });
      if (recent) continue;

      await createNotification({
        userId: u.id,
        type: "STREAK_AT_RISK",
        data: {
          streak: u.currentStreak,
          freezes: u.streakFreezes,
        },
        // Allow another nudge tomorrow (collapse window = 18h).
        collapseRecentMs: 18 * 60 * 60_000,
      });
      notified++;

      const wantsEmail =
        u.emailVerified &&
        u.reminders &&
        u.reminders.enabled &&
        u.reminders.emailEnabled;
      if (wantsEmail && u.email) {
        const subject =
          u.locale === "en"
            ? `🔥 Save your ${u.currentStreak}-day streak`
            : `🔥 Не теряй серию ${u.currentStreak} дн.`;
        const html = brandedEmailHtml(subject, {
          preheader:
            u.locale === "en"
              ? `One quick activity keeps your streak alive.`
              : "Запиши одну активность — серия останется в живых.",
          greeting:
            u.locale === "en"
              ? `Hi ${u.name?.split(" ")[0] ?? "there"} 👋`
              : `Привет, ${u.name?.split(" ")[0] ?? "атлет"} 👋`,
          body:
            u.locale === "en"
              ? `Today you haven't logged any activity yet. <strong>${u.currentStreak} days in a row</strong> can stay if you spend two minutes now.<br /><br />You also have <strong>${u.streakFreezes}</strong> freeze${u.streakFreezes === 1 ? "" : "s"} as a safety net.`
              : `Сегодня ты ещё ничего не записал. <strong>${u.currentStreak} дн. подряд</strong> останутся, если потратить пару минут прямо сейчас.<br /><br />У тебя есть <strong>${u.streakFreezes}</strong> замороз${u.streakFreezes === 1 ? "ка" : u.streakFreezes < 5 ? "ки" : "ок"} на крайний случай.`,
          ctaLabel:
            u.locale === "en" ? "Save the streak →" : "Сохранить серию →",
          ctaHref: "https://fitstreak.ru/dashboard",
        });
        const text =
          u.locale === "en"
            ? `Save your ${u.currentStreak}-day streak: https://fitstreak.ru/dashboard`
            : `Сохрани серию ${u.currentStreak} дн.: https://fitstreak.ru/dashboard`;
        const r = await sendEmail({ to: u.email, subject, text, html });
        if (r.ok) emailed++;
      }
    }

    return ok({ scanned: users.length, notified, emailed });
  } catch (error) {
    return serverError(error);
  }
}
