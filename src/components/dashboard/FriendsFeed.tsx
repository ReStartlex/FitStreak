"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Flame } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useI18n } from "@/lib/i18n/provider";
import { EXERCISES, exerciseUnitLabel } from "@/lib/mock/exercises";

interface FeedItem {
  id: string;
  exerciseId: string;
  amount: number;
  energy: number;
  xp: number;
  recordedAt: string;
  user: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    currentStreak: number;
  };
}

function relTime(iso: string, locale: "ru" | "en"): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.max(1, Math.round(ms / 60_000));
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  if (locale === "ru") {
    if (min < 60) return `${min} мин`;
    if (hr < 24) return `${hr} ч`;
    return `${day} дн.`;
  }
  if (min < 60) return `${min}m`;
  if (hr < 24) return `${hr}h`;
  return `${day}d`;
}

/**
 * Recent activity from the people you follow. Hidden when you follow
 * no one yet (replaced by a soft "find friends" CTA).
 */
export function FriendsFeed() {
  const { locale } = useI18n();
  const [items, setItems] = React.useState<FeedItem[] | null>(null);

  React.useEffect(() => {
    let alive = true;
    fetch("/api/feed/friends", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items: FeedItem[] }) => {
        if (alive) setItems(d.items ?? []);
      })
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  if (items === null) {
    return (
      <div className="surface p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="size-4 text-violet-soft" />
          <h3 className="font-display text-base font-semibold">
            {locale === "ru" ? "Друзья" : "Friends"}
          </h3>
        </div>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-12 rounded-xl bg-white/[0.03] border border-line animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="surface p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <Users className="size-4 text-violet-soft" />
          <h3 className="font-display text-base font-semibold">
            {locale === "ru" ? "Друзья" : "Friends"}
          </h3>
        </div>
        <p className="text-sm text-ink-muted mb-4">
          {locale === "ru"
            ? "Подпишись на других — увидишь их активность в реальном времени."
            : "Follow others — see their activity here in real time."}
        </p>
        <Link
          href="/leaderboard"
          className="text-sm text-lime hover:text-lime/80 inline-flex items-center gap-1"
        >
          {locale === "ru" ? "Найти атлетов →" : "Find athletes →"}
        </Link>
      </div>
    );
  }

  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-violet-soft" />
          <h3 className="font-display text-base font-semibold">
            {locale === "ru" ? "Друзья" : "Friends"}
          </h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-ink-muted">
          {locale === "ru" ? "за 7 дней" : "last 7 days"}
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {items.slice(0, 8).map((it, i) => {
          const ex = EXERCISES.find((e) => e.id === it.exerciseId);
          const unit = ex ? exerciseUnitLabel(ex, locale) : "";
          const exName = ex
            ? locale === "ru"
              ? ex.nameRu
              : ex.nameEn
            : it.exerciseId;
          return (
            <motion.li
              key={it.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              className="rounded-xl hover:bg-white/[0.03] px-2 py-2"
            >
              <Link
                href={
                  it.user.username ? `/u/${it.user.username}` : "/leaderboard"
                }
                className="flex items-center gap-3"
              >
                <Avatar
                  name={it.user.name}
                  src={it.user.image ?? undefined}
                  size={36}
                  tone={it.user.currentStreak >= 30 ? "lime" : "default"}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-medium">{it.user.name}</span>{" "}
                    <span className="text-ink-dim">
                      +{it.amount} {unit} · {exName}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-muted flex items-center gap-2">
                    <span>{relTime(it.recordedAt, locale)}</span>
                    <span className="text-lime/80 number-tabular">
                      +{it.energy} ES
                    </span>
                    {it.user.currentStreak > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-accent-orange">
                        <Flame className="size-3" />
                        <span className="number-tabular">
                          {it.user.currentStreak}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
