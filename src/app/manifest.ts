import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/?source=pwa",
    name: `${siteConfig.name} — ${siteConfig.tagline.ru}`,
    short_name: siteConfig.name,
    description: siteConfig.description.ru,
    start_url: "/dashboard?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#0A0A0B",
    theme_color: "#0A0A0B",
    categories: ["fitness", "lifestyle", "health", "sports", "productivity"],
    lang: "ru",
    dir: "ltr",
    prefer_related_applications: false,
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
