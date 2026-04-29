import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";

interface BuildMetadataInput {
  title: string;
  description: string;
  /** Path relative to siteConfig.url, e.g. `/pricing` or `/blog/why-streaks-work`. */
  path: string;
  ogImage?: string;
  /** Defaults to `website`. Use `article` for blog posts and `profile` for user pages. */
  ogType?: "website" | "article" | "profile";
  /** Set to true for non-public, app-shell pages we don't want indexed. */
  noIndex?: boolean;
  keywords?: string[];
  /** Optional ISO publish date for OpenGraph article tags. */
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Build a `Metadata` object that always carries:
 *   - canonical absolute URL
 *   - hreflang alternates (ru/en/x-default)
 *   - OG + Twitter cards with absolute image URL
 *   - sane robots directives
 *
 * This is the function every Page should use instead of hand-rolling
 * its own `metadata` export.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const {
    title,
    description,
    path,
    ogImage,
    ogType = "website",
    noIndex = false,
    keywords,
    publishedTime,
    modifiedTime,
  } = input;

  const canonical = absoluteUrl(path);
  const image = ogImage ?? absoluteUrl("/opengraph-image");

  return {
    title,
    description,
    keywords: keywords ?? [...siteConfig.keywords],
    alternates: {
      canonical,
      languages: {
        "ru-RU": canonical,
        "en-US": canonical,
        "x-default": canonical,
      },
    },
    openGraph: {
      type: ogType,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      locale: siteConfig.locale.default,
      alternateLocale: [...siteConfig.locale.alternates],
      ...(ogType === "article" && publishedTime
        ? { publishedTime, modifiedTime: modifiedTime ?? publishedTime }
        : {}),
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.social.twitter,
      creator: siteConfig.social.twitter,
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: { index: false, follow: false },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
