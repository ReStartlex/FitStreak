import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ChevronUp,
  Dumbbell,
  Flame,
  Footprints,
  Timer,
  Wind,
  Zap,
} from "lucide-react";

export type ExerciseUnit = "reps" | "minutes" | "steps" | "seconds" | "km";
export type ExerciseType = "strength" | "core" | "cardio" | "cardio-bodyweight" | "static";

export interface Exercise {
  id: string;
  nameRu: string;
  nameEn: string;
  unit: ExerciseUnit;
  unitGroup: number; // base group (e.g. "10 push-ups", "1 km", "1 minute")
  icon: LucideIcon;
  tone: "lime" | "violet" | "rose" | "cyan" | "orange";
  type: ExerciseType;
  /** Energy Score per single base unit (per rep / per km / per minute) — for fair leaderboards */
  energyPerUnit: number;
  /** XP per single base unit — for level progression */
  xpPerUnit: number;
  /** MET coefficient — for personal kcal estimation */
  met: number;
  /** Approx seconds spent per single base unit (for kcal estimation) */
  secondsPerUnit: number;
  quickAdds: number[];
}

/**
 * Base coefficients aligned with product spec:
 * Energy Score:                 XP:
 * - 1 km walking = 50           - 1 km walking = 40
 * - 1 km running = 75           - 1 km running = 65
 * - 10 push-ups = 5             - 10 push-ups = 10
 * - 10 pull-ups = 11            - 10 pull-ups = 20
 * - 20 squats = 4               - 20 squats = 10  (=> 1 squat = 0.5 XP)
 * - 10 abs = 2                  - 10 abs = 6
 * - 1 min plank = 3             - 1 min plank = 8
 * - 10 burpees = 12             - 10 burpees = 18
 */
export const EXERCISES: Exercise[] = [
  {
    id: "pushups",
    nameRu: "Отжимания",
    nameEn: "Push-ups",
    unit: "reps",
    unitGroup: 1,
    icon: ChevronUp,
    tone: "lime",
    type: "strength",
    energyPerUnit: 0.5, // 5 / 10
    xpPerUnit: 1.0,
    met: 8,
    secondsPerUnit: 2.5,
    quickAdds: [5, 10, 20],
  },
  {
    id: "pullups",
    nameRu: "Подтягивания",
    nameEn: "Pull-ups",
    unit: "reps",
    unitGroup: 1,
    icon: Dumbbell,
    tone: "violet",
    type: "strength",
    energyPerUnit: 1.1, // 11 / 10
    xpPerUnit: 2.0,
    met: 8,
    secondsPerUnit: 4,
    quickAdds: [1, 3, 5],
  },
  {
    id: "squats",
    nameRu: "Приседания",
    nameEn: "Squats",
    unit: "reps",
    unitGroup: 1,
    icon: Activity,
    tone: "rose",
    type: "strength",
    energyPerUnit: 0.2, // 4 / 20
    xpPerUnit: 0.5,
    met: 5,
    secondsPerUnit: 2,
    quickAdds: [10, 20, 30],
  },
  {
    id: "plank",
    nameRu: "Планка",
    nameEn: "Plank",
    unit: "seconds",
    unitGroup: 60,
    icon: Timer,
    tone: "cyan",
    type: "static",
    energyPerUnit: 3 / 60, // 3 per minute, so per second
    xpPerUnit: 8 / 60,
    met: 3,
    secondsPerUnit: 1,
    quickAdds: [30, 60, 120],
  },
  {
    id: "abs",
    nameRu: "Пресс / скручивания",
    nameEn: "Abs / crunches",
    unit: "reps",
    unitGroup: 1,
    icon: Activity,
    tone: "orange",
    type: "core",
    energyPerUnit: 0.2, // 2 / 10
    xpPerUnit: 0.6,
    met: 4,
    secondsPerUnit: 2,
    quickAdds: [10, 20, 30],
  },
  {
    id: "burpees",
    nameRu: "Берпи",
    nameEn: "Burpees",
    unit: "reps",
    unitGroup: 1,
    icon: Flame,
    tone: "rose",
    type: "cardio-bodyweight",
    energyPerUnit: 1.2, // 12 / 10
    xpPerUnit: 1.8,
    met: 10,
    secondsPerUnit: 5,
    quickAdds: [5, 10, 20],
  },
  {
    id: "walking",
    nameRu: "Ходьба",
    nameEn: "Walking",
    unit: "km",
    unitGroup: 1,
    icon: Footprints,
    tone: "lime",
    type: "cardio",
    energyPerUnit: 50,
    xpPerUnit: 40,
    met: 3.5,
    secondsPerUnit: 720, // ~12 min per km at 5 km/h
    quickAdds: [1, 3, 5],
  },
  {
    id: "running",
    nameRu: "Бег",
    nameEn: "Running",
    unit: "km",
    unitGroup: 1,
    icon: Wind,
    tone: "violet",
    type: "cardio",
    energyPerUnit: 75,
    xpPerUnit: 65,
    met: 8,
    secondsPerUnit: 360, // ~6 min per km at 10 km/h
    quickAdds: [1, 3, 5],
  },
  {
    id: "active-time",
    nameRu: "Активное время",
    nameEn: "Active time",
    unit: "minutes",
    unitGroup: 1,
    icon: Zap,
    tone: "cyan",
    type: "cardio",
    energyPerUnit: 4, // moderate activity per minute
    xpPerUnit: 6,
    met: 5,
    secondsPerUnit: 60,
    quickAdds: [10, 30, 60],
  },
];

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function getExerciseName(id: string, locale: "ru" | "en") {
  const ex = getExercise(id);
  if (!ex) return id;
  return locale === "ru" ? ex.nameRu : ex.nameEn;
}

export function exerciseUnitLabel(ex: Exercise, locale: "ru" | "en") {
  switch (ex.unit) {
    case "reps":
      return locale === "ru" ? "повт" : "reps";
    case "km":
      return locale === "ru" ? "км" : "km";
    case "minutes":
      return locale === "ru" ? "мин" : "min";
    case "seconds":
      return locale === "ru" ? "сек" : "sec";
    case "steps":
      return locale === "ru" ? "шаг" : "steps";
  }
}
