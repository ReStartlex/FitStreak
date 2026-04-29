import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/jsonld";
import AboutClient from "./client";

export const metadata: Metadata = buildMetadata({
  title: "О проекте FitStreak — социальный фитнес каждый день",
  description:
    "Мы делаем простой трекер ежедневной активности с серией, рейтингами и живым сообществом. История проекта, ценности и команда FitStreak.",
  path: "/about",
  keywords: [
    "о fitstreak",
    "about fitstreak",
    "fitstreak команда",
    "история проекта fitstreak",
    "социальный фитнес",
    "продукт fitstreak",
  ],
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        id="ld-about-breadcrumbs"
        data={breadcrumbSchema([
          { name: "FitStreak", url: "/" },
          { name: "О проекте", url: "/about" },
        ])}
      />
      <AboutClient />
    </>
  );
}
