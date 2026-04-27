import { getExercise } from "@/lib/mock/exercises";

const DAILY_AMOUNT_CAP: Record<string, number> = {
  "push-ups": 1500,
  "squats": 2000,
  "pull-ups": 500,
  "abs": 2000,
  "burpees": 800,
  "jump-rope": 60,
  "plank": 90,
  "walking": 60,
  "running": 60,
  "active-time": 480,
};

const SINGLE_ENTRY_CAP: Record<string, number> = {
  "push-ups": 500,
  "squats": 500,
  "pull-ups": 200,
  "abs": 500,
  "burpees": 200,
  "jump-rope": 30,
  "plank": 30,
  "walking": 30,
  "running": 30,
  "active-time": 240,
};

export interface AmountValidationResult {
  ok: boolean;
  reason?: "INVALID_EXERCISE" | "AMOUNT_TOO_LOW" | "AMOUNT_TOO_HIGH" | "DAILY_CAP";
  amount?: number;
}

export function validateAmount(
  exerciseId: string,
  amount: number,
  amountToday = 0,
): AmountValidationResult {
  const ex = getExercise(exerciseId);
  if (!ex) return { ok: false, reason: "INVALID_EXERCISE" };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: "AMOUNT_TOO_LOW" };
  }

  const singleCap = SINGLE_ENTRY_CAP[exerciseId] ?? 1_000_000;
  if (amount > singleCap) {
    return { ok: false, reason: "AMOUNT_TOO_HIGH", amount: singleCap };
  }

  const dailyCap = DAILY_AMOUNT_CAP[exerciseId] ?? 1_000_000;
  if (amountToday + amount > dailyCap) {
    return { ok: false, reason: "DAILY_CAP", amount: Math.max(0, dailyCap - amountToday) };
  }

  return { ok: true };
}
