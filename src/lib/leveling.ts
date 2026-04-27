/**
 * Leveling system.
 *
 * 100 levels with a smooth progression curve:
 *   xpForLevel(L) = round(BASE × L^EXPONENT)
 *
 * Tuned for the following targets:
 *   ≈ 4k XP cumulative to reach level 10  (fast onboarding)
 *   ≈ 60k XP cumulative to reach level 30 (moderate)
 *   ≈ 330k XP cumulative to reach level 60 (advanced)
 *   ≈ 1.2M XP cumulative to reach level 100 (long-term status)
 *
 * Rough orientation: an active user logging ~500 XP per day reaches
 * around level 45 in a year, which keeps level 70+ aspirational.
 */

export const MAX_LEVEL = 100;

const BASE = 30;
const EXPONENT = 1.5;

/** XP needed to clear a single level (i.e. progress from L to L+1). */
export function xpForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level > MAX_LEVEL) return 0;
  return Math.round(BASE * Math.pow(level, EXPONENT));
}

/** Cumulative XP needed to fully reach level L (i.e. complete levels 1..L). */
const _cumCache: number[] = (() => {
  const arr: number[] = [];
  let s = 0;
  for (let i = 1; i <= MAX_LEVEL; i++) {
    s += xpForLevel(i);
    arr.push(s);
  }
  return arr;
})();

export function cumulativeXp(level: number): number {
  if (level <= 0) return 0;
  if (level >= MAX_LEVEL) return _cumCache[MAX_LEVEL - 1];
  return _cumCache[level - 1];
}

/** Total XP needed to reach top level. */
export function maxXp(): number {
  return _cumCache[MAX_LEVEL - 1];
}

export interface LevelInfo {
  /** Current level (1-indexed). */
  level: number;
  totalXp: number;
  /** XP threshold at the start of the current level. */
  xpAtLevelStart: number;
  /** XP threshold at the end of the current level / start of next. */
  xpAtLevelEnd: number;
  /** XP earned within the current level. */
  xpInLevel: number;
  /** XP required to clear the current level. */
  xpForThisLevel: number;
  /** XP remaining to next level. */
  xpToNext: number;
  /** 0..100 progress within current level. */
  progress: number;
  /** Whether the user has hit max level. */
  isMax: boolean;
}

/**
 * Compute level info from total accumulated XP.
 * Convention: a fresh user with 0 XP is at level 1.
 */
export function getLevelInfo(totalXp: number): LevelInfo {
  if (totalXp <= 0) {
    return {
      level: 1,
      totalXp: 0,
      xpAtLevelStart: 0,
      xpAtLevelEnd: xpForLevel(1),
      xpInLevel: 0,
      xpForThisLevel: xpForLevel(1),
      xpToNext: xpForLevel(1),
      progress: 0,
      isMax: false,
    };
  }

  let cleared = 0;
  for (let i = 1; i <= MAX_LEVEL; i++) {
    if (cumulativeXp(i) <= totalXp) cleared = i;
    else break;
  }

  let level = Math.min(MAX_LEVEL, cleared + 1);
  const isMax = cleared >= MAX_LEVEL;
  if (isMax) level = MAX_LEVEL;

  const xpAtLevelStart = cumulativeXp(level - 1);
  const xpForThisLevel = isMax ? xpForLevel(MAX_LEVEL) : xpForLevel(level);
  const xpAtLevelEnd = xpAtLevelStart + xpForThisLevel;
  const xpInLevel = Math.max(0, totalXp - xpAtLevelStart);
  const xpToNext = Math.max(0, xpAtLevelEnd - totalXp);
  const progress = xpForThisLevel > 0
    ? Math.min(100, (xpInLevel / xpForThisLevel) * 100)
    : 100;

  return {
    level,
    totalXp,
    xpAtLevelStart,
    xpAtLevelEnd,
    xpInLevel,
    xpForThisLevel,
    xpToNext,
    progress,
    isMax,
  };
}
