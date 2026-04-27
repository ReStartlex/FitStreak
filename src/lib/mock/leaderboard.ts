import type { Gender, FitnessLevel } from "@/lib/mock/user";

export interface LeaderRow {
  rank: number;
  prevRank: number;
  name: string;
  username: string;
  avatar?: string;
  /** Daily Energy Score — used as the canonical score in lists. */
  energy: number;
  /** Reps logged today (for legacy display where useful). */
  reps: number;
  minutes: number;
  km: number;
  streak: number;
  level: number;
  /** Lifetime XP. */
  xp: number;
  gender: Gender;
  age: number;
  fitnessLevel: FitnessLevel;
  isYou?: boolean;
  isFriend?: boolean;
}

const RAW: Omit<LeaderRow, "rank" | "prevRank">[] = [
  { name: "Maria Lin", username: "marialn", energy: 612, reps: 482, minutes: 64, km: 6.4, streak: 41, level: 47, xp: 173_000, gender: "female", age: 27, fitnessLevel: "advanced", isFriend: true },
  { name: "Karim O.", username: "karimo", energy: 598, reps: 471, minutes: 58, km: 5.8, streak: 28, level: 42, xp: 142_000, gender: "male", age: 31, fitnessLevel: "advanced" },
  { name: "Anya Krym", username: "anyak", energy: 582, reps: 460, minutes: 52, km: 8.2, streak: 14, level: 38, xp: 112_000, gender: "female", age: 22, fitnessLevel: "intermediate" },
  { name: "Sasha Rim", username: "sashar", energy: 564, reps: 445, minutes: 49, km: 5.1, streak: 9, level: 36, xp: 96_500, gender: "male", age: 28, fitnessLevel: "intermediate" },
  { name: "Lev Bar", username: "levb", energy: 549, reps: 433, minutes: 47, km: 4.9, streak: 22, level: 41, xp: 134_000, gender: "male", age: 33, fitnessLevel: "advanced" },
  { name: "Diana V.", username: "dianav", energy: 532, reps: 421, minutes: 44, km: 4.2, streak: 12, level: 34, xp: 82_400, gender: "female", age: 25, fitnessLevel: "intermediate" },
  { name: "Mark Ts", username: "markts", energy: 519, reps: 410, minutes: 41, km: 3.6, streak: 7, level: 29, xp: 58_200, gender: "male", age: 19, fitnessLevel: "beginner" },
  { name: "Polina F.", username: "polinaf", energy: 504, reps: 398, minutes: 39, km: 3.4, streak: 19, level: 32, xp: 71_900, gender: "female", age: 30, fitnessLevel: "intermediate" },
  { name: "Igor R.", username: "igorr", energy: 486, reps: 384, minutes: 36, km: 3.0, streak: 33, level: 39, xp: 118_400, gender: "male", age: 26, fitnessLevel: "advanced", isFriend: true },
  { name: "Kate Lim", username: "kateli", energy: 471, reps: 372, minutes: 34, km: 2.8, streak: 11, level: 28, xp: 54_800, gender: "female", age: 21, fitnessLevel: "intermediate" },
  { name: "Nikita G.", username: "niki", energy: 312, reps: 142, minutes: 18, km: 2.4, streak: 12, level: 18, xp: 18_900, gender: "male", age: 24, fitnessLevel: "intermediate", isFriend: true },
  { name: "Alex Rider", username: "alex", energy: 286, reps: 138, minutes: 24, km: 3.2, streak: 17, level: 14, xp: 6_320, gender: "male", age: 24, fitnessLevel: "intermediate", isYou: true },
  { name: "Lera Mox", username: "leram", energy: 278, reps: 135, minutes: 17, km: 2.0, streak: 8, level: 16, xp: 14_200, gender: "female", age: 23, fitnessLevel: "beginner" },
  { name: "Tom Vey", username: "tomvey", energy: 264, reps: 130, minutes: 21, km: 1.8, streak: 5, level: 12, xp: 4_120, gender: "male", age: 20, fitnessLevel: "beginner" },
];

export const LEADERS_DAY: LeaderRow[] = RAW
  .slice()
  .sort((a, b) => b.energy - a.energy)
  .map((row, idx) => ({
    ...row,
    rank: idx + 1,
    prevRank: idx + 1 + (idx % 3 === 0 ? -1 : idx % 3 === 1 ? 0 : 2),
  }));

export const LEADERS_WEEK: LeaderRow[] = LEADERS_DAY.map((r) => ({
  ...r,
  energy: r.energy * (5 + ((r.rank * 31) % 4)),
  reps: r.reps * 5,
  minutes: r.minutes * 5,
  km: r.km * 5,
}));

export const LEADERS_BY_LEVEL: LeaderRow[] = LEADERS_DAY
  .slice()
  .sort((a, b) => b.level - a.level || b.xp - a.xp)
  .map((row, idx) => ({ ...row, rank: idx + 1, prevRank: idx + 2 }));

export const LEADERS_BY_XP: LeaderRow[] = LEADERS_DAY
  .slice()
  .sort((a, b) => b.xp - a.xp)
  .map((row, idx) => ({ ...row, rank: idx + 1, prevRank: idx + 2 }));

export const FRIENDS: LeaderRow[] = LEADERS_DAY
  .filter((r) => r.isFriend || r.isYou)
  .map((r, i) => ({ ...r, rank: i + 1, prevRank: i + (i === 0 ? 0 : 1) }));

export type LeaderboardMetric = "energy" | "level" | "xp";
export type LeaderboardScope = "global" | "friends" | "men" | "women" | "age" | "fitness";

export type AgeBucket = "16-21" | "22-29" | "30-39" | "40+";

export function ageBucket(age: number): AgeBucket {
  if (age <= 21) return "16-21";
  if (age <= 29) return "22-29";
  if (age <= 39) return "30-39";
  return "40+";
}
