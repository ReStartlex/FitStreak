import { getExercise, type Exercise } from "@/lib/mock/exercises";
import type { BodyMetrics } from "@/lib/mock/user";

/**
 * Calculate Energy Score for an activity entry.
 * Energy Score is a NORMALIZED metric used for fair leaderboards.
 * It does NOT take user weight or other personal metrics into account.
 */
export function calcEnergyScore(exerciseId: string, amount: number): number {
  const ex = getExercise(exerciseId);
  if (!ex) return 0;
  return Math.round(ex.energyPerUnit * amount * 10) / 10;
}

/**
 * Calculate XP for an activity entry.
 * XP feeds the leveling system and is intentionally a bit more "rewarding"
 * than Energy Score to keep gamification motivating.
 */
export function calcXP(exerciseId: string, amount: number): number {
  const ex = getExercise(exerciseId);
  if (!ex) return 0;
  return Math.round(ex.xpPerUnit * amount);
}

/**
 * Personal kcal estimation for a single activity entry.
 * Formula:   kcal = MET × weight(kg) × duration(hours)
 * We approximate duration via `secondsPerUnit` baked into the exercise config.
 *
 * If no body metrics provided, we fall back to a 70 kg baseline so the UI
 * can still show "approximate" values without forcing user input.
 */
export function calcKcal(
  exerciseId: string,
  amount: number,
  metrics?: BodyMetrics,
): number {
  const ex = getExercise(exerciseId);
  if (!ex) return 0;
  const weight = metrics?.weightKg ?? 70;
  // Some activities (cardio/strength) get a small gender modifier
  // for personal estimates, but never for leaderboards.
  const genderFactor =
    metrics?.gender === "female" ? 0.92 : metrics?.gender === "male" ? 1.0 : 0.96;
  const ageFactor = metrics?.age ? Math.max(0.85, 1 - (metrics.age - 25) * 0.003) : 1;
  const hours = (ex.secondsPerUnit * amount) / 3600;
  const kcal = ex.met * weight * hours * genderFactor * ageFactor;
  return Math.round(kcal);
}

/**
 * Energy Score totals helper for a list of records.
 */
export function sumEnergy(entries: { exerciseId: string; amount: number }[]) {
  return Math.round(
    entries.reduce((acc, e) => acc + calcEnergyScore(e.exerciseId, e.amount), 0),
  );
}

export function sumXP(entries: { exerciseId: string; amount: number }[]) {
  return entries.reduce((acc, e) => acc + calcXP(e.exerciseId, e.amount), 0);
}

export function sumKcal(
  entries: { exerciseId: string; amount: number }[],
  metrics?: BodyMetrics,
) {
  return entries.reduce(
    (acc, e) => acc + calcKcal(e.exerciseId, e.amount, metrics),
    0,
  );
}

/**
 * Returns activity composition (cardio vs strength vs core)
 * by Energy Score for personal analytics.
 */
export function activityBreakdown(
  entries: { exerciseId: string; amount: number }[],
) {
  const breakdown = {
    cardio: 0,
    strength: 0,
    core: 0,
    static: 0,
  };
  for (const entry of entries) {
    const ex = getExercise(entry.exerciseId);
    if (!ex) continue;
    const energy = calcEnergyScore(entry.exerciseId, entry.amount);
    if (ex.type === "cardio" || ex.type === "cardio-bodyweight") breakdown.cardio += energy;
    else if (ex.type === "strength") breakdown.strength += energy;
    else if (ex.type === "core") breakdown.core += energy;
    else breakdown.static += energy;
  }
  const total = breakdown.cardio + breakdown.strength + breakdown.core + breakdown.static;
  return {
    ...breakdown,
    total,
    cardioPct: total ? Math.round((breakdown.cardio / total) * 100) : 0,
    strengthPct: total ? Math.round((breakdown.strength / total) * 100) : 0,
    corePct: total ? Math.round((breakdown.core / total) * 100) : 0,
    staticPct: total ? Math.round((breakdown.static / total) * 100) : 0,
  };
}

/** Quick helper for short scoring text shown in the UI */
export function scoringPreview(ex: Exercise, amount: number) {
  return {
    energy: calcEnergyScore(ex.id, amount),
    xp: calcXP(ex.id, amount),
  };
}
