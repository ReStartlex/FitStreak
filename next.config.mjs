/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

// Hosts that should always 301 to the canonical fitstreak.ru. We only
// redirect *stable* aliases that crawlers may have discovered (the old
// fitstreak-orcin.vercel.app, the per-project alias and the www
// variant). Per-deployment preview URLs are NOT in this list, so PR
// previews keep working under their unique vercel.app hostname.
const NON_CANONICAL_HOSTS = [
  "fitstreak-orcin.vercel.app",
  "fitstreak.vercel.app",
  "fitstreak-dlyauchebitpgu-9164s-projects.vercel.app",
  "www.fitstreak.ru",
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.yandex.net" },
      { protocol: "https", hostname: "sun9-*.userapi.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async redirects() {
    return NON_CANONICAL_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host", value: host }],
      destination: "https://fitstreak.ru/:path*",
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Sitemap and robots get a short shared cache so refreshes
        // propagate to crawlers within an hour, but we still serve
        // them from CDN.
        source: "/(sitemap.xml|robots.txt|feed.xml)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
