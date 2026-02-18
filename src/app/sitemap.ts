import type { MetadataRoute } from "next";
import { brandsData } from "@/data/brands";
import { cityData, getAllStateSlugs } from "@/data/cities";
import { LOCALES } from "@/lib/i18n/translations";
import { buildBrandUrl, buildDayUrl, CANONICAL_DAYS } from "@/lib/i18n/url-patterns";

const SITE_URL = "https://isopenow.com";
const NOW = new Date();

function absolute(path: string): string {
  return `${SITE_URL}${path}`;
}

function uniqueCategorySlugs(): string[] {
  const slugs = new Set(
    brandsData
      .map((item) => item.brand.category)
      .filter((category): category is string => Boolean(category))
      .map((category) => category.toLowerCase().replace(/\s+/g, "-"))
  );

  return [...slugs];
}

function item(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap[number] {
  return {
    url: absolute(path),
    lastModified: NOW,
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  const categories = uniqueCategorySlugs();
  const brandSlugs = brandsData.map((item) => item.brand.slug);
  const stateSlugs = getAllStateSlugs();
  const cityCategoryLocales = ["fr", "es", "de"] as const;

  urls.push(item("/", "daily", 1.0));
  urls.push(item("/about", "monthly", 0.5));
  urls.push(item("/contact", "monthly", 0.5));
  urls.push(item("/privacy", "yearly", 0.3));
  urls.push(item("/terms", "yearly", 0.3));
  urls.push(item("/city", "daily", 0.8));
  urls.push(item("/state", "daily", 0.75));
  urls.push(item("/near-me", "daily", 0.8));
  urls.push(...cityData.map((city) => item(`/city/${city.slug}`, "daily", 0.75)));
  urls.push(...stateSlugs.map((stateSlug) => item(`/state/${stateSlug}`, "daily", 0.72)));
  urls.push(...categories.map((categorySlug) => item(`/near-me/${categorySlug}`, "daily", 0.82)));

  // Brand x City pages (high money intent)
  for (const city of cityData) {
    for (const brandSlug of city.featuredBrandSlugs) {
      urls.push(item(`/city/${city.slug}/is-${brandSlug}-open`, "daily", 0.85));
    }
    for (const focusCategory of city.focusCategories) {
      const focusSlug = focusCategory.toLowerCase().replace(/\s+/g, "-");
      if (categories.includes(focusSlug)) {
        urls.push(item(`/city/${city.slug}/category/${focusSlug}`, "daily", 0.83));
        for (const locale of cityCategoryLocales) {
          urls.push(item(`/${locale}/city/${city.slug}/category/${focusSlug}`, "daily", 0.75));
        }
      }
    }
  }

  for (const stateSlug of stateSlugs) {
    const stateCities = cityData.filter((city) => city.state.toLowerCase() === stateSlug);
    const stateCategorySlugs = [...new Set(
      stateCities
        .flatMap((city) => city.focusCategories)
        .map((focusCategory) => focusCategory.toLowerCase().replace(/\s+/g, "-"))
        .filter((focusSlug) => categories.includes(focusSlug))
    )];

    for (const stateCategorySlug of stateCategorySlugs) {
      urls.push(item(`/state/${stateSlug}/category/${stateCategorySlug}`, "daily", 0.81));
    }
  }

  for (const locale of LOCALES) {
    if (locale !== "en") {
      urls.push(item(`/${locale}`, "daily", 0.9));
    }

    for (const category of categories) {
      const categoryPath = locale === "en" ? `/category/${category}` : `/${locale}/category/${category}`;
      urls.push(item(categoryPath, "daily", 0.8));
    }

    for (const slug of brandSlugs) {
      urls.push(item(buildBrandUrl(locale, slug), "daily", 0.9));

      for (const day of CANONICAL_DAYS) {
        urls.push(item(buildDayUrl(locale, slug, day), "daily", 0.8));
      }
    }
  }

  return urls;
}
