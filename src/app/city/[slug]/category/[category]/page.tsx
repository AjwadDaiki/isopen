import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import TrendingSidebar from "@/components/TrendingSidebar";
import { brandsData } from "@/data/brands";
import { getAllCitySlugs, getCityBySlug, getCitiesForCategory } from "@/data/cities";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { buildCityCategoryEditorial } from "@/lib/seo-editorial";
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

  for (const citySlug of getAllCitySlugs()) {
    const city = getCityBySlug(citySlug);
    if (!city) continue;

    const seen = new Set<string>();
    for (const category of city.focusCategories) {
      const categorySlug = category.toLowerCase().replace(/\s+/g, "-");
      if (!CATEGORY_BY_SLUG.has(categorySlug) || seen.has(categorySlug)) continue;
      seen.add(categorySlug);
      params.push({ slug: citySlug, category: categorySlug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, category: categorySlug } = await params;
  const city = getCityBySlug(slug);
  const category = categoryFromSlug(categorySlug);
  if (!city || !category) return { title: "Not Found" };

  const canonicalPath = `/city/${city.slug}/category/${categorySlug}`;

  return {
    title: `${category} Open Right Now in ${city.name}, ${city.state} → Live Hours`,
    description: `Is there a ${category.toLowerCase()} open in ${city.name}, ${city.state} right now? Live status for every major brand with real-time closing times.`,
    alternates: { canonical: absoluteUrl(canonicalPath) },
    openGraph: {
      type: "website",
      url: absoluteUrl(canonicalPath),
      title: `${category} Open Now in ${city.name}, ${city.state}`,
      description: `Live ${category.toLowerCase()} status for ${city.name}.`,
    },
  };
}

export default async function CityCategoryPage({ params }: PageProps) {
  const { slug, category: categorySlug } = await params;
  const city = getCityBySlug(slug);
  const category = categoryFromSlug(categorySlug);
  if (!city || !category) notFound();

  const featuredInCategory = city.featuredBrandSlugs
    .map((brandSlug) => brandsData.find((entry) => entry.brand.slug === brandSlug))
    .filter((entry): entry is (typeof brandsData)[number] => Boolean(entry))
    .filter((entry) => entry.brand.category === category);

  const fallback = brandsData.filter((entry) => entry.brand.category === category).slice(0, 14);
  const cards = featuredInCategory.length > 0 ? featuredInCategory : fallback;
  if (cards.length === 0) notFound();

  const statuses = cards.map((entry) => ({
    ...entry,
    status: computeOpenStatus(entry.hours, city.timezone, entry.brand.is24h),
  }));
  const openCount = statuses.filter((entry) => entry.status.isOpen).length;

  const otherCategorySlugs = city.focusCategories
    .map((c) => c.toLowerCase().replace(/\s+/g, "-"))
    .filter((s) => s !== categorySlug)
    .filter((s, i, arr) => CATEGORY_BY_SLUG.has(s) && arr.indexOf(s) === i)
    .slice(0, 6);

  const otherCities = getCitiesForCategory(category, 12).filter((entry) => entry.slug !== city.slug).slice(0, 10);
  const editorial = buildCityCategoryEditorial(city.name, city.state, category, openCount, statuses.length);
  const categoryGlobalSlug = category.toLowerCase().replace(/\s+/g, "-");
  const stateSlug = city.state.toLowerCase();

  const canonicalPath = `/city/${city.slug}/category/${categorySlug}`;
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Cities", item: absoluteUrl("/city") },
    { name: `${city.name}, ${city.state}`, item: absoluteUrl(`/city/${city.slug}`) },
    { name: category, item: absoluteUrl(canonicalPath) },
  ]);
  const websiteJsonLd = generateWebsiteJsonLd();
  const orgJsonLd = generateOrganizationJsonLd();
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category} open now in ${city.name}`,
    itemListElement: statuses.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.brand.name,
      url: absoluteUrl(`/city/${city.slug}/is-${entry.brand.slug}-open`),
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
            <Link href="/city" className="text-muted2 no-underline hover:text-text transition-colors">Cities</Link>
            <span>/</span>
            <Link href={`/city/${city.slug}`} className="text-muted2 no-underline hover:text-text transition-colors">
              {city.name}, {city.state}
            </Link>
            <span>/</span>
            <span className="text-text">{category}</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <p className="font-mono uppercase tracking-[0.12em] text-[11px] text-muted mb-3">City + category page</p>
                  <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                    {category} Open Now in {city.name}, {city.state}?
                  </h1>
                  <p className="text-muted2 text-[15px] leading-relaxed mt-5 max-w-[68ch]">
                    Live status using {city.timezone}. Designed for quick local decisions before you leave.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 border ui-border-green-30 bg-green-dim text-[12px] text-green font-semibold">
                    <span className="w-[7px] h-[7px] rounded-full bg-green animate-pulse-dot" />
                    {openCount} / {statuses.length} tracked brands open now
                  </div>
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Top {category} checks in {city.name}</h2>
                  <span className="font-mono text-[10px] text-muted tracking-[0.08em]">Live status</span>
                </div>

                <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {statuses.map(({ brand, status }, i) => (
                    <Link
                      key={brand.slug}
                      href={`/city/${slug}/is-${brand.slug}-open`}
                      className={`brand-card-link brand-card-premium p-6 no-underline ${status.isOpen ? "brand-card-open" : "brand-card-closed"}`}
                      style={{ animationDelay: `${Math.min(i * 0.03, 0.25)}s` }}
                    >
                      <div className="flex items-center gap-3.5 mb-3">
                        <span className="text-2xl">{brand.emoji || "Store"}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[16px] font-heading font-bold text-text leading-tight truncate">{brand.name}</p>
                          <p className="text-[12px] text-muted2 truncate">{brand.category}</p>
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
                    href={`/city/${city.slug}`}
                    className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                  >
                    All brands in {city.name}
                  </Link>
                  <Link
                    href={`/category/${categoryGlobalSlug}`}
                    className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                  >
                    Global {category}
                  </Link>
                  <Link
                    href={`/near-me/${categoryGlobalSlug}`}
                    className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                  >
                    {category} near me
                  </Link>
                  <Link
                    href={`/state/${stateSlug}/category/${categorySlug}`}
                    className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                  >
                    {category} in {city.state}
                  </Link>
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={100} />
            </main>

            <aside className="sidebar-stack">
              <TrendingSidebar />

              {otherCategorySlugs.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Other categories in {city.name}</h2>
                  </div>
                  <div className="panel-body flex flex-col gap-3">
                    {otherCategorySlugs.map((otherSlug) => (
                      <Link
                        key={otherSlug}
                        href={`/city/${city.slug}/category/${otherSlug}`}
                        className="no-underline rounded-xl border border-border ui-bg-2-55 hover:bg-bg2 hover:border-border2 transition-colors px-5 py-4"
                      >
                        <p className="text-[14px] font-semibold text-text leading-tight">{categoryFromSlug(otherSlug)}</p>
                        <p className="text-[12px] text-muted2 mt-1">Open now in {city.name}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {otherCities.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">{category} in other cities</h2>
                  </div>
                  <div className="panel-body flex flex-col gap-3">
                    {otherCities.map((entry) => (
                      <Link
                        key={entry.slug}
                        href={`/city/${entry.slug}/category/${categorySlug}`}
                        className="no-underline rounded-xl border border-border ui-bg-2-55 hover:bg-bg2 hover:border-border2 transition-colors px-5 py-4"
                      >
                        <p className="text-[14px] font-semibold text-text leading-tight">{entry.name}, {entry.state}</p>
                        <p className="text-[12px] text-muted2 mt-1">Live {category.toLowerCase()} checks</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={220} />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
