"use client";

import * as React from "react";
import Link from "next/link";
import { Flame, Zap } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/format";

export interface SocialUser {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  level: number;
  currentStreak: number;
}

/**
 * Reusable list of users for /followers and /following routes plus
 * search results dropdown. Renders a clean motion-free list — pages
 * that include this can wrap their own animations.
 */
export function UserList({
  users,
  emptyText,
}: {
  users: SocialUser[];
  emptyText?: string;
}) {
  const { locale } = useI18n();
  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white/[0.02] p-8 text-center text-sm text-ink-muted">
        {emptyText ?? (locale === "ru" ? "Пока никого" : "No one yet")}
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {users.map((u) => (
        <li key={u.id}>
          <Link
            href={u.username ? `/u/${u.username}` : "/leaderboard"}
            className="group flex items-center gap-3 rounded-2xl border border-line bg-white/[0.02] hover:bg-white/[0.05] hover:border-line-strong transition-colors p-3"
          >
            <Avatar
              name={u.name}
              src={u.image ?? undefined}
              size={44}
              tone={u.currentStreak >= 30 ? "lime" : "default"}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate group-hover:text-lime transition-colors">
                {u.name}
              </div>
              {u.username && (
                <div className="text-xs text-ink-muted">@{u.username}</div>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-ink-dim">
              <span className="inline-flex items-center gap-1">
                <Zap className="size-3 text-violet-soft" />
                {formatNumber(u.level, locale)}
              </span>
              {u.currentStreak > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Flame className="size-3 text-accent-orange" />
                  <span className="number-tabular">{u.currentStreak}</span>
                </span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
