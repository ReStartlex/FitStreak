import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/jsonld";
import { siteConfig } from "@/lib/site";
import ContactClient from "./client";

export const metadata: Metadata = buildMetadata({
  title: "Связаться с FitStreak — поддержка и обратная связь",
  description:
    "Напишите нам по любому вопросу: поддержка, баги, фичи, биллинг, пресса, безопасность. Команда FitStreak отвечает в рабочие дни в течение 24 часов.",
  path: "/contact",
  keywords: [
    "fitstreak контакты",
    "fitstreak support",
    "связаться fitstreak",
    "поддержка fitstreak",
    "fitstreak bug report",
  ],
});

const contactPointSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  url: `${siteConfig.url}/contact`,
  mainEntity: {
    "@type": "Organization",
    name: siteConfig.name,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: siteConfig.contact.support,
        availableLanguage: ["Russian", "English"],
      },
      {
        "@type": "ContactPoint",
        contactType: "security",
        email: siteConfig.contact.security,
        availableLanguage: ["Russian", "English"],
      },
      {
        "@type": "ContactPoint",
        contactType: "privacy",
        email: siteConfig.contact.privacy,
        availableLanguage: ["Russian", "English"],
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        id="ld-contact-breadcrumbs"
        data={breadcrumbSchema([
          { name: "FitStreak", url: "/" },
          { name: "Контакты", url: "/contact" },
        ])}
      />
      <JsonLd id="ld-contact-page" data={contactPointSchema} />
      <ContactClient />
    </>
  );
}
