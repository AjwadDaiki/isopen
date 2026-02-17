import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import TrendingSidebar from "@/components/TrendingSidebar";
import { brandsData } from "@/data/brands";
import { cityData, getAllCitySlugs, getCityBySlug } from "@/data/cities";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { buildCityEditorial } from "@/lib/seo-editorial";
import {
  generateBreadcrumbJsonLd,
  generateOrganizationJsonLd,
  generateWebsiteJsonLd,
} from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllCitySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return { title: "Not Found" };

  const canonicalPath = `/city/${city.slug}`;

  return {
    title: `What's Open Now in ${city.name}, ${city.state}?`,
    description: `Check what is open now in ${city.name}, ${city.state}. Live status for popular stores, restaurants, pharmacies, and services.`,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(canonicalPath),
      title: `Open Now in ${city.name}, ${city.state}`,
      description: `Live opening status for major brands in ${city.name}, ${city.state}.`,
    },
  };
}

export default async function CityPage({ params }: PageProps) {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const featured = city.featuredBrandSlugs
    .map((brandSlug) => brandsData.find((entry) => entry.brand.slug === brandSlug))
    .filter((entry): entry is (typeof brandsData)[number] => Boolean(entry));
  const cards = featured.length > 0 ? featured : brandsData.slice(0, 12);
  const statuses = cards.map((entry) => ({
    ...entry,
    status: computeOpenStatus(entry.hours, city.timezone, entry.brand.is24h),
  }));
  const openCount = statuses.filter((entry) => entry.status.isOpen).length;
  const categories = [...new Set(cards.map((entry) => entry.brand.category).filter(Boolean))] as string[];
  const otherCities = cityData.filter((entry) => entry.slug !== city.slug).slice(0, 8);

  const editorial = buildCityEditorial(city.name, city.state, city.timezone, openCount, statuses.length);
  const canonicalPath = `/city/${city.slug}`;
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Cities", item: absoluteUrl("/city") },
    { name: `${city.name}, ${city.state}`, item: absoluteUrl(canonicalPath) },
  ]);
  const websiteJsonLd = generateWebsiteJsonLd();
  const orgJsonLd = generateOrganizationJsonLd();
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Open now in ${city.name}, ${city.state}`,
    itemListElement: statuses.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.brand.name,
      url: absoluteUrl(`/is-${entry.brand.slug}-open`),
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
            <span className="text-text">{city.name}, {city.state}</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <p className="font-mono uppercase tracking-[0.12em] text-[11px] text-muted mb-3">City money page</p>
                  <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                    What&apos;s Open Now in {city.name}, {city.state}?
                  </h1>
                  <p className="text-muted2 text-[15px] leading-relaxed mt-5 max-w-[68ch]">
                    Live store and service status using {city.timezone} timezone. Use this page for quick local checks before visiting a branch.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 border ui-border-green-30 bg-green-dim text-[12px] text-green font-semibold">
                    <span className="w-[7px] h-[7px] rounded-full bg-green animate-pulse-dot" />
                    {openCount} / {statuses.length} featured brands open now
                  </div>
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Top checks in {city.name}</h2>
                  <span className="font-mono text-[10px] text-muted tracking-[0.08em]">Live status</span>
                </div>

                <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {statuses.map(({ brand, status }, i) => (
                    <Link
                      key={brand.slug}
                      href={`/is-${brand.slug}-open`}
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
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Popular categories in {city.name}</h2>
                </div>
                <div className="panel-body flex flex-wrap gap-3">
                  {categories.map((category) => {
                    const categorySlug = category.toLowerCase().replace(/\s+/g, "-");
                    return (
                      <Link
                        key={category}
                        href={`/category/${categorySlug}`}
                        className="no-underline text-[12px] font-medium text-muted2 border border-border rounded-xl px-4 py-2.5 hover:text-text hover:border-border2 transition-colors bg-bg1"
                      >
                        {category}
                      </Link>
                    );
                  })}
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={100} />
            </main>

            <aside className="sidebar-stack">
              <TrendingSidebar />
              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Other city pages</h2>
                </div>
                <div className="panel-body flex flex-col gap-3">
                  {otherCities.map((entry) => (
                    <Link
                      key={entry.slug}
                      href={`/city/${entry.slug}`}
                      className="no-underline rounded-xl border border-border ui-bg-2-55 hover:bg-bg2 hover:border-border2 transition-colors px-5 py-4"
                    >
                      <p className="text-[14px] font-semibold text-text leading-tight">{entry.name}, {entry.state}</p>
                      <p className="text-[12px] text-muted2 mt-1">Live status in {entry.timezone}</p>
                    </Link>
                  ))}
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
