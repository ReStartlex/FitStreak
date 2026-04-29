import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { siteConfig, absoluteUrl } from "@/lib/site";
import {
  JsonLd,
  organizationSchema,
  websiteSchema,
  softwareApplicationSchema,
} from "@/lib/seo/jsonld";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const defaultTitle = `${siteConfig.name} — ${siteConfig.tagline.en}`;

export const metadata: Metadata = {
  title: {
    default: defaultTitle,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description.ru,
  applicationName: siteConfig.name,
  authors: [...siteConfig.authors],
  creator: siteConfig.publisher,
  publisher: siteConfig.publisher,
  keywords: [...siteConfig.keywords],
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
    languages: {
      "ru-RU": "/",
      "en-US": "/",
      "x-default": "/",
    },
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: `${siteConfig.name} blog` },
      ],
    },
  },
  manifest: "/manifest.webmanifest",
  category: "fitness",
  openGraph: {
    title: defaultTitle,
    description: siteConfig.description.ru,
    siteName: siteConfig.name,
    type: "website",
    url: siteConfig.url,
    locale: siteConfig.locale.default,
    alternateLocale: [...siteConfig.locale.alternates],
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: defaultTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.social.twitter,
    creator: siteConfig.social.twitter,
    title: siteConfig.name,
    description: siteConfig.tagline.en,
    images: [absoluteUrl("/opengraph-image")],
  },
  robots: {
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
  formatDetection: {
    email: false,
    telephone: false,
  },
  verification: {
    ...(siteConfig.verification.google
      ? { google: siteConfig.verification.google }
      : {}),
    ...(siteConfig.verification.yandex
      ? { yandex: siteConfig.verification.yandex }
      : {}),
    ...(siteConfig.verification.bing
      ? { other: { "msvalidate.01": siteConfig.verification.bing } }
      : {}),
  },
  icons: {
    icon: [{ url: "/icon", sizes: "any" }],
    apple: [{ url: "/apple-icon", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <JsonLd id="ld-org" data={organizationSchema()} />
        <JsonLd id="ld-website" data={websiteSchema()} />
        <JsonLd id="ld-app" data={softwareApplicationSchema()} />
      </head>
      <body className="min-h-dvh antialiased">
        <Providers>
          {children}
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}
