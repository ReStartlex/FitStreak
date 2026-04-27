import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fitstreak.app";

export const metadata: Metadata = {
  title: {
    default: "FitStreak — Streak. Show up. Every day.",
    template: "%s · FitStreak",
  },
  description:
    "FitStreak — социальная платформа ежедневной активности. Серия дней, челленджи, рейтинги. Простой трекер, сильная мотивация, живое сообщество.",
  applicationName: "FitStreak",
  keywords: [
    "fitstreak",
    "fitness",
    "streak",
    "habit",
    "challenges",
    "leaderboard",
    "push-ups",
    "трекер привычек",
    "челлендж",
    "фитнес",
  ],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
    languages: {
      ru: "/",
      en: "/",
    },
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "FitStreak — Streak. Show up. Every day.",
    description:
      "Социальная платформа ежедневной активности. Серия дней, челленджи, рейтинги.",
    siteName: "FitStreak",
    type: "website",
    url: "/",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "FitStreak",
    description: "Streak. Show up. Every day.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    email: false,
    telephone: false,
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
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
