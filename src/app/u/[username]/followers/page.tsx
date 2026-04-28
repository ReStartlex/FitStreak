import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { UserList } from "@/components/social/UserList";
import { getBlockedSets } from "@/lib/api/blocks";

interface Params {
  username: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username} · followers — FitStreak` };
}

export default async function FollowersPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username } = await params;
  const session = await auth();
  const me = session?.user?.id ?? null;
  const target = await db.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, name: true, username: true, isPublic: true },
  });
  if (!target) notFound();
  if (!target.isPublic && me !== target.id) notFound();

  // Hide the page entirely if either party blocked the other.
  const blocks = await getBlockedSets(me);
  if (me && me !== target.id && blocks.any.has(target.id)) notFound();

  // Most-recent followers first (cap at 200 for the v1 page). Also
  // strip out anyone the visitor has blocked or who blocked them.
  const rows = await db.follow.findMany({
    where: {
      followingId: target.id,
      ...(blocks.any.size > 0
        ? { followerId: { notIn: Array.from(blocks.any) } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      follower: {
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
  });

  return (
    <>
      <Header />
      <main className="pt-10 sm:pt-16 pb-16 sm:pb-24">
        <div className="container max-w-2xl">
          <Link
            href={`/u/${target.username}`}
            className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink mb-6"
          >
            <ArrowLeft className="size-4" />@{target.username}
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
            {target.name ?? `@${target.username}`}
          </h1>
          <p className="text-sm text-ink-muted mb-6">
            {rows.length}{" "}
            {rows.length === 1 ? "follower" : "followers"}
          </p>
          <UserList
            users={rows.map((r) => ({
              id: r.follower.id,
              name: r.follower.name ?? r.follower.username ?? "Athlete",
              username: r.follower.username,
              image: r.follower.image,
              level: r.follower.level,
              currentStreak: r.follower.currentStreak,
            }))}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
