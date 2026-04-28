import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AchievementsGrid } from "@/components/dashboard/AchievementsGrid";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Achievements — FitStreak",
};

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?from=/achievements");

  // Cheap counts for the hero strip — full grid hydrates client-side.
  const [unlocked, total, latest] = await Promise.all([
    db.userAchievement.count({ where: { userId: session.user.id } }),
    db.achievement.count(),
    db.userAchievement.findFirst({
      where: { userId: session.user.id },
      orderBy: { lastEarnedAt: "desc" },
      include: { achievement: true },
    }),
  ]);

  const completion = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <>
      <Header />
      <main className="container py-8 sm:py-12 max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-display-md font-bold mb-2">
            Achievements
          </h1>
          <p className="text-ink-dim">
            Каждая ачивка — отдельный челлендж. Получай уровни, серии и
            пробивай личные пороги.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Stat label="Открыто" value={`${unlocked}/${total}`} />
          <Stat label="Прогресс" value={`${completion}%`} />
          <Stat
            label="Последняя"
            value={
              latest?.achievement
                ? latest.achievement.titleRu ?? latest.achievement.titleEn
                : "—"
            }
          />
          <Stat
            label="Получено"
            value={latest?.lastEarnedAt
              ? new Date(latest.lastEarnedAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                })
              : "—"}
          />
        </div>

        <AchievementsGrid />
      </main>
      <Footer />
    </>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
      <div className="text-[10px] uppercase tracking-widest text-ink-muted">
        {label}
      </div>
      <div className="mt-1 font-display text-xl sm:text-2xl font-bold truncate">
        {value}
      </div>
    </div>
  );
}
