"use client";

import * as React from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/lib/format";

export interface LeaderRow {
  rank: number;
  userId: string;
  name: string;
  avatar?: string | null;
  level: number;
  energy: number;
  isMe?: boolean;
}

export function MiniLeaderboard({
  rows,
  myUserId,
}: {
  rows?: LeaderRow[];
  myUserId?: string | null;
}) {
  const { t, locale } = useI18n();
  const [data, setData] = React.useState<LeaderRow[] | null>(rows ?? null);
  const [loading, setLoading] = React.useState(!rows);

  React.useEffect(() => {
    if (rows) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/leaderboard?metric=energy&range=day&limit=8")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const apiRows = (json?.rows ?? []) as Array<LeaderRow & { isMe?: boolean }>;
        setData(apiRows);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [rows]);

  const list = (data ?? []).map((r) => ({
    ...r,
    isMe: r.isMe || (myUserId ? r.userId === myUserId : false),
  }));
  const meIdx = list.findIndex((r) => r.isMe);
  const window =
    meIdx >= 0
      ? list.slice(Math.max(0, meIdx - 2), meIdx + 3)
      : list.slice(0, 5);
  const me = meIdx >= 0 ? list[meIdx] : null;
  const ahead = meIdx > 0 ? list[meIdx - 1] : null;
  const energyToNext = ahead && me ? Math.max(1, ahead.energy - me.energy + 1) : 0;

  return (
    <div className="surface p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-lime" />
          <div>
            <h3 className="font-display text-base font-semibold">
              {t.dashboard.leaderTitle}
            </h3>
            <p className="text-xs text-ink-dim">{t.dashboard.leaderSubtitle}</p>
          </div>
        </div>
        <Link href="/leaderboard">
          <Button size="sm" variant="ghost">
            {t.common.seeAll}
          </Button>
        </Link>
      </div>

      {loading && list.length === 0 && (
        <div className="rounded-xl border border-line bg-white/[0.02] p-4 text-center text-sm text-ink-muted">
          {locale === "ru" ? "Загружаем рейтинг…" : "Loading leaderboard…"}
        </div>
      )}

      {!loading && list.length === 0 && (
        <div className="rounded-xl border border-line bg-white/[0.02] p-4 text-center text-sm text-ink-muted">
          {locale === "ru"
            ? "Пока никто не записал активность сегодня."
            : "Nobody has logged activity yet today."}
        </div>
      )}

      <ul className="flex flex-col gap-1">
        {window.map((row) => (
          <li
            key={row.userId}
            className={`flex items-center gap-3 rounded-xl px-2 py-2 transition-colors ${
              row.isMe
                ? "bg-lime/8 border border-lime/30"
                : "hover:bg-white/[0.03]"
            }`}
          >
            <span className="number-tabular w-6 text-center text-ink-muted text-sm">
              {row.rank}
            </span>
            <Avatar
              name={row.name}
              size={32}
              tone={row.isMe ? "lime" : "default"}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {row.name}
                {row.isMe && (
                  <span className="ml-2 text-xs text-lime">
                    {locale === "ru" ? "ты" : "you"}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-ink-muted">
                {t.common.level} {row.level}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display font-bold number-tabular text-sm">
                {formatNumber(row.energy, locale)}
                <span className="text-[10px] text-ink-muted ml-0.5 font-sans font-normal">
                  {t.scoring.energyShort}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {ahead && me && (
        <div className="mt-4 rounded-xl border border-lime/30 bg-lime/8 p-3 text-sm">
          <span className="text-ink-dim">{t.leaderboard.toNext}: </span>
          <span className="font-display font-bold text-lime number-tabular">
            +{energyToNext} {t.scoring.energyShort}
          </span>{" "}
          <span className="text-ink-dim">
            {locale === "ru" ? "до" : "to"} #{ahead.rank}
          </span>
        </div>
      )}
    </div>
  );
}
