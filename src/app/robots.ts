import type { MetadataRoute } from "next";
import { BLOCKED_LOCALES } from "@/lib/seo-index-control";

/**
 * Robots.txt strategy:
 * - Allow all high-quality public pages
 * - Disallow blocked locale prefixes (low-demand, near-duplicate content)
 * - Disallow API, admin, embed, and search routes
 *
 * Blocked locales: ja, ko, nl, pl, sv, ar, hi, zh, tr
 * Disallowed at robots level to preserve crawl budget.
 * Pages remain accessible to users; search engines skip them.
 */
export default function robots(): MetadataRoute.Robots {
  const blockedLocalePaths = BLOCKED_LOCALES.map((locale) => `/${locale}/`);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/search",
          "/embed/",
          ...blockedLocalePaths,
        ],
      },
      {
        userAgent: "AhrefsBot",
        crawlDelay: 10,
      },
      {
        userAgent: "SemrushBot",
        crawlDelay: 10,
      },
    ],
    sitemap: "https://isopenow.com/sitemap.xml",
    host: "https://isopenow.com",
  };
}
