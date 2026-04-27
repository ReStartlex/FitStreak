/**
 * Personalized daily Energy Score goal.
 *
 * Combines fitness level (the main signal), age (older = slightly lower),
 * gender (small adjustment), goal (cardio-heavy goals push the bar up)
 * and weight (very heavy users get a slightly relaxed target — less
 * impact on joints; very light users a bit more, since per-rep load
 * is smaller in absolute terms).
 *
 * Returned value is in Energy Score points (the same unit logged by
 * the QuickLog), rounded to the nearest 5 for nicer UI.
 */

import type { FitnessLevel, Gender, Goal } from "@prisma/client";

export interface DailyGoalInput {
  fitnessLevel?: FitnessLevel | null;
  age?: number | null;
  gender?: Gender | null;
  goal?: Goal | null;
  weightKg?: number | null;
}

const BASE_BY_LEVEL: Record<FitnessLevel, number> = {
  BEGINNER: 80,
  INTERMEDIATE: 130,
  ADVANCED: 180,
  ATHLETE: 240,
};

function ageMultiplier(age: number | null | undefined): number {
  if (!age || age <= 0) return 1;
  if (age < 18) return 0.9;
  if (age <= 30) return 1.0;
  if (age <= 45) return 0.95;
  if (age <= 55) return 0.88;
  if (age <= 65) return 0.8;
  return 0.72;
}

function genderMultiplier(g: Gender | null | undefined): number {
  // Tiny nudge — body comp differences average out, mainly here for
  // calorie projection accuracy in MET model. Keep small.
  if (g === "FEMALE") return 0.95;
  return 1.0;
}

function goalMultiplier(g: Goal | null | undefined): number {
  switch (g) {
    case "WEIGHT_LOSS":
      return 1.12;
    case "STAMINA":
      return 1.1;
    case "COMPETITIVE":
      return 1.2;
    case "MUSCLE":
      return 1.0;
    case "HEALTH":
    default:
      return 0.95;
  }
}

function weightMultiplier(w: number | null | undefined): number {
  if (!w || w <= 0) return 1;
  if (w < 55) return 1.05;
  if (w <= 75) return 1.0;
  if (w <= 95) return 0.97;
  if (w <= 115) return 0.92;
  return 0.85;
}

export function calcDailyGoal(input: DailyGoalInput): number {
  const level = input.fitnessLevel ?? "INTERMEDIATE";
  const base = BASE_BY_LEVEL[level];
  const raw =
    base *
    ageMultiplier(input.age) *
    genderMultiplier(input.gender) *
    goalMultiplier(input.goal) *
    weightMultiplier(input.weightKg);
  // Round to nearest 5, clamp to [50, 400].
  const clamped = Math.max(50, Math.min(400, raw));
  return Math.round(clamped / 5) * 5;
}

/** A friendly explanation of how the goal was derived. */
export function describeDailyGoal(
  input: DailyGoalInput,
  locale: "ru" | "en" = "ru",
): string {
  const reasons: string[] = [];
  if (input.fitnessLevel) {
    if (locale === "ru") {
      const levelLabel = {
        BEGINNER: "новичка",
        INTERMEDIATE: "среднего уровня",
        ADVANCED: "продвинутого",
        ATHLETE: "атлета",
      }[input.fitnessLevel];
      reasons.push(`для ${levelLabel}`);
    } else {
      reasons.push(`for ${input.fitnessLevel.toLowerCase()}`);
    }
  }
  if (input.age && input.age >= 45) {
    reasons.push(locale === "ru" ? "с учётом возраста" : "age-adjusted");
  }
  if (input.goal === "WEIGHT_LOSS" || input.goal === "COMPETITIVE") {
    reasons.push(
      locale === "ru" ? "под цель «дать максимум»" : "tuned to push harder",
    );
  }
  if (!reasons.length) {
    return locale === "ru"
      ? "Базовая цель — увеличится после онбординга"
      : "Default goal — refines after onboarding";
  }
  return reasons.join(", ");
}
