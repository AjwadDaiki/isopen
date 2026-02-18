import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { brandsData } from "@/data/brands";
import {
  getAllStateSlugs,
  getCitiesByStateSlug,
  getStateCodeFromSlug,
  getStateName,
} from "@/data/cities";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { generateBreadcrumbJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllStateSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const code = getStateCodeFromSlug(slug);
  if (!code) return { title: "Not Found" };

  const name = getStateName(code);
  const canonicalPath = `/state/${slug}`;

  return {
    title: `What's Open Now in ${name}?`,
    description: `Check what stores, restaurants, pharmacies, and services are open now in ${name}.`,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(canonicalPath),
      title: `Open Now in ${name}`,
      description: `State-level open-now status pages for ${name}.`,
    },
  };
}

export default async function StatePage({ params }: PageProps) {
  const { slug } = await params;
  const stateCode = getStateCodeFromSlug(slug);
  if (!stateCode) notFound();

  const stateName = getStateName(stateCode);
  const cities = getCitiesByStateSlug(slug);
  if (cities.length === 0) notFound();

  const firstTimezone = cities[0].timezone;
  const brandToCity = new Map<string, string>();
  for (const city of cities) {
    for (const brandSlug of city.featuredBrandSlugs) {
      if (!brandToCity.has(brandSlug)) {
        brandToCity.set(brandSlug, city.slug);
      }
    }
  }

  const featuredBrands = [...brandToCity.keys()]
    .map((brandSlug) => brandsData.find((entry) => entry.brand.slug === brandSlug))
    .filter((entry): entry is (typeof brandsData)[number] => Boolean(entry))
    .slice(0, 24);

  const openNowCount = featuredBrands.reduce((acc, entry) => {
    const status = computeOpenStatus(entry.hours, firstTimezone, entry.brand.is24h);
    return acc + (status.isOpen ? 1 : 0);
  }, 0);

  const categories = [...new Set(
    featuredBrands
      .map((entry) => entry.brand.category)
      .filter((category): category is string => Boolean(category))
  )].slice(0, 8);

  const canonicalPath = `/state/${slug}`;
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "States", item: absoluteUrl("/state") },
    { name: stateName, item: absoluteUrl(canonicalPath) },
  ]);
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Open now in ${stateName}`,
    itemListElement: cities.map((city, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${city.name}, ${city.state}`,
      url: absoluteUrl(`/city/${city.slug}`),
    })),
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <Link href="/state" className="text-muted2 no-underline hover:text-text transition-colors">States</Link>
            <span>/</span>
            <span className="text-text">{stateName}</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                    What&apos;s Open Now in {stateName}?
                  </h1>
                  <p className="text-muted2 text-[15px] leading-relaxed mt-5 max-w-[68ch]">
                    State-level open-now overview across {cities.length} city pages and {featuredBrands.length} major brands.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 border ui-border-green-30 bg-green-dim text-[12px] text-green font-semibold">
                    <span className="w-[7px] h-[7px] rounded-full bg-green animate-pulse-dot" />
                    {openNowCount} / {featuredBrands.length} featured brands open right now
                  </div>
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">City pages in {stateName}</h2>
                  <span className="font-mono text-[10px] text-muted tracking-[0.08em]">{cities.length} cities</span>
                </div>
                <div className="panel-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/city/${city.slug}`}
                      className="brand-card-link brand-card-premium no-underline p-5"
                    >
                      <p className="text-[15px] font-heading font-bold text-text tracking-[-0.01em]">
                        {city.name}, {city.state}
                      </p>
                      <p className="text-[11px] text-muted2 mt-1.5">{city.timezone}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {city.focusCategories.slice(0, 2).map((category) => (
                          <span key={category} className="text-[10px] uppercase tracking-[0.08em] text-muted border border-border rounded-full px-2 py-[3px]">
                            {category}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Top brands in {stateName}</h2>
                </div>
                <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featuredBrands.map(({ brand, hours }) => {
                    const status = computeOpenStatus(hours, firstTimezone, brand.is24h);
                    const citySlug = brandToCity.get(brand.slug);

                    return (
                      <Link
                        key={brand.slug}
                        href={citySlug ? `/city/${citySlug}/is-${brand.slug}-open` : `/is-${brand.slug}-open`}
                        className={`brand-card-link brand-card-premium p-5 no-underline ${status.isOpen ? "brand-card-open" : "brand-card-closed"}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{brand.emoji || "Store"}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-heading font-bold text-text truncate">{brand.name}</p>
                            <p className="text-[11px] text-muted2 mt-0.5 truncate">
                              {citySlug ? `in ${cities.find((c) => c.slug === citySlug)?.name || stateName}` : stateName}
                            </p>
                          </div>
                          <span className={`brand-status-pill ${status.isOpen ? "brand-status-pill-open" : "brand-status-pill-closed"}`}>
                            <span className="status-led" />
                            {status.isOpen ? "Open" : "Closed"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={110} />
            </main>

            <aside className="sidebar-stack">
              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Popular categories</h3>
                </div>
                <div className="panel-body flex flex-wrap gap-3">
                  {categories.map((category) => {
                    const categorySlug = category.toLowerCase().replace(/\s+/g, "-");
                    return (
                      <Link
                        key={category}
                        href={`/state/${slug}/category/${categorySlug}`}
                        className="no-underline text-[12px] font-medium text-muted2 border border-border rounded-xl px-4 py-2.5 hover:text-text hover:border-border2 transition-colors bg-bg1"
                      >
                        {category} in {stateName}
                      </Link>
                    );
                  })}
                </div>
              </section>
              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={220} />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
