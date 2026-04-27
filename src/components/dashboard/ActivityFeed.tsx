"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { EXERCISES, exerciseUnitLabel } from "@/lib/mock/exercises";
import { calcEnergyScore, calcXP } from "@/lib/scoring";

export interface FeedRecord {
  id: string;
  exerciseId: string;
  amount: number;
  energy?: number;
  xp?: number;
  recordedAt: string | Date;
}

function formatTime(date: Date, locale: "ru" | "en") {
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const time = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const todayLabel = locale === "ru" ? "Сегодня" : "Today";
  const yesterdayLabel = locale === "ru" ? "Вчера" : "Yesterday";
  const day = sameDay
    ? todayLabel
    : isYesterday
      ? yesterdayLabel
      : date.toLocaleDateString(locale, { day: "numeric", month: "short" });
  return `${day} · ${time}`;
}

export function ActivityFeed({ records }: { records?: FeedRecord[] }) {
  const { t, locale } = useI18n();
  const all = records ?? [];

  if (all.length === 0) {
    return (
      <div className="surface p-5 sm:p-6">
        <h3 className="font-display text-base font-semibold mb-1">
          {t.dashboard.historyTitle}
        </h3>
        <p className="text-xs text-ink-dim">{t.dashboard.historySubtitle}</p>
        <div className="mt-6 rounded-xl border border-line bg-white/[0.02] p-6 text-center text-sm text-ink-muted">
          {locale === "ru"
            ? "Пока пусто. Запиши первое действие — здесь появится история."
            : "Nothing yet. Log your first activity to see history here."}
        </div>
      </div>
    );
  }

  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-semibold">
            {t.dashboard.historyTitle}
          </h3>
          <p className="text-xs text-ink-dim">{t.dashboard.historySubtitle}</p>
        </div>
      </div>

      <ul className="flex flex-col gap-1">
        {all.slice(0, 12).map((rec, i) => {
          const ex = EXERCISES.find((e) => e.id === rec.exerciseId);
          if (!ex) return null;
          const Icon = ex.icon;
          const tone = {
            lime: "border-lime/30 text-lime bg-lime/10",
            violet: "border-violet/30 text-violet-soft bg-violet/10",
            rose: "border-accent-rose/30 text-accent-rose bg-accent-rose/10",
            cyan: "border-accent-cyan/30 text-accent-cyan bg-accent-cyan/10",
            orange: "border-accent-orange/30 text-accent-orange bg-accent-orange/10",
          }[ex.tone];

          const unit = exerciseUnitLabel(ex, locale);
          const energy = rec.energy ?? calcEnergyScore(ex.id, rec.amount);
          const xp = rec.xp ?? calcXP(ex.id, rec.amount);
          const dt = typeof rec.recordedAt === "string" ? new Date(rec.recordedAt) : rec.recordedAt;

          return (
            <motion.li
              key={rec.id}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.03]"
            >
              <div className={`size-9 grid place-items-center rounded-xl border ${tone}`}>
                <Icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">
                  +{rec.amount} {unit}{" "}
                  <span className="text-ink-dim font-normal">
                    · {locale === "ru" ? ex.nameRu : ex.nameEn}
                  </span>
                </div>
                <div className="text-xs text-ink-muted flex items-center gap-2 flex-wrap">
                  <span>{formatTime(dt, locale)}</span>
                  <span className="text-lime/80 number-tabular">+{energy} ES</span>
                  <span className="text-violet-soft/80 number-tabular">+{xp} XP</span>
                </div>
              </div>
              <Clock className="size-3.5 text-ink-muted shrink-0" />
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
