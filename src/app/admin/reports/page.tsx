import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { isAdmin } from "@/lib/auth-admin";
import { buildMetadata } from "@/lib/seo/metadata";

import { AdminReportsClient } from "./client";

export const metadata: Metadata = buildMetadata({
  title: "Reports — Admin",
  description: "Internal moderation queue.",
  path: "/admin/reports",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const admin = await isAdmin();
  if (!admin.ok) {
    // Don't even leak the existence of the page to non-admins.
    notFound();
  }

  const initial = await db.report.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      category: true,
      comment: true,
      status: true,
      createdAt: true,
      reporter: {
        select: { id: true, username: true, name: true, email: true },
      },
      target: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          currentStreak: true,
          level: true,
        },
      },
    },
  });

  const counts = await db.report.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const summary = Object.fromEntries(
    counts.map((c) => [c.status, c._count._all]),
  ) as Record<string, number>;

  return (
    <>
      <Header />
      <AdminReportsClient
        initial={initial.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
        counts={summary}
      />
      <Footer />
    </>
  );
}
