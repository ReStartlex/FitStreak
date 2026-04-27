export type Gender = "male" | "female" | "other";
export type FitnessLevel = "beginner" | "intermediate" | "advanced";
export type Goal = "lose-weight" | "stay-fit" | "build-strength" | "daily-habit" | "endurance";

export interface BodyMetrics {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
}

export interface MockUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  /** Total accumulated XP (drives the level). */
  totalXp: number;
  /** Total accumulated Energy Score (lifetime). */
  totalEnergyScore: number;
  /** Energy Score earned today. */
  todayEnergyScore: number;
  /** XP earned today. */
  todayXp: number;
  /** Energy Score earned this week. */
  weekEnergyScore: number;
  /** Approximate kcal burned today (personal). */
  todayKcal: number;
  weekKcal: number;
  /** Current global rank by Energy Score. */
  rank: number;
  rankChange: number;
  bioRu: string;
  bioEn: string;
  streak: number;
  bestStreak: number;
  totalReps: number;
  totalMinutes: number;
  totalKm: number;
  goalCompletionRate: number;
  contribution: number;
  favouriteExerciseId: string;
  bestDay: { dateLabelRu: string; dateLabelEn: string; energy: number };
  todayReps: number;
  todayMinutes: number;
  todayKm: number;
  /** Daily Energy Score goal. */
  todayGoal: number;
  bodyMetrics: BodyMetrics;
  fitnessLevel: FitnessLevel;
  goal: Goal;
  city?: string;
  countryCode?: string;
}

/**
 * Mock user — Alex Rider.
 * totalXp = 6_320 → roughly level 14 with the configured curve.
 */
export const CURRENT_USER: MockUser = {
  id: "u-1",
  name: "Alex Rider",
  username: "alex",
  totalXp: 6_320,
  totalEnergyScore: 4_812,
  todayEnergyScore: 286,
  todayXp: 412,
  weekEnergyScore: 1_640,
  todayKcal: 348,
  weekKcal: 2_180,
  rank: 142,
  rankChange: 4,
  bioRu: "Держу серию. Топлю в челленджах. Отжимаюсь до светового хайпа.",
  bioEn: "Holding the streak. Crushing challenges. Push-ups till neon hype.",
  streak: 17,
  bestStreak: 34,
  totalReps: 12_480,
  totalMinutes: 412,
  totalKm: 138,
  goalCompletionRate: 87,
  contribution: 1_240,
  favouriteExerciseId: "pushups",
  bestDay: {
    dateLabelRu: "Среда, 14 апреля",
    dateLabelEn: "Wed, Apr 14",
    energy: 612,
  },
  todayReps: 138,
  todayMinutes: 24,
  todayKm: 3.2,
  todayGoal: 400,
  bodyMetrics: {
    gender: "male",
    age: 24,
    heightCm: 182,
    weightKg: 76,
  },
  fitnessLevel: "intermediate",
  goal: "build-strength",
  city: "Москва",
  countryCode: "RU",
};
