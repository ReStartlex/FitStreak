import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/jsonld";
import CareersClient from "./client";

export const metadata: Metadata = buildMetadata({
  title: "Карьера в FitStreak — присоединяйся к команде",
  description:
    "Открытые позиции и подход к работе в FitStreak. Мы маленькая команда, которая делает продукт, которым пользуется сама.",
  path: "/careers",
  keywords: [
    "fitstreak вакансии",
    "fitstreak careers",
    "fitstreak jobs",
    "работа в стартапе фитнес",
    "remote fitness jobs",
  ],
});

export default function CareersPage() {
  return (
    <>
      <JsonLd
        id="ld-careers-breadcrumbs"
        data={breadcrumbSchema([
          { name: "FitStreak", url: "/" },
          { name: "Карьера", url: "/careers" },
        ])}
      />
      <CareersClient />
    </>
  );
}
