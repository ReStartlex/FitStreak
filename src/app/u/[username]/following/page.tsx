import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { PaginatedUserList } from "@/components/social/PaginatedUserList";
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
  return { title: `@${username} · following — FitStreak` };
}

export default async function FollowingPage({
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

  const blocks = await getBlockedSets(me);
  if (me && me !== target.id && blocks.any.has(target.id)) notFound();

  const PAGE = 30;
  const rows = await db.follow.findMany({
    where: {
      followerId: target.id,
      ...(blocks.any.size > 0
        ? { followingId: { notIn: Array.from(blocks.any) } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: PAGE + 1,
    include: {
      following: {
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
  const hasMore = rows.length > PAGE;
  const visibleRows = hasMore ? rows.slice(0, PAGE) : rows;
  const initialCursor = hasMore
    ? visibleRows[visibleRows.length - 1]?.id ?? null
    : null;
  const totalFollowing = await db.follow.count({
    where: { followerId: target.id },
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
            {totalFollowing} following
          </p>
          <PaginatedUserList
            endpoint={`/api/users/${target.username}/following`}
            initialUsers={visibleRows.map((r) => ({
              id: r.following.id,
              name: r.following.name ?? r.following.username ?? "Athlete",
              username: r.following.username,
              image: r.following.image,
              level: r.following.level,
              currentStreak: r.following.currentStreak,
            }))}
            initialCursor={initialCursor}
            initialHasMore={hasMore}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
