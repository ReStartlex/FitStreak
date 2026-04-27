import { NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ok,
  badRequest,
  tooMany,
  unauthorized,
  serverError,
} from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  age: z.number().int().min(13).max(99).optional(),
  heightCm: z.number().int().min(120).max(230).optional(),
  weightKg: z.number().int().min(35).max(220).optional(),
  fitnessLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ATHLETE"]).optional(),
  goal: z.enum(["HEALTH", "WEIGHT_LOSS", "STAMINA", "MUSCLE", "COMPETITIVE"]).optional(),
  onboardingComplete: z.boolean().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const limit = rateLimit(`body:${session.user.id ?? clientId(request)}`, 30, 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid payload", parsed.error.flatten());

    const { onboardingComplete, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };

    if (onboardingComplete) {
      const willHaveAge = "age" in rest ? rest.age : undefined;
      const willHaveHeight = "heightCm" in rest ? rest.heightCm : undefined;
      const willHaveWeight = "weightKg" in rest ? rest.weightKg : undefined;

      const existing = await db.user.findUnique({
        where: { id: session.user.id },
        select: { age: true, heightCm: true, weightKg: true },
      });

      const age = willHaveAge ?? existing?.age;
      const heightCm = willHaveHeight ?? existing?.heightCm;
      const weightKg = willHaveWeight ?? existing?.weightKg;

      if (!age || !heightCm || !weightKg) {
        return badRequest("ONBOARDING_INCOMPLETE", {
          missing: {
            age: !age,
            heightCm: !heightCm,
            weightKg: !weightKg,
          },
        });
      }
      data.onboarded = true;
    }

    const updated = await db.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        gender: true,
        age: true,
        heightCm: true,
        weightKg: true,
        fitnessLevel: true,
        goal: true,
        onboarded: true,
      },
    });

    return ok({ user: updated });
  } catch (error) {
    return serverError(error);
  }
}
