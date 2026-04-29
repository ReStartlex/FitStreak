import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/jsonld";
import PrivacyClient from "./client";

export const metadata: Metadata = buildMetadata({
  title: "Политика конфиденциальности FitStreak",
  description:
    "Какие данные собирает FitStreak, зачем они нужны и как ими управлять. Минимум данных, никаких рекламных сетей.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        id="ld-privacy-breadcrumbs"
        data={breadcrumbSchema([
          { name: "FitStreak", url: "/" },
          { name: "Privacy", url: "/privacy" },
        ])}
      />
      <PrivacyClient />
    </>
  );
}
