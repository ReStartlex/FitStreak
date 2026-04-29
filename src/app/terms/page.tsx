import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/jsonld";
import TermsClient from "./client";

export const metadata: Metadata = buildMetadata({
  title: "Условия использования FitStreak",
  description:
    "Правила пользования FitStreak: аккаунт, поведение, ответственность, оплата и разрешение споров.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <JsonLd
        id="ld-terms-breadcrumbs"
        data={breadcrumbSchema([
          { name: "FitStreak", url: "/" },
          { name: "Terms", url: "/terms" },
        ])}
      />
      <TermsClient />
    </>
  );
}
