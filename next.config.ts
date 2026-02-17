import type { NextConfig } from "next";

const DAYS = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
  "christmas", "thanksgiving", "new-years", "easter",
];

const nextConfig: NextConfig = {
  async rewrites() {
    // Build temporal rewrites for each day
    const temporalRewrites = DAYS.map((day) => ({
      source: `/is-:slug-open-on-${day}`,
      destination: `/brand/:slug/${day}`,
    }));

    return [
      // Temporal pages first (more specific)
      ...temporalRewrites,
      // i18n brand pages: /fr/is-mcdonalds-open → /fr/brand/mcdonalds
      {
        source: "/:locale(fr|es)/is-:slug-open",
        destination: "/:locale/brand/:slug",
      },
      // Main brand pages: /is-mcdonalds-open → /brand/mcdonalds
      {
        source: "/is-:slug-open",
        destination: "/brand/:slug",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
