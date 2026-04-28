"use client";

import * as React from "react";
import { useSession } from "next-auth/react";

export interface MyStreak {
  currentStreak: number;
  bestStreak: number;
  level: number;
  levelProgressPct: number;
  username: string | null;
}

const CACHE_TTL_MS = 30_000;
let cache: { at: number; data: MyStreak } | null = null;
let inflight: Promise<MyStreak> | null = null;

async function fetchStreak(): Promise<MyStreak> {
  const res = await fetch("/api/me/streak", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as MyStreak;
}

/**
 * Lightweight per-tab cache for the global Header chip. Only fires
 * when the user is authenticated; bumps every 30s if the page stays
 * open.
 */
export function useMyStreak() {
  const { status } = useSession();
  const [data, setData] = React.useState<MyStreak | null>(
    cache && Date.now() - cache.at < CACHE_TTL_MS ? cache.data : null,
  );

  const refresh = React.useCallback(() => {
    inflight ||= fetchStreak();
    inflight
      .then((d) => {
        cache = { at: Date.now(), data: d };
        setData(d);
      })
      .catch(() => {
        // header chip is non-critical, swallow errors
      })
      .finally(() => {
        inflight = null;
      });
  }, []);

  React.useEffect(() => {
    if (status !== "authenticated") return;
    if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
      setData(cache.data);
      return;
    }
    refresh();
  }, [status, refresh]);

  return { data, refresh };
}
