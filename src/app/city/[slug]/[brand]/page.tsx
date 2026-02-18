import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import StatusHero from "@/components/StatusHero";
import HoursTable from "@/components/HoursTable";
import AffiliateUnit from "@/components/AffiliateUnit";
import AlternativesOpen from "@/components/AlternativesOpen";
import RelatedBrands from "@/components/RelatedBrands";
import { getBrandBySlug, getRelatedBrands, brandsData } from "@/data/brands";
import { getCityBySlug, getAllCitySlugs, cityData } from "@/data/cities";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { buildBrandCityEditorial } from "@/lib/seo-editorial";
import {
  generateJsonLd,
  generateBreadcrumbJsonLd,
  generateWebsiteJsonLd,
  generateOrganizationJsonLd,
} from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string; brand: string }>;
}

export async function generateStaticParams() {
  const citySlugs = getAllCitySlugs();
  const params: { slug: string; brand: string }[] = [];

  for (const citySlug of citySlugs) {
    const city = getCityBySlug(citySlug);
    if (!city) continue;
    for (const brandSlug of city.featuredBrandSlugs) {
      params.push({ slug: citySlug, brand: brandSlug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, brand: brandSlug } = await params;
  const city = getCityBySlug(slug);
  const data = getBrandBySlug(brandSlug);
  if (!city || !data) return { title: "Not Found" };

  const { brand } = data;
  const year = new Date().getFullYear();
  const canonicalPath = `/city/${city.slug}/is-${brand.slug}-open`;

  return {
    title: `Is ${brand.name} Open in ${city.name}, ${city.state}? [${year} Hours]`,
    description: `Check if ${brand.name} is open right now in ${city.name}, ${city.state}. Real-time status, today's hours, and holiday schedule for ${city.timezone}.`,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(canonicalPath),
      title: `Is ${brand.name} Open Now in ${city.name}, ${city.state}?`,
      description: `Live ${brand.name} opening hours for the ${city.name} area.`,
    },
  };
}

export default async function BrandCityPage({ params }: PageProps) {
  const { slug, brand: brandSlug } = await params;
  const city = getCityBySlug(slug);
  const data = getBrandBySlug(brandSlug);
  if (!city || !data) notFound();

  const { brand, hours } = data;
  const status = computeOpenStatus(hours, city.timezone, brand.is24h);
  const related = getRelatedBrands(brandSlug, brand.category, 6);
  const canonicalPath = `/city/${city.slug}/is-${brand.slug}-open`;
  const currentUrl = absoluteUrl(canonicalPath);

  const jsonLd = generateJsonLd(brand, hours, currentUrl);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Cities", item: absoluteUrl("/city") },
    { name: `${city.name}, ${city.state}`, item: absoluteUrl(`/city/${city.slug}`) },
    { name: brand.name, item: currentUrl },
  ]);
  const websiteJsonLd = generateWebsiteJsonLd();
  const orgJsonLd = generateOrganizationJsonLd();

  const editorial = buildBrandCityEditorial(
    brand.name,
    city.name,
    city.state,
    city.timezone,
    brand.category || "",
    status.isOpen,
    status.todayHours
  );

  // Other brands in this city
  const otherBrandsInCity = city.featuredBrandSlugs
    .filter((s) => s !== brandSlug)
    .map((s) => brandsData.find((entry) => entry.brand.slug === s))
    .filter((entry): entry is (typeof brandsData)[number] => Boolean(entry))
    .slice(0, 6);

  // Other cities for this brand
  const otherCitiesForBrand = cityData
    .filter((c) => c.slug !== slug && c.featuredBrandSlugs.includes(brandSlug))
    .slice(0, 8);

  const categorySlug = brand.category?.toLowerCase().replace(/\s+/g, "-") || "";

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

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
            <span className="text-text">{brand.name}</span>
          </nav>
        </div>

        <div className="page-pad pt-4">
          <StatusHero brand={brand} initialStatus={status} locale="en" />
        </div>

        <div className="page-pad pt-2 pb-1">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-border bg-bg1 text-[12px] text-muted2">
            <span>📍</span>
            <span>Showing status for <strong className="text-text">{city.name}, {city.state}</strong> ({city.timezone})</span>
          </div>
        </div>

        <div className="page-pad pt-6">
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={90} />
        </div>

        <div className="page-pad pt-8 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <HoursTable hours={hours} />

              <AffiliateUnit brandName={brand.name} category={brand.category || null} isOpen={status.isOpen} />

              {!status.isOpen && (
                <AlternativesOpen
                  currentSlug={brandSlug}
                  category={brand.category || ""}
                  brands={related}
                />
              )}

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={100} />

              {/* Editorial content — unique per brand x city combo */}
              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">{editorial.kicker}</h2>
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

              {/* Other brands in this city */}
              {otherBrandsInCity.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h3 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">
                      Also open in {city.name}
                    </h3>
                  </div>
                  <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {otherBrandsInCity.map(({ brand: b, hours: h }) => {
                      const s = computeOpenStatus(h, city.timezone, b.is24h);
                      return (
                        <Link
                          key={b.slug}
                          href={`/city/${city.slug}/is-${b.slug}-open`}
                          className="no-underline rounded-xl border border-border bg-bg2 hover:border-green/30 hover:bg-bg3 transition-colors p-4 flex items-center gap-3.5"
                        >
                          <span className="text-[24px] leading-none shrink-0">{b.emoji || "🏪"}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-semibold text-text truncate">{b.name}</div>
                            <div className="text-[11px] text-muted2 mt-0.5">{b.category}</div>
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            s.isOpen
                              ? "text-green bg-green-dim border border-green/20"
                              : "text-red bg-red-dim border border-red/20"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.isOpen ? "bg-green" : "bg-red"}`} />
                            {s.isOpen ? "Open" : "Closed"}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Other cities for this brand */}
              {otherCitiesForBrand.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h3 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">
                      {brand.name} in other cities
                    </h3>
                  </div>
                  <div className="panel-body flex flex-wrap gap-3">
                    {otherCitiesForBrand.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/city/${c.slug}/is-${brandSlug}-open`}
                        className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                      >
                        {c.name}, {c.state}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Quick links */}
              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">Quick links</h3>
                </div>
                <div className="panel-body flex flex-wrap gap-3">
                  <Link
                    href={`/is-${brand.slug}-open`}
                    className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                  >
                    {brand.name} national hours
                  </Link>
                  <Link
                    href={`/city/${city.slug}`}
                    className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                  >
                    All brands in {city.name}
                  </Link>
                  {categorySlug && (
                    <Link
                      href={`/category/${categorySlug}`}
                      className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                    >
                      All {brand.category}
                    </Link>
                  )}
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={110} />
            </main>

            <aside className="sidebar-stack">
              <div className="hidden lg:block">
                <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={250} />
              </div>
              <RelatedBrands brands={related} />
              <div className="hidden lg:block">
                <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={200} />
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
