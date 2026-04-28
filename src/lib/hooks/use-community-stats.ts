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
    todayAmount: number;
    todayEnergy: number;
    todayKcal: number;
  } | null;
  generatedAt: string;
}

const CACHE_TTL_MS = 60_000;
let cache: { at: number; data: CommunityStatsResponse } | null = null;
let inflight: Promise<CommunityStatsResponse> | null = null;

async function fetchStats(): Promise<CommunityStatsResponse> {
  const res = await fetch("/api/community/stats", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as CommunityStatsResponse;
}

/**
 * Lightweight client cache so multiple landing sections
 * (Hero + CommunityCounter) share a single in-flight request.
 */
export function useCommunityStats() {
  const [data, setData] = React.useState<CommunityStatsResponse | null>(
    cache && Date.now() - cache.at < CACHE_TTL_MS ? cache.data : null,
  );
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
      setData(cache.data);
      return;
    }

    inflight ||= fetchStats();
    inflight
      .then((d) => {
        cache = { at: Date.now(), data: d };
        if (!cancelled) setData(d);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        inflight = null;
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error, loading: !data && !error };
}
