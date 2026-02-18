/**
 * SEO Indexation Control System
 *
 * Governs which URLs receive `index` vs `noindex` directives.
 * Strategy: Quality > Quantity. Start with ~3,500 indexable URLs, expand progressively.
 *
 * Tiers:
 *  - Tier 1 (always index): top 30 brands EN, holiday pages, open-late, open-24h, blog, core locales
 *  - Tier 2 (conditionally index): remaining EN brands, top-20-city pages, state pages
 *  - Tier 3 (noindex, crawl-control): non-priority locales, locale day pages for non-top brands, embed
 *
 * Locale strategy:
 *  - PRIORITY_LOCALES: full brand + day page indexing (fr, es, de)
 *  - SECONDARY_LOCALES: brand pages only, no day pages (pt, it)
 *  - BLOCKED_LOCALES: noindex all pages (ja, ko, nl, pl, sv, ar, hi, zh, tr)
 *
 * Scaling plan:
 *  - Phase A (now): ~3,500 indexable URLs
 *  - Phase B (+3mo): unlock secondary locales day pages → +1,500 URLs
 *  - Phase C (+6mo): unlock next 20 brands in priority locales → +500 URLs
 */

// ─────────────────────────────────────────────────────────────────────────────
// LOCALE TIERS
// ─────────────────────────────────────────────────────────────────────────────

/** Full indexing: brand pages + day pages */
export const PRIORITY_LOCALES = ["fr", "es", "de"] as const;

/** Brand pages only (no day pages indexed yet) */
export const SECONDARY_LOCALES = ["pt", "it"] as const;

/** Noindex all: crawl budget protection */
export const BLOCKED_LOCALES = ["ja", "ko", "nl", "pl", "sv", "ar", "hi", "zh", "tr"] as const;

export type PriorityLocale = typeof PRIORITY_LOCALES[number];
export type SecondaryLocale = typeof SECONDARY_LOCALES[number];
export type BlockedLocale = typeof BLOCKED_LOCALES[number];

// ─────────────────────────────────────────────────────────────────────────────
// BRAND TIERS — ordered by estimated US search demand
// ─────────────────────────────────────────────────────────────────────────────

/** Top 30 brands: maximum investment in locale + day page coverage */
export const TOP_BRANDS: readonly string[] = [
  "mcdonalds",
  "walmart",
  "starbucks",
  "target",
  "costco",
  "cvs",
  "walgreens",
  "home-depot",
  "burger-king",
  "taco-bell",
  "chick-fil-a",
  "wendys",
  "chipotle",
  "subway",
  "dominos",
  "pizza-hut",
  "kfc",
  "dunkin",
  "whole-foods",
  "kroger",
  "lowes",
  "best-buy",
  "dollar-general",
  "dollar-tree",
  "rite-aid",
  "seven-eleven",
  "fedex",
  "ups",
  "hobby-lobby",
  "sams-club",
] as const;

/** Top 20 cities for city×brand pages — by population and index potential */
export const TOP_CITIES: readonly string[] = [
  "new-york",
  "los-angeles",
  "chicago",
  "houston",
  "phoenix",
  "philadelphia",
  "san-antonio",
  "san-diego",
  "dallas",
  "san-francisco",
  "seattle",
  "miami",
  "boston",
  "atlanta",
  "denver",
  "las-vegas",
  "minneapolis",
  "portland",
  "austin",
  "nashville",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// INDEXATION DECISIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Should a locale brand page receive `index` directive?
 * EN brand pages are always indexed via the main /brand/[slug] route.
 */
export function shouldIndexLocaleBrandPage(locale: string): boolean {
  return (
    (PRIORITY_LOCALES as readonly string[]).includes(locale) ||
    (SECONDARY_LOCALES as readonly string[]).includes(locale)
  );
}

/**
 * Should a locale + brand + day combo receive `index` directive?
 * Only for priority locales + top brands to prevent crawl dilution.
 */
export function shouldIndexLocaleDayPage(locale: string, brandSlug: string): boolean {
  if (!(PRIORITY_LOCALES as readonly string[]).includes(locale)) return false;
  return TOP_BRANDS.includes(brandSlug);
}

/**
 * Is this a top-tier brand? (used for sitemap priority and city×brand linking)
 */
export function isTopBrand(slug: string): boolean {
  return TOP_BRANDS.includes(slug);
}

/**
 * Is this a top-tier city? (used for city×brand sitemap filtering)
 */
export function isTopCity(slug: string): boolean {
  return TOP_CITIES.includes(slug);
}

/**
 * Get the robots meta directive for a given locale page.
 * Returns Next.js Metadata `robots` value.
 */
export function getLocaleRobots(
  locale: string
): { index: boolean; follow: boolean } {
  if ((BLOCKED_LOCALES as readonly string[]).includes(locale)) {
    return { index: false, follow: true };
  }
  return { index: true, follow: true };
}

/**
 * Get robots for a locale day page.
 */
export function getLocaleDayRobots(
  locale: string,
  brandSlug: string
): { index: boolean; follow: boolean } {
  if (shouldIndexLocaleDayPage(locale, brandSlug)) {
    return { index: true, follow: true };
  }
  return { index: false, follow: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// SITEMAP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the locales that should appear in the sitemap for brand pages.
 * Excludes EN (handled by main /brand/[slug] route) and blocked locales.
 */
export function getSitemapLocales(): string[] {
  return [...PRIORITY_LOCALES, ...SECONDARY_LOCALES];
}

/**
 * Returns the locales for which day pages should appear in the sitemap.
 */
export function getDayPageSitemapLocales(): string[] {
  return [...PRIORITY_LOCALES];
}

/**
 * Calculate a simple demand score for a brand+locale combo (0–100).
 * Used for progressive unlock decisions.
 */
export function brandLocaleScore(brandSlug: string, locale: string): number {
  const brandRank = TOP_BRANDS.indexOf(brandSlug);
  const brandScore = brandRank === -1 ? 20 : Math.max(0, 100 - brandRank * 3);

  const localeWeight: Record<string, number> = {
    fr: 90,
    es: 95,
    de: 85,
    pt: 70,
    it: 65,
    nl: 50,
    pl: 45,
    sv: 40,
    ko: 35,
    ja: 30,
    zh: 25,
    ar: 20,
    hi: 15,
    tr: 10,
  };

  return Math.round(brandScore * ((localeWeight[locale] ?? 10) / 100));
}

/** Minimum score required to unlock indexing (progressive threshold) */
export const INDEX_THRESHOLD = 50;
