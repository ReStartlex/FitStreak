import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChallengesClient } from "./client";
import type { ApiChallengeView } from "@/components/challenges/ApiChallengeCard";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Челленджи FitStreak — отжимания, бег, приседания",
  description:
    "Открытые и приватные челленджи FitStreak: 30 дней отжиманий, недельный бег, дуэли с друзьями. Присоединяйся к любому за один клик.",
  path: "/challenges",
  keywords: [
    "fitstreak челленджи",
    "fitstreak challenges",
    "30 day push up challenge",
    "running challenge",
    "челлендж приседаний",
    "челлендж бег 7 дней",
    "fitness challenge online",
  ],
});

export const dynamic = "force-dynamic";

export default async function ChallengesPage() {
  const session = await auth();
  const myId = session?.user?.id ?? null;

  const rows = await db.challenge.findMany({
    where: {
      OR: [
        { type: "PUBLIC" },
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

  const challenges: ApiChallengeView[] = rows.map((c) => ({
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
    participantsCount: c.participantsCount,
    isFeatured: c.isFeatured,
    type: c.type,
    endsAt: c.endsAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    myProgress: c.participants?.[0]?.progress ?? null,
    joined: Boolean(c.participants?.[0]),
    completed: Boolean(c.participants?.[0]?.completed),
  }));

  return (
    <>
      <Header />
      <ChallengesClient
        challenges={challenges}
        isAuthed={Boolean(myId)}
      />
      <Footer />
    </>
  );
}
