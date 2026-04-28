import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { ChallengeDetailClient } from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Challenge — FitStreak",
};

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const myId = session?.user?.id ?? null;

  const challenge = await db.challenge.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      participants: {
        take: 50,
        orderBy: { progress: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              level: true,
              currentStreak: true,
            },
          },
        },
      },
    },
  });

  if (!challenge) notFound();

  // Permission: PERSONAL or FRIENDS challenges are private to creator/participants
  if (challenge.type !== "PUBLIC") {
    const isCreator = myId && challenge.createdById === myId;
    const isParticipant =
      myId && challenge.participants.some((p) => p.userId === myId);
    if (!isCreator && !isParticipant) {
      notFound();
    }
  }

  const me = myId
    ? challenge.participants.find((p) => p.userId === myId) ?? null
    : null;

  return (
    <>
      <Header />
      <ChallengeDetailClient
        isAuthed={Boolean(myId)}
        challenge={{
          id: challenge.id,
          slug: challenge.slug,
          title: { ru: challenge.titleRu, en: challenge.titleEn },
          description: { ru: challenge.descRu, en: challenge.descEn },
          metric: challenge.metric,
          exerciseId: challenge.exerciseId,
          goal: challenge.goal,
          durationDays: challenge.durationDays,
          difficulty: challenge.difficulty,
          rewardXp: challenge.rewardXp,
          rewardEnergy: challenge.rewardEnergy,
          participantsCount: challenge.participantsCount,
          isFeatured: challenge.isFeatured,
          type: challenge.type,
          createdById: challenge.createdById,
          endsAt: challenge.endsAt?.toISOString() ?? null,
          createdAt: challenge.createdAt.toISOString(),
          leaderboard: challenge.participants.map((p, i) => ({
            rank: i + 1,
            userId: p.userId,
            name: p.user.name ?? p.user.username ?? "Anon",
            avatar: p.user.image,
            level: p.user.level,
            streak: p.user.currentStreak,
            progress: p.progress,
            completed: p.completed,
            isMe: p.userId === myId,
          })),
          myProgress: me?.progress ?? null,
          joined: Boolean(me),
          completed: Boolean(me?.completed),
        }}
      />
      <Footer />
    </>
  );
}
