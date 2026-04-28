"use client";

import * as React from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/provider";

interface Props {
  todayEnergy: number;
  todayXp: number;
  streak: number;
  goal: number;
  username: string | null;
}

/**
 * Single-tap "share today" — uses the native Web Share sheet on
 * mobile/Edge, falls back to clipboard. We deliberately keep the
 * payload short and emoji-rich so it looks great in messengers.
 */
export function ShareTodayButton({
  todayEnergy,
  todayXp,
  streak,
  goal,
  username,
}: Props) {
  const { locale } = useI18n();
  const [copied, setCopied] = React.useState(false);

  async function share() {
    const goalPct = goal > 0 ? Math.min(100, Math.round((todayEnergy / goal) * 100)) : 0;
    const url =
      typeof window !== "undefined"
        ? username
          ? `${window.location.origin}/u/${username}`
          : `${window.location.origin}/`
        : "https://fitstreak.ru/";

    const text =
      locale === "ru"
        ? [
            `🔥 Серия: ${streak} дн.`,
            `⚡ Сегодня: ${todayEnergy} ES (${goalPct}% цели)`,
            `🎯 +${todayXp} XP`,
            `FitStreak — двигайся каждый день.`,
          ].join("\n")
        : [
            `🔥 Streak: ${streak}d`,
            `⚡ Today: ${todayEnergy} ES (${goalPct}% of goal)`,
            `🎯 +${todayXp} XP`,
            `FitStreak — move every day.`,
          ].join("\n");

    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await (navigator as Navigator).share({
          title: "FitStreak",
          text,
          url,
        });
        return;
      }
    } catch {
      // user dismissed the share sheet — fall through to clipboard
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore — old browsers without clipboard / non-https
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={share}
      className="gap-2"
      aria-label="Share today's progress"
    >
      {copied ? (
        <Check className="size-4 text-lime" />
      ) : (
        <Share2 className="size-4" />
      )}
      {copied
        ? locale === "ru"
          ? "Скопировано"
          : "Copied"
        : locale === "ru"
          ? "Поделиться"
          : "Share"}
    </Button>
  );
}
