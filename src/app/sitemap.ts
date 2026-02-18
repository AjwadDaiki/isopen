import type { MetadataRoute } from "next";
import { brandsData } from "@/data/brands";
import { cityData, getAllStateSlugs } from "@/data/cities";
import { buildBrandUrl, buildDayUrl, CANONICAL_DAYS } from "@/lib/i18n/url-patterns";
import type { Locale } from "@/lib/i18n/translations";
import {
  TOP_BRANDS,
  TOP_CITIES,
  getSitemapLocales,
  getDayPageSitemapLocales,
} from "@/lib/seo-index-control";

/**
 * Sitemap — Phase A (target: ~3,500 quality URLs)
 *
 * Strategy:
 *  - EN: all brands + all day pages = 121 + 968
 *  - Priority locales (fr/es/de/pt/it): brand pages only = 5 × 121 = 605
 *  - Day pages: fr/es/de × top 30 brands × 8 days = 720
 *  - Cities: 56 cities + city×category combos (~168) + top-20×top-30 brand combos (~300)
 *  - States: 50 + state×category (~80)
 *  - Categories/Near-me/Open-late: 15 × 3 = 45
 *  - Holiday (10) + Blog (3) + utility (7) + locale homes (5)
 *  - Locale city×category: fr/es/de (~504)
 *
 * Excluded:
 *  - Embed pages (noindex — wasteful in sitemap)
 *  - Blocked locales: ja/ko/nl/pl/sv/ar/hi/zh/tr
 *  - City×brand for non-top cities or non-top brands
 *  - Locale day pages for non-top brands
 */

const SITE_URL = "https://isopenow.com";
const NOW = new Date();

const HOLIDAY_SLUGS = [
  "christmas",
  "thanksgiving",
  "new-years",
  "easter",
  "black-friday",
  "christmas-eve",
  "new-years-eve",
  "memorial-day",
  "independence-day",
  "labor-day",
] as const;

const BLOG_SLUGS = [
  "top-10-stores-open-late",
  "24h-stores-near-you",
  "holiday-opening-hours",
] as const;

function absolute(path: string): string {
  return `${SITE_URL}${path}`;
}

function item(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap[number] {
  return { url: absolute(path), lastModified: NOW, changeFrequency, priority };
}

function uniqueCategorySlugs(): string[] {
  return [
    ...new Set(
      brandsData
        .map((e) => e.brand.category)
        .filter((c): c is string => Boolean(c))
        .map((c) => c.toLowerCase().replace(/\s+/g, "-"))
    ),
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  const categories = uniqueCategorySlugs();
  const allBrandSlugs = brandsData.map((e) => e.brand.slug);
  const stateSlugs = getAllStateSlugs();

  // Locale tiers (from seo-index-control.ts)
  const sitemapLocales = getSitemapLocales();     // fr, es, de, pt, it
  const dayLocales = getDayPageSitemapLocales();  // fr, es, de

  // ─── Core utility pages ──────────────────────────────────────────────────
  urls.push(item("/", "daily", 1.0));
  urls.push(item("/about", "monthly", 0.5));
  urls.push(item("/contact", "monthly", 0.5));
  urls.push(item("/privacy", "yearly", 0.3));
  urls.push(item("/terms", "yearly", 0.3));

  // ─── Hub pages ───────────────────────────────────────────────────────────
  urls.push(item("/city", "daily", 0.8));
  urls.push(item("/state", "daily", 0.75));
  urls.push(item("/near-me", "daily", 0.8));
  urls.push(item("/open-late", "daily", 0.85));
  urls.push(item("/open-24h", "daily", 0.85));
  urls.push(item("/open-now", "daily", 0.9));
  urls.push(item("/stores", "weekly", 0.82));
  urls.push(item("/hours", "weekly", 0.82));
  urls.push(item("/widget", "monthly", 0.65));
  urls.push(item("/holiday", "weekly", 0.8));
  urls.push(item("/blog", "weekly", 0.75));

  // ─── Holiday pages ────────────────────────────────────────────────────────
  for (const slug of HOLIDAY_SLUGS) {
    urls.push(item(`/holiday/${slug}`, "weekly", 0.82));
  }

  // ─── Open-on day pages (7 weekdays + 4 holidays = 11 pages) ─────────────
  const OPEN_ON_DAYS = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday","christmas","thanksgiving","new-years","easter"] as const;
  for (const day of OPEN_ON_DAYS) {
    urls.push(item(`/open-on/${day}`, "weekly", 0.78));
  }

  // ─── Blog posts ───────────────────────────────────────────────────────────
  for (const slug of BLOG_SLUGS) {
    urls.push(item(`/blog/${slug}`, "monthly", 0.72));
  }

  // ─── EN brand pages (all 121) + day pages ─────────────────────────────────
  for (const slug of allBrandSlugs) {
    urls.push(item(`/brand/${slug}`, "daily", 0.9));
    for (const day of CANONICAL_DAYS) {
      urls.push(item(buildDayUrl("en", slug, day), "daily", 0.8));
    }
  }

  // ─── EN category pages ────────────────────────────────────────────────────
  for (const cat of categories) {
    urls.push(item(`/category/${cat}`, "daily", 0.8));
    urls.push(item(`/near-me/${cat}`, "daily", 0.82));
    urls.push(item(`/open-late/${cat}`, "daily", 0.82));
  }

  // ─── City pages + city×category ──────────────────────────────────────────
  for (const city of cityData) {
    urls.push(item(`/city/${city.slug}`, "daily", 0.75));
    for (const focusCategory of city.focusCategories) {
      const focusSlug = focusCategory.toLowerCase().replace(/\s+/g, "-");
      if (categories.includes(focusSlug)) {
        urls.push(item(`/city/${city.slug}/category/${focusSlug}`, "daily", 0.83));
      }
    }
  }

  // ─── Top city × top brand pages (demand-filtered) ────────────────────────
  for (const city of cityData) {
    if (!TOP_CITIES.includes(city.slug)) continue;
    for (const brandSlug of city.featuredBrandSlugs) {
      if (!TOP_BRANDS.includes(brandSlug)) continue;
      urls.push(item(`/city/${city.slug}/is-${brandSlug}-open`, "daily", 0.85));
    }
  }

  // ─── State pages + state×category ────────────────────────────────────────
  for (const stateSlug of stateSlugs) {
    urls.push(item(`/state/${stateSlug}`, "daily", 0.72));
    const stateCities = cityData.filter((c) => c.state.toLowerCase() === stateSlug);
    const stateCats = [
      ...new Set(
        stateCities
          .flatMap((c) => c.focusCategories)
          .map((fc) => fc.toLowerCase().replace(/\s+/g, "-"))
          .filter((s) => categories.includes(s))
      ),
    ];
    for (const cat of stateCats) {
      urls.push(item(`/state/${stateSlug}/category/${cat}`, "daily", 0.81));
    }
  }

  // ─── Priority locale home + category + brand pages ───────────────────────
  for (const locale of sitemapLocales) {
    const loc = locale as Locale;
    urls.push(item(`/${locale}`, "daily", 0.9));
    for (const cat of categories) {
      urls.push(item(`/${locale}/category/${cat}`, "daily", 0.78));
    }
    for (const slug of allBrandSlugs) {
      urls.push(item(buildBrandUrl(loc, slug), "daily", 0.85));
    }
  }

  // ─── Priority locale day pages (fr/es/de × top 30 brands only) ───────────
  for (const locale of dayLocales) {
    const loc = locale as Locale;
    for (const slug of TOP_BRANDS) {
      if (!allBrandSlugs.includes(slug)) continue;
      for (const day of CANONICAL_DAYS) {
        urls.push(item(buildDayUrl(loc, slug, day), "daily", 0.75));
      }
    }
  }

  // ─── Priority locale city×category (fr/es/de) ────────────────────────────
  for (const locale of dayLocales) {
    for (const city of cityData) {
      for (const focusCategory of city.focusCategories) {
        const focusSlug = focusCategory.toLowerCase().replace(/\s+/g, "-");
        if (categories.includes(focusSlug)) {
          urls.push(item(`/${locale}/city/${city.slug}/category/${focusSlug}`, "daily", 0.75));
        }
      }
    }
  }

  return urls;
}
