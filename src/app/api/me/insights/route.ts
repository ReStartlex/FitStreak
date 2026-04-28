import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, unauthorized, serverError } from "@/lib/api/response";
import { startOfToday } from "@/lib/api/activity-service";
import { calcDailyGoal } from "@/lib/goals";

function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

/** Monday-based week (matches our streak/scoring contract). */
function startOfWeekMonday(d: Date): Date {
  const r = new Date(d);
  // ISO weekday: Mon=1..Sun=7
  const day = r.getDay() === 0 ? 7 : r.getDay();
  r.setDate(r.getDate() - (day - 1));
  r.setHours(0, 0, 0, 0);
  return r;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Insight {
  /** Stable key so the UI can pick the right icon/colour. */
  kind:
    | "WEEK_TREND"
    | "BEST_DAY"
    | "STREAK_RISK"
    | "STREAK_PUSH"
    | "GOAL_PACE"
    | "EXERCISE_FAVORITE"
    | "REST_DAY"
    | "MOMENTUM"
    | "WELCOME";
  /** Severity / colour bucket. */
  tone: "good" | "info" | "warn";
  /** Short headline (i18n done client-side via tone+kind+payload). */
  ru: string;
  en: string;
  /** Optional secondary line. */
  subRu?: string;
  subEn?: string;
}

/**
 * Generates 1–3 actionable insights based on the last 14 days of
 * activity. Pure compute — no schema changes. Examples:
 *
 *   - "Эта неделя на +18% энергичнее прошлой"
 *   - "Не забудь отметить активность сегодня — иначе серия 12 дней
 *      сгорит к полуночи"
 *   - "Ты любишь приседания — 64% энергии за 14 дней"
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();
    const userId = session.user.id;

    const today = startOfToday();
    const weekStart = startOfWeekMonday(today);
    const lastWeekStart = addDays(weekStart, -7);
    const fortnightAgo = addDays(today, -14);

    const [user, last14, todayAgg] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          currentStreak: true,
          bestStreak: true,
          fitnessLevel: true,
          age: true,
          gender: true,
          goal: true,
          weightKg: true,
          createdAt: true,
        },
      }),
      db.activityRecord.findMany({
        where: { userId, recordedAt: { gte: fortnightAgo } },
        select: {
          recordedAt: true,
          energy: true,
          exerciseId: true,
          amount: true,
        },
      }),
      db.activityRecord.aggregate({
        where: { userId, recordedAt: { gte: today } },
        _sum: { energy: true },
      }),
    ]);

    if (!user) return unauthorized();

    const dailyGoal = calcDailyGoal({
      fitnessLevel: user.fitnessLevel,
      age: user.age,
      gender: user.gender,
      goal: user.goal,
      weightKg: user.weightKg,
    });

    const insights: Insight[] = [];

    // --- WEEK_TREND ---------------------------------------------------------
    let thisWeek = 0;
    let lastWeek = 0;
    for (const r of last14) {
      if (r.recordedAt >= weekStart) thisWeek += r.energy;
      else if (r.recordedAt >= lastWeekStart) lastWeek += r.energy;
    }
    if (lastWeek > 0 && thisWeek > 0) {
      const delta = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
      if (Math.abs(delta) >= 8) {
        insights.push({
          kind: "WEEK_TREND",
          tone: delta >= 0 ? "good" : "warn",
          ru:
            delta >= 0
              ? `Эта неделя на +${delta}% энергичнее прошлой`
              : `На ${Math.abs(delta)}% меньше, чем неделю назад`,
          en:
            delta >= 0
              ? `This week is +${delta}% stronger than last`
              : `${Math.abs(delta)}% below last week's energy`,
          subRu: `${thisWeek} ⚡ vs ${lastWeek} ⚡`,
          subEn: `${thisWeek} ⚡ vs ${lastWeek} ⚡`,
        });
      }
    }

    // --- STREAK_RISK -------------------------------------------------------
    const todayEnergy = todayAgg._sum.energy ?? 0;
    if (user.currentStreak > 0 && todayEnergy === 0) {
      const stake = user.currentStreak;
      insights.push({
        kind: "STREAK_RISK",
        tone: "warn",
        ru: `Серия ${stake} дн. на грани — сделай хоть одну запись сегодня`,
        en: `Your ${stake}-day streak is at risk — log anything before midnight`,
      });
    } else if (user.currentStreak >= 7 && todayEnergy > 0) {
      insights.push({
        kind: "MOMENTUM",
        tone: "good",
        ru: `Серия ${user.currentStreak} дней. Продолжай в том же духе!`,
        en: `${user.currentStreak}-day streak. Keep the momentum!`,
      });
    }

    // --- STREAK_PUSH (close to personal best) ------------------------------
    if (
      user.currentStreak > 0 &&
      user.bestStreak > 0 &&
      user.currentStreak >= user.bestStreak - 2 &&
      user.currentStreak < user.bestStreak
    ) {
      const need = user.bestStreak - user.currentStreak + 1;
      insights.push({
        kind: "STREAK_PUSH",
        tone: "info",
        ru: `Ещё ${need} ${pluralRu(need, "день", "дня", "дней")} — и побьёшь личный рекорд серии`,
        en: `${need} more day${need === 1 ? "" : "s"} to break your streak record`,
      });
    }

    // --- GOAL_PACE --------------------------------------------------------
    if (dailyGoal > 0) {
      const hourMs = Date.now() - today.getTime();
      const hour = Math.floor(hourMs / 3_600_000);
      const pct = Math.round((todayEnergy / dailyGoal) * 100);
      if (hour >= 18 && pct < 60 && pct > 0) {
        insights.push({
          kind: "GOAL_PACE",
          tone: "warn",
          ru: `Сегодня ${pct}% от цели. Час на короткую тренировку решит дело`,
          en: `${pct}% of daily goal so far — a quick session closes the gap`,
        });
      } else if (pct >= 100) {
        insights.push({
          kind: "GOAL_PACE",
          tone: "good",
          ru: "Цель дня закрыта. Каждое следующее упражнение — бонус",
          en: "Daily goal hit. Every rep beyond is a bonus",
        });
      }
    }

    // --- EXERCISE_FAVORITE -------------------------------------------------
    if (last14.length >= 5) {
      const byEx = new Map<string, number>();
      let total = 0;
      for (const r of last14) {
        byEx.set(r.exerciseId, (byEx.get(r.exerciseId) ?? 0) + r.energy);
        total += r.energy;
      }
      let topId: string | null = null;
      let topEnergy = 0;
      for (const [id, e] of byEx.entries()) {
        if (e > topEnergy) {
          topEnergy = e;
          topId = id;
        }
      }
      if (topId && total > 0) {
        const share = Math.round((topEnergy / total) * 100);
        if (share >= 50) {
          insights.push({
            kind: "EXERCISE_FAVORITE",
            tone: "info",
            ru: `${share}% энергии за 2 недели — одно упражнение. Попробуй разнообразить`,
            en: `${share}% of recent energy comes from one exercise — try variety`,
          });
        }
      }
    }

    // --- REST_DAY -----------------------------------------------------------
    if (last14.length === 0) {
      const acctAgeDays =
        (Date.now() - user.createdAt.getTime()) / 86_400_000;
      if (acctAgeDays < 1) {
        insights.push({
          kind: "WELCOME",
          tone: "info",
          ru: "Запиши первую активность — мы посчитаем энергию и заведём серию",
          en: "Log your first activity — we'll start tracking your streak",
        });
      } else {
        insights.push({
          kind: "REST_DAY",
          tone: "info",
          ru: "2 недели тишины. Маленький старт сегодня запустит маховик",
          en: "Two quiet weeks. A small start today restarts the flywheel",
        });
      }
    }

    return ok(
      { insights: insights.slice(0, 3) },
      {
        headers: { "Cache-Control": "private, max-age=60" },
      },
    );
  } catch (error) {
    return serverError(error);
  }
}

function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
