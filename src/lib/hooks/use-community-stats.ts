"use client";

import * as React from "react";

export interface CommunityStatsResponse {
  today: {
    totalAmount: number;
    totalEnergy: number;
    totalKcal: number;
    logsCount: number;
    perExercise: Array<{
      exerciseId: string;
      amount: number;
      energy: number;
      kcal: number;
      deltaPct: number;
    }>;
  };
  lifetime: {
    totalEnergy: number;
  };
  community: {
    activeUsers30d: number;
  };
  me: {
    name: string | null;
    username: string | null;
    image: string | null;
    level: number;
    currentStreak: number;
    bestStreak: number;
    levelProgressPct: number;
    dailyGoal: number;
    todayAmount: number;
    todayEnergy: number;
    todayKcal: number;
  } | null;
  generatedAt: string;
}

/**
 * In-process cache so several mounted hooks share the same response,
 * but the cache window is short — UI must feel "live".
 */
const CACHE_TTL_MS = 15_000;
const REFRESH_INTERVAL_MS = 30_000;

let cache: { at: number; data: CommunityStatsResponse } | null = null;
let inflight: Promise<CommunityStatsResponse> | null = null;

type Subscriber = (data: CommunityStatsResponse) => void;
const subscribers = new Set<Subscriber>();

async function fetchStats(): Promise<CommunityStatsResponse> {
  const res = await fetch("/api/community/stats", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as CommunityStatsResponse;
}

function startInflight(): Promise<CommunityStatsResponse> {
  if (inflight) return inflight;
  inflight = fetchStats()
    .then((d) => {
      cache = { at: Date.now(), data: d };
      subscribers.forEach((cb) => cb(d));
      return d;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/**
 * Hook that streams /api/community/stats to the page in near real time:
 *
 *  - shares an in-flight request across every consumer,
 *  - re-fetches every 30s while the tab is visible,
 *  - re-fetches immediately when the tab regains focus / visibility,
 *  - exposes a manual `refresh()` for after the user logs an activity.
 */
export function useCommunityStats() {
  const [data, setData] = React.useState<CommunityStatsResponse | null>(
    cache ? cache.data : null,
  );
  const [error, setError] = React.useState<Error | null>(null);

  const refresh = React.useCallback(() => {
    startInflight().catch((e: Error) => setError(e));
  }, []);

  React.useEffect(() => {
    const sub: Subscriber = (d) => setData(d);
    subscribers.add(sub);

    // initial load (uses fresh cache if available)
    if (!cache || Date.now() - cache.at > CACHE_TTL_MS) {
      refresh();
    } else {
      setData(cache.data);
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, REFRESH_INTERVAL_MS);

    const onFocus = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      subscribers.delete(sub);
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  return { data, error, loading: !data && !error, refresh };
}
