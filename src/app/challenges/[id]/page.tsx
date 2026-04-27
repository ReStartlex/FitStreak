"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, Award, Clock, Users, ListChecks } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useI18n } from "@/lib/i18n/provider";
import { CHALLENGES } from "@/lib/mock/challenges";
import { LEADERS_DAY } from "@/lib/mock/leaderboard";
import { formatNumber } from "@/lib/format";

export default function ChallengeDetailPage() {
  const params = useParams<{ id: string }>();
  const { t, locale } = useI18n();
  const c = CHALLENGES.find((x) => x.id === params.id);
  if (!c) return notFound();

  const pct = Math.min(100, Math.round((c.progress / c.goal) * 100));
  const progressTone =
    c.tone === "violet" ? "violet" : c.tone === "rose" ? "rose" : c.tone === "cyan" ? "cyan" : "lime";

  const leaders = LEADERS_DAY.slice(0, 8);

  const days = Math.floor(c.endsInHours / 24);
  const hours = c.endsInHours % 24;

  return (
    <>
      <Header />
      <main className="container py-8 sm:py-10">
        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 text-sm text-ink-dim hover:text-ink mb-6"
        >
          <ArrowLeft className="size-4" />
          {t.common.back}
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Main */}
          <div className="flex flex-col gap-6">
            <div className="surface p-6 sm:p-8 relative overflow-hidden">
              <div className={`absolute -right-10 -top-10 size-72 rounded-full blur-3xl ${
                c.tone === "lime" ? "bg-lime/15" :
                c.tone === "violet" ? "bg-violet/15" :
                c.tone === "rose" ? "bg-accent-rose/15" :
                c.tone === "cyan" ? "bg-accent-cyan/15" :
                "bg-accent-orange/15"
              }`} />

              <div className="relative">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-4xl">{c.badge}</span>
                  <Badge variant={c.type === "friends" ? "violet" : "lime"}>
                    {c.type === "personal"
                      ? locale === "ru" ? "Личный" : "Personal"
                      : c.type === "friends"
                        ? locale === "ru" ? "Дружеский" : "Friends"
                        : locale === "ru" ? "Публичный" : "Public"}
                  </Badge>
                  {c.joined && <Badge variant="success">{locale === "ru" ? "ты участвуешь" : "you're in"}</Badge>}
                </div>
                <h1 className="font-display text-display-md sm:text-display-lg font-bold">
                  {locale === "ru" ? c.titleRu : c.titleEn}
                </h1>
                <p className="text-ink-dim mt-3 max-w-2xl">
                  {locale === "ru" ? c.descRu : c.descEn}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Stat
                    icon={<Users className="size-4 text-lime" />}
                    label={t.challenges.participants}
                    value={formatNumber(c.participants, locale)}
                  />
                  <Stat
                    icon={<Clock className="size-4 text-accent-cyan" />}
                    label={locale === "ru" ? "Осталось" : "Time left"}
                    value={
                      days > 0
                        ? `${days}${locale === "ru" ? "д" : "d"} ${hours}${locale === "ru" ? "ч" : "h"}`
                        : `${hours}${locale === "ru" ? "ч" : "h"}`
                    }
                  />
                  <Stat
                    icon={<Award className="size-4 text-violet-soft" />}
                    label={t.challenges.reward}
                    value={locale === "ru" ? c.rewardRu : c.rewardEn}
                  />
                </div>

                <div className="mt-7">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-dim">
                      {t.common.progress}:{" "}
                      <span className="text-ink number-tabular">
                        {formatNumber(c.progress, locale)} /{" "}
                        {formatNumber(c.goal, locale)}{" "}
                        {locale === "ru" ? c.unitRu : c.unitEn}
                      </span>
                    </span>
                    <span className="font-display font-bold number-tabular">
                      {pct}%
                    </span>
                  </div>
                  <Progress
                    value={c.progress}
                    max={c.goal}
                    tone={progressTone}
                    size="lg"
                    className="mt-2"
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {!c.joined ? (
                    <Button variant="primary" size="md">
                      {t.challenges.join}
                    </Button>
                  ) : (
                    <Button variant="primary" size="md">
                      {t.common.continue}
                    </Button>
                  )}
                  <Button variant="outline" size="md">
                    {locale === "ru" ? "Поделиться" : "Share"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="surface p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="size-4 text-lime" />
                <h2 className="font-display text-base font-semibold">
                  {t.challenges.details}
                </h2>
              </div>
              <ul className="text-sm text-ink-dim space-y-2 list-disc pl-5">
                <li>
                  {locale === "ru"
                    ? `Цель: ${formatNumber(c.goal, locale)} ${c.unitRu}`
                    : `Goal: ${formatNumber(c.goal, locale)} ${c.unitEn}`}
                </li>
                <li>
                  {locale === "ru"
                    ? `Длительность: до ${days} дн ${hours} ч`
                    : `Duration: up to ${days} d ${hours} h`}
                </li>
                <li>
                  {locale === "ru"
                    ? "Можно дробить на любые сеты в течение периода"
                    : "Split into any sets during the period"}
                </li>
                <li>
                  {locale === "ru"
                    ? "Все результаты автоматически суммируются"
                    : "All results auto-aggregated"}
                </li>
                <li>
                  {locale === "ru"
                    ? `Награда: ${c.rewardRu}`
                    : `Reward: ${c.rewardEn}`}
                </li>
              </ul>
            </div>

            {/* Activity feed */}
            <div className="surface p-5 sm:p-6">
              <h2 className="font-display text-base font-semibold mb-3">
                {t.challenges.activityFeed}
              </h2>
              <ul className="flex flex-col gap-1">
                {leaders.slice(0, 6).map((row, i) => (
                  <li key={row.username} className="flex items-center gap-3 py-2 border-b border-line/40 last:border-0">
                    <Avatar name={row.name} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">{row.name}</span>
                        <span className="text-ink-dim">
                          {locale === "ru" ? " добавил " : " logged "}
                        </span>
                        <span className="font-display font-semibold number-tabular text-lime">
                          +{12 + i * 5}
                        </span>
                        <span className="text-ink-dim">
                          {" "}
                          {locale === "ru" ? c.unitRu : c.unitEn}
                        </span>
                      </div>
                      <div className="text-xs text-ink-muted">
                        {i === 0 ? (locale === "ru" ? "только что" : "just now") : `${i * 7 + 2} ${locale === "ru" ? "мин назад" : "min ago"}`}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar leaderboard */}
          <aside className="flex flex-col gap-4">
            <div className="surface p-5 sm:p-6">
              <h2 className="font-display text-base font-semibold mb-4">
                {t.challenges.leaderboardInChallenge}
              </h2>
              <ul className="flex flex-col gap-1">
                {leaders.map((row, i) => (
                  <li
                    key={row.username}
                    className={`flex items-center gap-3 rounded-xl px-2 py-2 ${
                      row.isYou
                        ? "bg-lime/8 border border-lime/30"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <span
                      className={`number-tabular w-7 text-center font-display font-bold text-sm ${
                        i < 3 ? "text-lime" : "text-ink-muted"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <Avatar
                      name={row.name}
                      size={32}
                      tone={i < 3 ? "lime" : row.isYou ? "lime" : "default"}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{row.name}</div>
                      <div className="text-[10px] text-ink-muted">@{row.username}</div>
                    </div>
                    <div className="font-display font-bold number-tabular text-sm">
                      {formatNumber(row.reps, locale)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-xs text-ink-muted uppercase tracking-widest">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-display font-semibold text-base">{value}</div>
    </div>
  );
}
