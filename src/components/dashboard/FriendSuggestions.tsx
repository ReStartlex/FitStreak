"use client";

import * as React from "react";
import Link from "next/link";
import { UserPlus, Check, Users, Sparkles, Flame } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { useI18n } from "@/lib/i18n/provider";

interface Suggestion {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
  level: number;
  currentStreak: number;
  mutual: number;
  reason: "MUTUAL" | "SAME_LEVEL" | "POPULAR";
}

/**
 * Compact "people you may know" widget for the dashboard right column.
 * Renders up to four suggestions with one-tap follow. Hidden entirely
 * when the API has nothing to surface — no empty card.
 */
export function FriendSuggestions() {
  const { locale } = useI18n();
  const toast = useToast();
  const [items, setItems] = React.useState<Suggestion[] | null>(null);
  const [busy, setBusy] = React.useState<Record<string, boolean>>({});
  const [followed, setFollowed] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/me/suggestions")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled) return;
        setItems(j?.suggestions ?? []);
      })
      .catch(() => setItems([]));
    return () => {
      cancelled = true;
    };
  }, []);

  async function follow(id: string) {
    if (busy[id] || followed[id]) return;
    setBusy((b) => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/follow/${id}`, { method: "POST" });
      if (res.ok) {
        setFollowed((f) => ({ ...f, [id]: true }));
        toast(locale === "ru" ? "Подписался" : "Following", {
          tone: "success",
        });
      } else if (res.status === 400) {
        toast(
          locale === "ru" ? "Невозможно подписаться" : "Can't follow",
          { tone: "error" },
        );
      } else {
        throw new Error("follow_failed");
      }
    } catch {
      toast(locale === "ru" ? "Ошибка сети" : "Network error", {
        tone: "error",
      });
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  }

  if (items === null) {
    return (
      <div className="surface p-5">
        <h3 className="font-display text-base font-semibold mb-1">
          {locale === "ru" ? "Найти друзей" : "Find friends"}
        </h3>
        <div className="flex flex-col gap-3 mt-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="size-10 rounded-full bg-white/[0.06]" />
              <div className="flex-1">
                <div className="h-3 w-24 rounded bg-white/[0.06]" />
                <div className="h-2 w-16 rounded bg-white/[0.06] mt-2" />
              </div>
              <div className="h-7 w-20 rounded-lg bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-display text-base font-semibold">
            {locale === "ru" ? "Найти друзей" : "Find friends"}
          </h3>
          <p className="text-xs text-ink-dim">
            {locale === "ru"
              ? "Похожий уровень или общие знакомые"
              : "Similar level or mutual friends"}
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {items.slice(0, 4).map((u) => {
          const handle = u.username ?? u.id;
          const isFollowing = followed[u.id];
          const isBusy = busy[u.id];
          return (
            <li
              key={u.id}
              className="flex items-center gap-3 rounded-xl px-1 py-1.5 hover:bg-white/[0.03]"
            >
              <Link
                href={`/u/${handle}`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <Avatar
                  name={u.name ?? handle}
                  src={u.image ?? undefined}
                  size={36}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {u.name ?? handle}
                  </div>
                  <ReasonLine
                    reason={u.reason}
                    mutual={u.mutual}
                    streak={u.currentStreak}
                    level={u.level}
                    locale={locale}
                  />
                </div>
              </Link>
              <button
                type="button"
                onClick={() => follow(u.id)}
                disabled={isFollowing || isBusy}
                aria-label={
                  isFollowing
                    ? locale === "ru"
                      ? "Подписан"
                      : "Following"
                    : locale === "ru"
                      ? "Подписаться"
                      : "Follow"
                }
                className={
                  "shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors " +
                  (isFollowing
                    ? "border-lime/40 bg-lime/10 text-lime"
                    : "border-line bg-white/[0.04] text-ink hover:bg-white/[0.08]")
                }
              >
                {isFollowing ? (
                  <Check className="size-3.5" />
                ) : (
                  <UserPlus className="size-3.5" />
                )}
                {isFollowing
                  ? locale === "ru"
                    ? "В друзьях"
                    : "Following"
                  : locale === "ru"
                    ? "Подписаться"
                    : "Follow"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ReasonLine({
  reason,
  mutual,
  streak,
  level,
  locale,
}: {
  reason: Suggestion["reason"];
  mutual: number;
  streak: number;
  level: number;
  locale: "ru" | "en";
}) {
  if (reason === "MUTUAL") {
    return (
      <div className="text-xs text-ink-muted flex items-center gap-1">
        <Users className="size-3" />
        {locale === "ru"
          ? `${mutual} общих друзей`
          : `${mutual} mutual friend${mutual === 1 ? "" : "s"}`}
      </div>
    );
  }
  if (reason === "SAME_LEVEL") {
    return (
      <div className="text-xs text-ink-muted flex items-center gap-1">
        <Sparkles className="size-3" />
        {locale === "ru" ? `Уровень ${level}` : `Level ${level}`}
        <span className="opacity-50">·</span>
        <Flame className="size-3" />
        {streak}
      </div>
    );
  }
  return (
    <div className="text-xs text-ink-muted flex items-center gap-1">
      <Flame className="size-3" />
      {locale === "ru" ? `Серия ${streak} дн.` : `${streak}-day streak`}
    </div>
  );
}
