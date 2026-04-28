import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitStreak — Streak. Show up. Every day.",
    short_name: "FitStreak",
    description:
      "FitStreak — социальная платформа ежедневной активности. Серия дней, челленджи, рейтинги.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0A0A0B",
    theme_color: "#0A0A0B",
    categories: ["fitness", "lifestyle", "health", "sports"],
    lang: "ru",
    icons: [
      {
        src: "/icon",
        sizes: "192x192 512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "192x192 512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Open today's progress",
        url: "/dashboard",
      },
      {
        name: "Challenges",
        short_name: "Challenges",
        description: "Browse and join challenges",
        url: "/challenges",
      },
      {
        name: "Leaderboard",
        short_name: "Leaderboard",
        description: "See where you rank",
        url: "/leaderboard",
      },
    ],
  };
}
