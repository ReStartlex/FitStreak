import { NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ok,
  badRequest,
  unauthorized,
  serverError,
  tooMany,
} from "@/lib/api/response";
import { rateLimit, clientId } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    const myId = session?.user?.id ?? null;

    const challenges = await db.challenge.findMany({
      where: {
        OR: [
          // Public challenges visible to everyone
          { type: "PUBLIC" },
          // Personal/friends challenges only visible to their creator
          // (or to participants — covered via `joined`)
          ...(myId ? [{ createdById: myId }] : []),
          ...(myId
            ? [{ participants: { some: { userId: myId } } }]
            : []),
        ],
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        participants: myId
          ? {
              where: { userId: myId },
              select: { progress: true, completed: true },
            }
          : false,
      },
    });

    return ok({
      challenges: challenges.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: { ru: c.titleRu, en: c.titleEn },
        description: { ru: c.descRu, en: c.descEn },
        metric: c.metric,
        exerciseId: c.exerciseId,
        goal: c.goal,
        durationDays: c.durationDays,
        difficulty: c.difficulty,
        rewardXp: c.rewardXp,
        rewardEnergy: c.rewardEnergy,
        participantsCount: c.participantsCount,
        isFeatured: c.isFeatured,
        type: c.type,
        createdById: c.createdById,
        endsAt: c.endsAt?.toISOString() ?? null,
        createdAt: c.createdAt.toISOString(),
        myProgress: c.participants?.[0]?.progress ?? null,
        joined: Boolean(c.participants?.[0]),
        completed: Boolean(c.participants?.[0]?.completed),
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}

const createSchema = z.object({
  titleRu: z.string().min(2).max(80),
  titleEn: z.string().min(2).max(80).optional(),
  descRu: z.string().min(2).max(500).optional(),
  descEn: z.string().min(2).max(500).optional(),
  metric: z.enum([
    "REPS",
    "KM",
    "MINUTES",
    "ENERGY",
    "STREAK_DAYS",
    "DAYS_ACTIVE",
  ]),
  exerciseId: z.string().min(1).max(40).optional(),
  goal: z.number().int().positive().max(1_000_000),
  durationDays: z.number().int().min(1).max(120),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "ELITE"]).optional(),
  type: z.enum(["PERSONAL", "FRIENDS"]).default("PERSONAL"),
  rewardXp: z.number().int().min(0).max(50_000).optional(),
});

function slugify(s: string, suffix: string): string {
  const base = s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return `${base || "challenge"}-${suffix}`;
}

/**
 * Create a personal (or friends-only) challenge for the signed-in user.
 *
 * Public challenges are seeded by the platform; users can't create them
 * via this endpoint to keep the leaderboard meaningful.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const limit = rateLimit(`challenge-create:${clientId(request)}`, 5, 60_000);
    if (!limit.ok) return tooMany(limit.resetAt);

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid payload", parsed.error.flatten());
    }
    const data = parsed.data;

    const titleRu = data.titleRu.trim();
    const titleEn = (data.titleEn ?? data.titleRu).trim();
    const descRu = (data.descRu ?? "Личный челлендж — двигайся каждый день.").trim();
    const descEn = (data.descEn ?? "Personal challenge — move every day.").trim();

    const suffix = Math.random().toString(36).slice(2, 8);
    const slug = slugify(titleRu, suffix);

    const endsAt = new Date(Date.now() + data.durationDays * 24 * 60 * 60_000);

    const challenge = await db.$transaction(async (tx) => {
      const c = await tx.challenge.create({
        data: {
          slug,
          titleRu,
          titleEn,
          descRu,
          descEn,
          metric: data.metric,
          exerciseId: data.exerciseId ?? null,
          goal: data.goal,
          durationDays: data.durationDays,
          difficulty: data.difficulty ?? "MEDIUM",
          rewardXp: data.rewardXp ?? 0,
          rewardEnergy: 0,
          isFeatured: false,
          type: data.type,
          createdById: session.user!.id!,
          endsAt,
        },
      });
      // Auto-join the creator
      await tx.challengeParticipant.create({
        data: { userId: session.user!.id!, challengeId: c.id },
      });
      await tx.challenge.update({
        where: { id: c.id },
        data: { participantsCount: { increment: 1 } },
      });
      return c;
    });

    return ok(
      {
        id: challenge.id,
        slug: challenge.slug,
        type: challenge.type,
      },
      { status: 201 },
    );
  } catch (error) {
    return serverError(error);
  }
}
