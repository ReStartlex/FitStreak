import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/jsonld";
import LeaderboardClient from "./client";

export const metadata: Metadata = buildMetadata({
  title: "Лидерборд FitStreak — самые длинные серии и лучшие атлеты",
  description:
    "Глобальный рейтинг FitStreak: самые длинные серии, топ по энергии и уровням. Сравни себя с друзьями и сообществом.",
  path: "/leaderboard",
  keywords: [
    "fitstreak лидерборд",
    "fitstreak leaderboard",
    "топ серий",
    "лучшие атлеты fitstreak",
    "global fitness leaderboard",
    "longest streak",
  ],
});

export default function LeaderboardPage() {
  return (
    <>
      <JsonLd
        id="ld-leaderboard-breadcrumbs"
        data={breadcrumbSchema([
          { name: "FitStreak", url: "/" },
          { name: "Лидерборд", url: "/leaderboard" },
        ])}
      />
      <LeaderboardClient />
    </>
  );
}
