import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import TrendingSidebar from "@/components/TrendingSidebar";
import { brandsData } from "@/data/brands";
import {
  getAllStateSlugs,
  getCitiesByStateSlug,
  getStateCodeFromSlug,
  getStateName,
} from "@/data/cities";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { buildStateCategoryEditorial } from "@/lib/seo-editorial";
import {
  generateBreadcrumbJsonLd,
  generateOrganizationJsonLd,
  generateWebsiteJsonLd,
} from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string; category: string }>;
}

const CATEGORY_BY_SLUG = new Map(
  brandsData
    .map((entry) => entry.brand.category)
    .filter((category): category is string => Boolean(category))
    .map((category) => [category.toLowerCase().replace(/\s+/g, "-"), category])
);

function categoryFromSlug(slug: string): string | null {
  return CATEGORY_BY_SLUG.get(slug) || null;
}

export async function generateStaticParams() {
  const params: Array<{ slug: string; category: string }> = [];

  for (const stateSlug of getAllStateSlugs()) {
    const cities = getCitiesByStateSlug(stateSlug);
    if (cities.length === 0) continue;

    const seen = new Set<string>();
    for (const city of cities) {
      for (const focusCategory of city.focusCategories) {
        const focusSlug = focusCategory.toLowerCase().replace(/\s+/g, "-");
        if (!CATEGORY_BY_SLUG.has(focusSlug) || seen.has(focusSlug)) continue;
        seen.add(focusSlug);
        params.push({ slug: stateSlug, category: focusSlug });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, category: categorySlug } = await params;
  const stateCode = getStateCodeFromSlug(slug);
  const category = categoryFromSlug(categorySlug);
  if (!stateCode || !category) return { title: "Not Found" };

  const stateName = getStateName(stateCode);
  const canonicalPath = `/state/${slug}/category/${categorySlug}`;

  return {
    title: `${category} Open Now in ${stateName}?`,
    description: `Check which ${category.toLowerCase()} options are open now across ${stateName}. Live state-level status with city shortcuts.`,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(canonicalPath),
      title: `${category} Open Now in ${stateName}`,
      description: `State-level ${category.toLowerCase()} checks for ${stateName}.`,
    },
  };
}

export default async function StateCategoryPage({ params }: PageProps) {
  const { slug, category: categorySlug } = await params;
  const stateCode = getStateCodeFromSlug(slug);
  const category = categoryFromSlug(categorySlug);
  if (!stateCode || !category) notFound();

  const stateName = getStateName(stateCode);
  const cities = getCitiesByStateSlug(slug);
  if (cities.length === 0) notFound();

  const cityBySlug = new Map(cities.map((city) => [city.slug, city]));
  const brandToCity = new Map<string, string>();
  for (const city of cities) {
    for (const brandSlug of city.featuredBrandSlugs) {
      if (brandToCity.has(brandSlug)) continue;
      const entry = brandsData.find((b) => b.brand.slug === brandSlug);
      if (!entry || entry.brand.category !== category) continue;
      brandToCity.set(brandSlug, city.slug);
    }
  }

  const featured = [...brandToCity.entries()]
    .map(([brandSlug, citySlug]) => {
      const entry = brandsData.find((b) => b.brand.slug === brandSlug);
      if (!entry) return null;
      return { ...entry, citySlug };
    })
    .filter((entry): entry is ((typeof brandsData)[number] & { citySlug: string }) => Boolean(entry))
    .slice(0, 24);

  const fallback = brandsData
    .filter((entry) => entry.brand.category === category)
    .slice(0, 24)
    .map((entry) => ({ ...entry, citySlug: null as string | null }));

  const cards = featured.length > 0 ? featured : fallback;
  if (cards.length === 0) notFound();

  const statuses = cards.map((entry) => {
    const tz = entry.citySlug ? cityBySlug.get(entry.citySlug)?.timezone || cities[0].timezone : cities[0].timezone;
    return {
      ...entry,
      status: computeOpenStatus(entry.hours, tz, entry.brand.is24h),
    };
  });
  const openCount = statuses.filter((entry) => entry.status.isOpen).length;

  const otherCategorySlugs = [...new Set(
    cities
      .flatMap((city) => city.focusCategories)
      .map((focusCategory) => focusCategory.toLowerCase().replace(/\s+/g, "-"))
      .filter((focusSlug) => focusSlug !== categorySlug && CATEGORY_BY_SLUG.has(focusSlug))
  )].slice(0, 8);

  const otherStates = getAllStateSlugs()
    .filter((stateSlug) => stateSlug !== slug)
    .map((stateSlug) => {
      const stateCities = getCitiesByStateSlug(stateSlug);
      const hasCategory = stateCities.some((city) => city.focusCategories.includes(category));
      const code = getStateCodeFromSlug(stateSlug);
      if (!hasCategory || !code) return null;
      return {
        slug: stateSlug,
        name: getStateName(code),
      };
    })
    .filter((entry): entry is { slug: string; name: string } => Boolean(entry))
    .slice(0, 10);

  const editorial = buildStateCategoryEditorial(stateName, category, openCount, statuses.length, cities.length);

  const canonicalPath = `/state/${slug}/category/${categorySlug}`;
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "States", item: absoluteUrl("/state") },
    { name: stateName, item: absoluteUrl(`/state/${slug}`) },
    { name: category, item: absoluteUrl(canonicalPath) },
  ]);
  const websiteJsonLd = generateWebsiteJsonLd();
  const orgJsonLd = generateOrganizationJsonLd();
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category} open now in ${stateName}`,
    itemListElement: statuses.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.brand.name,
      url: absoluteUrl(
        entry.citySlug
          ? `/city/${entry.citySlug}/is-${entry.brand.slug}-open`
          : `/is-${entry.brand.slug}-open`
      ),
    })),
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <Link href="/state" className="text-muted2 no-underline hover:text-text transition-colors">States</Link>
            <span>/</span>
            <Link href={`/state/${slug}`} className="text-muted2 no-underline hover:text-text transition-colors">{stateName}</Link>
            <span>/</span>
            <span className="text-text">{category}</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <p className="font-mono uppercase tracking-[0.12em] text-[11px] text-muted mb-3">State + category page</p>
                  <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                    {category} Open Now in {stateName}?
                  </h1>
                  <p className="text-muted2 text-[15px] leading-relaxed mt-5 max-w-[68ch]">
                    Live state-level checks connected to {cities.length} city pages in {stateName}.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 border ui-border-green-30 bg-green-dim text-[12px] text-green font-semibold">
                    <span className="w-[7px] h-[7px] rounded-full bg-green animate-pulse-dot" />
                    {openCount} / {statuses.length} tracked brands open now
                  </div>
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Top {category} checks in {stateName}</h2>
                  <span className="font-mono text-[10px] text-muted tracking-[0.08em]">Live status</span>
                </div>
                <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {statuses.map(({ brand, status, citySlug }, i) => (
                    <Link
                      key={brand.slug}
                      href={citySlug ? `/city/${citySlug}/is-${brand.slug}-open` : `/is-${brand.slug}-open`}
                      className={`brand-card-link brand-card-premium p-6 no-underline ${status.isOpen ? "brand-card-open" : "brand-card-closed"}`}
                      style={{ animationDelay: `${Math.min(i * 0.03, 0.25)}s` }}
                    >
                      <div className="flex items-center gap-3.5 mb-3">
                        <span className="text-2xl">{brand.emoji || "Store"}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[16px] font-heading font-bold text-text leading-tight truncate">{brand.name}</p>
                          <p className="text-[12px] text-muted2 truncate">
                            {citySlug ? cityBySlug.get(citySlug)?.name : stateName}
                          </p>
                        </div>
                        <span className={`brand-status-pill ${status.isOpen ? "brand-status-pill-open" : "brand-status-pill-closed"}`}>
                          <span className="status-led" />
                          {status.isOpen ? "Open" : "Closed"}
                        </span>
                      </div>

                      <p className="text-[12px] text-muted2">
                        {status.isOpen && status.closesIn ? `Closes in ${status.closesIn}` : ""}
                        {!status.isOpen && status.opensAt ? `Opens at ${status.opensAt}` : ""}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">{editorial.kicker}</h2>
                </div>
                <div className="panel-body flex flex-col gap-5">
                  <p className="text-[14px] text-muted2 leading-relaxed">{editorial.intro}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {editorial.bullets.map((line) => (
                      <div key={line} className="rounded-xl border border-border ui-bg-2-55 px-4 py-3.5 text-[12px] text-muted2">
                        {line}
                      </div>
                    ))}
                  </div>
                  {editorial.sections.map((section) => (
                    <article key={section.title}>
                      <h3 className="font-heading font-bold text-[14px] text-text mb-2">{section.title}</h3>
                      <p className="text-[13px] text-muted2 leading-relaxed">{section.body}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Quick links</h2>
                </div>
                <div className="panel-body flex flex-wrap gap-3">
                  <Link
                    href={`/state/${slug}`}
                    className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                  >
                    All in {stateName}
                  </Link>
                  <Link
                    href={`/category/${categorySlug}`}
                    className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                  >
                    Global {category}
                  </Link>
                  <Link
                    href={`/near-me/${categorySlug}`}
                    className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                  >
                    {category} near me
                  </Link>
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={110} />
            </main>

            <aside className="sidebar-stack">
              {otherCategorySlugs.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Other categories in {stateName}</h2>
                  </div>
                  <div className="panel-body flex flex-col gap-3">
                    {otherCategorySlugs.map((otherSlug) => (
                      <Link
                        key={otherSlug}
                        href={`/state/${slug}/category/${otherSlug}`}
                        className="no-underline rounded-xl border border-border ui-bg-2-55 hover:bg-bg2 hover:border-border2 transition-colors px-5 py-4"
                      >
                        <p className="text-[14px] font-semibold text-text leading-tight">{categoryFromSlug(otherSlug)}</p>
                        <p className="text-[12px] text-muted2 mt-1">Open now in {stateName}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {otherStates.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">{category} in other states</h2>
                  </div>
                  <div className="panel-body flex flex-col gap-3">
                    {otherStates.map((state) => (
                      <Link
                        key={state.slug}
                        href={`/state/${state.slug}/category/${categorySlug}`}
                        className="no-underline rounded-xl border border-border ui-bg-2-55 hover:bg-bg2 hover:border-border2 transition-colors px-5 py-4"
                      >
                        <p className="text-[14px] font-semibold text-text leading-tight">{state.name}</p>
                        <p className="text-[12px] text-muted2 mt-1">Live {category.toLowerCase()} checks</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <TrendingSidebar />
              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={220} />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
