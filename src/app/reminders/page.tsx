import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RemindersClient } from "./client";

export const metadata: Metadata = {
  title: "Reminders — FitStreak",
};

export default async function RemindersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?from=/reminders");

  const config = await db.reminderConfig.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  return (
    <RemindersClient
      initial={{
        enabled: config.enabled,
        morningTime: config.morningTime,
        eveningTime: config.eveningTime,
        weekendsOff: config.weekendsOff,
        smartMode: config.smartMode,
        pushEnabled: config.pushEnabled,
        emailEnabled: config.emailEnabled,
      }}
    />
  );
}
