import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OnboardingClient } from "./client";

export const metadata: Metadata = {
  title: "Onboarding — FitStreak",
};

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?from=/onboarding");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      gender: true,
      age: true,
      heightCm: true,
      weightKg: true,
      fitnessLevel: true,
      goal: true,
      onboarded: true,
    },
  });
  if (!user) redirect("/signin");
  if (user.onboarded) redirect("/dashboard");

  return <OnboardingClient initial={user} />;
}
