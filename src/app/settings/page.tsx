import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { SettingsClient } from "./client";

export const metadata: Metadata = {
  title: "Settings — FitStreak",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?from=/settings");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      locale: true,
      image: true,
      plan: true,
      emailVerified: true,
      streakFreezes: true,
      currentStreak: true,
      bestStreak: true,
      level: true,
      totalXp: true,
      reminders: true,
      isPublic: true,
      showOnLeaderboard: true,
    },
  });
  if (!user) redirect("/signin");

  return (
    <>
      <Header />
      <SettingsClient
        user={{
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          locale: user.locale,
          image: user.image,
          plan: user.plan,
          emailVerified: Boolean(user.emailVerified),
          streakFreezes: user.streakFreezes,
          currentStreak: user.currentStreak,
          bestStreak: user.bestStreak,
          level: user.level,
          totalXp: user.totalXp,
          isPublic: user.isPublic,
          showOnLeaderboard: user.showOnLeaderboard,
          reminders: user.reminders
            ? {
                enabled: user.reminders.enabled,
                emailEnabled: user.reminders.emailEnabled,
                pushEnabled: user.reminders.pushEnabled,
                smartMode: user.reminders.smartMode,
                weekendsOff: user.reminders.weekendsOff,
                morningTime: user.reminders.morningTime,
                eveningTime: user.reminders.eveningTime,
              }
            : null,
        }}
      />
      <Footer />
    </>
  );
}
