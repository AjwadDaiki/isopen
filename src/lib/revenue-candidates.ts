import { brandsData } from "@/data/brands";
import { cityData, getAllStateSlugs, getCitiesByStateSlug, getStateCodeFromSlug, getStateName } from "@/data/cities";
import type { MonetizationDashboard } from "@/lib/monetization";

export interface RevenueCandidate {
  priority: "P0" | "P1" | "P2";
  score: number;
  path: string;
  template: string;
  rationale: string;
  action: string;
}

function inferTemplate(path: string): string {
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return "home";
  if (segments[0] === "brand") return segments.length >= 3 ? "brand_day" : "brand";
  if (segments[0] === "city") {
    if (segments.length === 2) return "city_page";
    if (segments[2] === "category") return "city_category";
    return "city_brand";
  }
  if (segments[0] === "state") {
    if (segments.length === 2) return "state_page";
    if (segments[2] === "category") return "state_category";
  }
  if (segments[0] === "category") return "category";
  if (segments[0] === "near-me") return segments.length === 1 ? "near_me_index" : "near_me_category";
  if (segments[0] === "fr" || segments[0] === "es" || segments[0] === "de") {
    if (segments[1] === "city" && segments[3] === "category") return "locale_city_category";
    if (segments[1] === "brand") return "locale_brand";
    if (segments[1] === "category") return "locale_category";
  }
  if (/^is-.+-open(?:-on-.+)?$/.test(segments[0])) return segments[0].includes("-open-on-") ? "brand_day" : "brand";
  return "other";
}

function priorityFromScore(score: number): "P0" | "P1" | "P2" {
  if (score >= 220) return "P0";
  if (score >= 130) return "P1";
  return "P2";
}

function roundScore(score: number): number {
  return Math.round(score * 10) / 10;
}

export function buildRevenueCandidates(monetization: MonetizationDashboard): RevenueCandidate[] {
  const byTemplate = new Map(monetization.byTemplate.map((row) => [row.template, row]));
  const categoryCountBySlug = new Map(
    [...new Set(
      brandsData
        .map((entry) => entry.brand.category)
        .filter((category): category is string => Boolean(category))
    )].map((category) => [
      category.toLowerCase().replace(/\s+/g, "-"),
      brandsData.filter((entry) => entry.brand.category === category).length,
    ])
  );

  const candidates: RevenueCandidate[] = [];
  const seen = new Set<string>();

  for (const row of monetization.topPaths.slice(0, 16)) {
    const template = inferTemplate(row.path);
    const tpl = byTemplate.get(template);
    const adRatio = tpl && tpl.pageViews ? tpl.adSlotViews / tpl.pageViews : monetization.adViewsPerPageView;
    const affiliateRate = tpl && tpl.pageViews ? tpl.affiliateClicks / tpl.pageViews : 0;
    const adOpportunity = adRatio < 1.1 ? (1.1 - adRatio) * 160 : 0;
    const affiliateOpportunity = affiliateRate < 0.012 && (template === "brand" || template === "city_brand")
      ? (0.012 - affiliateRate) * 2200
      : 0;
    const score = row.views * 1.25 + adOpportunity + affiliateOpportunity;
    const action =
      adRatio < 1
        ? "Increase above-the-fold ad visibility and keep CLS low."
        : affiliateOpportunity > 0
          ? "Strengthen affiliate CTA copy/deeplinks and test placement."
          : "Maintain position and improve internal links from nearby hubs.";

    const key = `path:${row.path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push({
      priority: priorityFromScore(score),
      score: roundScore(score),
      path: row.path,
      template,
      rationale: `${row.views} template views in window; ad ratio ${adRatio.toFixed(2)}.`,
      action,
    });
  }

  // Expansion scoring for state x category clusters
  for (const stateSlug of getAllStateSlugs()) {
    const stateCities = getCitiesByStateSlug(stateSlug);
    const code = getStateCodeFromSlug(stateSlug);
    if (!code || stateCities.length === 0) continue;
    const stateName = getStateName(code);

    const categorySlugs = [...new Set(
      stateCities
        .flatMap((city) => city.focusCategories)
        .map((category) => category.toLowerCase().replace(/\s+/g, "-"))
    )];

    for (const categorySlug of categorySlugs) {
      const categoryCoverage = categoryCountBySlug.get(categorySlug) || 0;
      if (categoryCoverage === 0) continue;
      const score = stateCities.length * 8 + categoryCoverage * 3;
      const path = `/state/${stateSlug}/category/${categorySlug}`;
      const key = `statecat:${path}`;
      if (seen.has(key)) continue;
      seen.add(key);
      candidates.push({
        priority: priorityFromScore(score),
        score: roundScore(score),
        path,
        template: "state_category",
        rationale: `${stateName}: ${stateCities.length} city pages and ${categoryCoverage} brand entries in this category.`,
        action: "Promote via state and category hubs; test one extra ad slot if ad ratio is below target.",
      });
    }
  }

  // Expansion scoring for localized city x category pages (fr/es/de)
  const targetLocales = ["fr", "es", "de"] as const;
  for (const locale of targetLocales) {
    cityData.slice(0, 24).forEach((city, cityIndex) => {
      city.focusCategories.forEach((focusCategory) => {
        const categorySlug = focusCategory.toLowerCase().replace(/\s+/g, "-");
        const categoryCoverage = categoryCountBySlug.get(categorySlug) || 0;
        if (categoryCoverage === 0) return;
        const demandWeight = Math.max(1, 24 - cityIndex);
        const score = demandWeight * 6 + categoryCoverage * 2;
        const path = `/${locale}/city/${city.slug}/category/${categorySlug}`;
        const key = `localecitycat:${path}`;
        if (seen.has(key)) return;
        seen.add(key);
        candidates.push({
          priority: priorityFromScore(score),
          score: roundScore(score),
          path,
          template: "locale_city_category",
          rationale: `${city.name} (${locale}) + ${focusCategory} has high local intent potential.`,
          action: "Add localized internal links from locale category pages and monitor indexing in GSC.",
        });
      });
    });
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 24);
}
