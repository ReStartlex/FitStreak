"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, Medal, Trophy, Filter, Loader2 } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/cn";
import { divisionName, getDivision, getTierTheme } from "@/lib/ranks";

type Metric = "energy" | "level" | "xp";
type Range = "day" | "week";
type Scope = "global" | "friends" | "men" | "women" | "age" | "fitness";

interface ApiRow {
  rank: number;
  userId: string;
  name: string;
  username?: string | null;
  avatar?: string | null;
  level: number;
  xp: number;
  energy: number;
  streak?: number;
  isMe?: boolean;
}

export default function LeaderboardPage() {
  const { t, locale } = useI18n();

  const [metric, setMetric] = React.useState<Metric>("energy");
  const [range, setRange] = React.useState<Range>("day");
  const [scope, setScope] = React.useState<Scope>("global");

  const [rows, setRows] = React.useState<ApiRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ metric, range, scope, limit: "100" });
    fetch(`/api/leaderboard?${params}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        setRows(json?.rows ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setError("error");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [metric, range, scope]);

  const me = rows.find((r) => r.isMe);
  const ahead = me && me.rank > 1 ? rows[me.rank - 2] : undefined;
  const valueOf = (r: ApiRow) =>
    metric === "level" ? r.level : metric === "xp" ? r.xp : r.energy;
  const valueLabel =
    metric === "level"
      ? t.common.level.toLowerCase()
      : metric === "xp"
        ? "XP"
        : t.scoring.energyShort;

  return (
    <>
      <Header />
      <main className="container py-8 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-display-md sm:text-display-lg font-bold">
            {t.leaderboard.title}
          </h1>
          <p className="text-ink-dim mt-2 max-w-2xl">
            {t.leaderboard.subtitle}
          </p>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 mask-fade-r">
          <div className="flex items-center gap-3 flex-wrap">
            <Tabs<Metric>
              items={[
                { id: "energy", label: t.leaderboard.metricEnergy },
                { id: "level", label: t.leaderboard.metricLevel },
                { id: "xp", label: t.leaderboard.metricXp },
              ]}
              value={metric}
              onChange={setMetric}
            />
            {metric === "energy" && (
              <Tabs<Range>
                items={[
                  { id: "day", label: t.leaderboard.tabDay },
                  { id: "week", label: t.leaderboard.tabWeek },
                ]}
                value={range}
                onChange={setRange}
                size="sm"
              />
            )}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted uppercase tracking-widest pt-2">
            <Filter className="size-3.5" />
            {locale === "ru" ? "фильтр" : "filter"}
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "global", label: t.leaderboard.filterAll },
                { id: "friends", label: t.leaderboard.filterFriends },
                { id: "men", label: t.leaderboard.filterMen },
                { id: "women", label: t.leaderboard.filterWomen },
                { id: "age", label: t.leaderboard.filterMyAge },
                { id: "fitness", label: t.leaderboard.filterMyFitness },
              ] as { id: Scope; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setScope(opt.id)}
                className={cn(
                  "rounded-full border px-3 h-8 text-xs transition-colors",
                  scope === opt.id
                    ? "border-lime/60 bg-lime/15 text-lime"
                    : "border-line bg-white/[0.02] text-ink-dim hover:border-line-strong",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="surface p-10 mt-8 text-center text-ink-muted">
            <Loader2 className="inline size-5 animate-spin mr-2" />
            {locale === "ru" ? "Загружаем рейтинг…" : "Loading leaderboard…"}
          </div>
        )}

        {!loading && error && (
          <div className="surface p-10 mt-8 text-center text-rose">
            {locale === "ru" ? "Ошибка загрузки" : "Failed to load"}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="surface p-10 mt-8 text-center text-ink-muted">
            {locale === "ru"
              ? "В этой категории пока никого нет — будь первым!"
              : "No one here yet — be the first!"}
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <>
            {rows.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8">
                {[1, 0, 2].map((idx) => {
                  const row = rows[idx];
                  if (!row) return null;
                  const heights = ["h-32 sm:h-40", "h-44 sm:h-56", "h-28 sm:h-36"];
                  const positions = [1, 0, 2];
                  const i = positions.indexOf(idx);
                  const place = idx === 0 ? 1 : idx === 1 ? 2 : 3;
                  return (
                    <motion.div
                      key={row.userId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex flex-col items-center justify-end"
                    >
                      <Avatar
                        name={row.name}
                        size={48}
                        tone={place === 1 ? "lime" : place === 2 ? "violet" : "rose"}
                        src={row.avatar ?? undefined}
                      />
                      <div className="mt-2 text-center">
                        <div className="text-sm font-medium truncate max-w-[120px]">
                          {row.name}
                        </div>
                        <div className="text-xs text-ink-muted number-tabular">
                          {formatNumber(valueOf(row), locale)} {valueLabel}
                        </div>
                        {row.streak != null && row.streak > 0 && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-accent-orange">
                            <span aria-hidden>🔥</span>
                            <span className="number-tabular">{row.streak}</span>
                            <span className="text-ink-muted">
                              {locale === "ru" ? "дн" : "d"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div
                        className={cn(
                          "mt-3 w-full rounded-t-2xl border-b-0 grid place-items-start pt-3 sm:pt-4 relative overflow-hidden",
                          heights[i],
                          place === 1
                            ? "bg-gradient-to-t from-lime/60 to-lime/15 border border-lime/40 shadow-glow"
                            : place === 2
                              ? "bg-gradient-to-t from-violet/40 to-violet/10 border border-violet/30"
                              : "bg-gradient-to-t from-accent-rose/35 to-accent-rose/10 border border-accent-rose/30",
                        )}
                      >
                        <div className="w-full text-center font-display font-bold text-3xl sm:text-4xl text-bg drop-shadow">
                          {place === 1 ? (
                            <Crown className="inline size-7" />
                          ) : place === 2 ? (
                            <Trophy className="inline size-7" />
                          ) : (
                            <Medal className="inline size-7" />
                          )}
                        </div>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-display font-bold text-2xl sm:text-3xl text-ink/90">
                          {place}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div className="surface p-2 sm:p-4 mt-6">
              <ul className="flex flex-col gap-1">
                {rows.slice(rows.length >= 3 ? 3 : 0).map((row, i) => (
                  <LeaderRowItem
                    key={row.userId}
                    row={row}
                    index={i}
                    metric={metric}
                  />
                ))}
              </ul>
            </div>

            {me && (
              <div className="surface p-5 sm:p-6 mt-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 size-72 rounded-full bg-lime/15 blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-4 flex-wrap">
                  <Badge variant="lime" className="text-xs">
                    {t.leaderboard.youAreHere}
                  </Badge>
                  <div className="flex items-center gap-3">
                    <Avatar name={me.name} size={44} tone="lime" src={me.avatar ?? undefined} />
                    <div>
                      <div className="font-display font-semibold">{me.name}</div>
                      {me.username && (
                        <div className="text-xs text-ink-muted">@{me.username}</div>
                      )}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-5 flex-wrap">
                    <div className="text-right">
                      <div className="text-xs text-ink-muted uppercase">{t.common.rank}</div>
                      <div className="font-display font-bold text-xl">#{me.rank}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-ink-muted uppercase">{valueLabel}</div>
                      <div className="font-display font-bold text-xl number-tabular">
                        {formatNumber(valueOf(me), locale)}
                      </div>
                    </div>
                    {ahead && (
                      <div className="text-right">
                        <div className="text-xs text-ink-muted uppercase">
                          {t.leaderboard.gapToNext}
                        </div>
                        <div className="font-display font-bold text-xl number-tabular text-lime">
                          +
                          {formatNumber(
                            Math.max(1, valueOf(ahead) - valueOf(me) + 1),
                            locale,
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

function LeaderRowItem({
  row,
  index,
  metric,
}: {
  row: ApiRow;
  index: number;
  metric: Metric;
}) {
  const { t, locale } = useI18n();
  const division = getDivision(row.level);
  const tierTheme = getTierTheme(division.tier);
  const TierIcon = tierTheme.icon;
  const value = metric === "level" ? row.level : metric === "xp" ? row.xp : row.energy;
  const valueLabel =
    metric === "level"
      ? t.common.level.toLowerCase()
      : metric === "xp"
        ? "XP"
        : t.scoring.energyShort;

  const inner = (
    <>
      <span className="number-tabular w-8 text-center text-ink-muted text-sm font-medium">
        #{row.rank}
      </span>
      <Avatar
        name={row.name}
        size={36}
        tone={row.isMe ? "lime" : "default"}
        src={row.avatar ?? undefined}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate flex items-center gap-2">
          {row.name}
          {row.isMe && (
            <span className="text-xs text-lime">
              {locale === "ru" ? "ты" : "you"}
            </span>
          )}
        </div>
        <div className="text-xs text-ink-muted flex items-center gap-2">
          {row.username && <span>@{row.username}</span>}
          <span className={cn("inline-flex items-center gap-1", tierTheme.textClass)}>
            <TierIcon className="size-3" />
            {divisionName(division, locale)}
          </span>
        </div>
      </div>
      {row.streak != null && row.streak > 0 && (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 h-7 rounded-full border text-xs font-medium tabular-nums",
            row.streak >= 100
              ? "border-accent-rose/50 bg-accent-rose/15 text-accent-rose"
              : row.streak >= 30
                ? "border-accent-orange/50 bg-accent-orange/15 text-accent-orange"
                : row.streak >= 7
                  ? "border-lime/50 bg-lime/12 text-lime"
                  : "border-line bg-white/[0.04] text-ink-dim",
          )}
          title={t.streak.title}
        >
          <span aria-hidden>🔥</span>
          {row.streak}
        </span>
      )}
      <div className="text-right min-w-[88px]">
        <div className="font-display font-bold number-tabular">
          {formatNumber(value, locale)}
          <span className="text-[10px] text-ink-muted ml-0.5 font-sans font-normal">
            {valueLabel}
          </span>
        </div>
      </div>
    </>
  );

  const className = cn(
    "flex items-center gap-3 sm:gap-4 px-3 py-2.5 transition-colors",
    row.isMe
      ? "bg-lime/8 border border-lime/30 rounded-xl"
      : "hover:bg-white/[0.03] rounded-xl",
  );

  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay: Math.min(0.5, index * 0.02) }}
      className="list-none"
    >
      {row.username ? (
        <Link href={`/u/${row.username}`} className={className}>
          {inner}
        </Link>
      ) : (
        <div className={className}>{inner}</div>
      )}
    </motion.li>
  );
}
