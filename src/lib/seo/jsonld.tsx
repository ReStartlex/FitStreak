import * as React from "react";
import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * Helper component that emits a `<script type="application/ld+json">`
 * payload. Renders nothing on the client, since structured data is
 * meant for crawlers — but it stays SSR-rendered for them to find.
 */
export function JsonLd({ data, id }: { data: object; id?: string }) {
  return (
    <script
      type="application/ld+json"
      id={id}
      // We deliberately stringify on the server. JSON.stringify already
      // escapes `<` poorly for inline JSON-LD, so we patch the unsafe
      // sequences after the fact.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
          .replace(/</g, "\\u003c")
          .replace(/>/g, "\\u003e")
          .replace(/&/g, "\\u0026"),
      }}
    />
  );
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon"),
      width: 512,
      height: 512,
    },
    sameAs: [
      siteConfig.social.telegram,
      siteConfig.social.instagram,
      `https://twitter.com/${siteConfig.social.twitter.replace(/^@/, "")}`,
    ].filter(Boolean),
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: siteConfig.contact.support,
        availableLanguage: ["Russian", "English"],
      },
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description.ru,
    publisher: { "@id": `${siteConfig.url}#organization` },
    inLanguage: ["ru-RU", "en-US"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/leaderboard?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    operatingSystem: "Web, iOS, Android",
    applicationCategory: "HealthApplication",
    applicationSubCategory: "Fitness",
    url: siteConfig.url,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "120",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : absoluteUrl(item.url),
    })),
  };
}

export interface BlogPostingInput {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  image?: string;
}

export function blogPostingSchema(p: BlogPostingInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    datePublished: p.datePublished,
    dateModified: p.dateModified ?? p.datePublished,
    image: p.image ?? absoluteUrl(`/blog/${p.slug}/opengraph-image`),
    url: absoluteUrl(`/blog/${p.slug}`),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${p.slug}`),
    },
    author: {
      "@type": "Organization",
      name: p.authorName ?? siteConfig.publisher,
      url: siteConfig.url,
    },
    publisher: { "@id": `${siteConfig.url}#organization` },
  };
}

export interface ProfilePageInput {
  username: string;
  displayName: string;
  level: number;
  currentStreak: number;
  bestStreak: number;
  joinedAt: string;
}

export function profilePageSchema(p: ProfilePageInput) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: p.displayName,
      alternateName: p.username,
      url: absoluteUrl(`/u/${p.username}`),
      image: absoluteUrl(`/u/${p.username}/opengraph-image`),
      memberOf: { "@id": `${siteConfig.url}#organization` },
      description: `${p.displayName} — level ${p.level}, ${p.currentStreak}-day streak (best ${p.bestStreak}) on FitStreak.`,
    },
    dateCreated: p.joinedAt,
  };
}

export interface FaqInput {
  q: string;
  a: string;
}

export function faqPageSchema(items: FaqInput[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
