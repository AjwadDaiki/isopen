import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import StatusHero from "@/components/StatusHero";
import HoursTable from "@/components/HoursTable";
import HolidayAlert from "@/components/HolidayAlert";
import UserReports from "@/components/UserReports";
import RelatedBrands from "@/components/RelatedBrands";
import TrendingSidebar from "@/components/TrendingSidebar";
import AffiliateUnit from "@/components/AffiliateUnit";
import AlternativesOpen from "@/components/AlternativesOpen";
import { getBrandBySlug, getRelatedBrands, getAllBrandSlugs } from "@/data/brands";
import { getCitiesForBrand } from "@/data/cities";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { buildBrandEditorial } from "@/lib/seo-editorial";
import {
  generateJsonLd,
  generateFaqJsonLd,
  generateWebsiteJsonLd,
  generateOrganizationJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/schema";
import { LOCALES, type Locale } from "@/lib/i18n/translations";
import { buildBrandUrl, buildDayUrl, type CanonicalDay } from "@/lib/i18n/url-patterns";
import { buildLocaleAlternates, absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const DAY_SLUGS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const HOLIDAY_SLUGS = ["christmas", "thanksgiving", "new-years", "easter"] as const;

export async function generateStaticParams() {
  return getAllBrandSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getBrandBySlug(slug);
  if (!data) return { title: "Not Found" };

  const { brand } = data;
  const year = new Date().getFullYear();

  const alternates = buildLocaleAlternates(
    Object.fromEntries(LOCALES.map((l) => [l, buildBrandUrl(l, slug)])) as Record<Locale, string>
  );

  return {
    title: `Is ${brand.name} Open Right Now? [${year} Hours]`,
    description: `Check if ${brand.name} is open right now. Live status, today's schedule and weekly hours.`,
    alternates: {
      canonical: absoluteUrl(buildBrandUrl("en", slug)),
      languages: alternates,
    },
    openGraph: {
      title: `Is ${brand.name} Open Right Now?`,
      description: `Live ${brand.name} opening hours and current status.`,
      type: "website",
      url: absoluteUrl(buildBrandUrl("en", slug)),
    },
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const data = getBrandBySlug(slug);
  if (!data) notFound();

  const { brand, hours } = data;
  const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
  const related = getRelatedBrands(slug, brand.category, 6);
  const currentUrl = absoluteUrl(buildBrandUrl("en", slug));
  const jsonLd = generateJsonLd(brand, hours, currentUrl);
  const faqJsonLd = generateFaqJsonLd(brand, hours, status, "en");
  const websiteJsonLd = generateWebsiteJsonLd();
  const orgJsonLd = generateOrganizationJsonLd();
  const cityLinks = getCitiesForBrand(slug, 8);
  const editorial = buildBrandEditorial(brand, hours, status);
  const categorySlug = brand.category?.toLowerCase().replace(/\s+/g, "-") || "";
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: brand.category || "Category", item: absoluteUrl(`/category/${categorySlug}`) },
    { name: brand.name, item: currentUrl },
  ]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/category/${categorySlug}`} className="text-muted2 no-underline hover:text-text transition-colors">
              {brand.category}
            </Link>
            <span>/</span>
            <span className="text-text">{brand.name}</span>
          </nav>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <div className="page-pad pt-4">
          <StatusHero brand={brand} initialStatus={status} locale="en" />
        </div>

        <div className="page-pad pt-6">
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={90} />
        </div>

        <div className="page-pad pt-8 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <HolidayAlert brandName={brand.name} />
              <HoursTable hours={hours} />

              <AffiliateUnit brandName={brand.name} category={brand.category || null} isOpen={status.isOpen} />

              {!status.isOpen && (
                <AlternativesOpen
                  currentSlug={slug}
                  category={brand.category || ""}
                  brands={related}
                />
              )}

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={100} />

              <UserReports brandSlug={slug} />

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">Quick checks</h3>
                </div>

                <div className="panel-body flex flex-col gap-5">
                  <div className="flex flex-wrap gap-3">
                    {DAY_SLUGS.map((day) => (
                      <Link
                        key={day}
                        href={buildDayUrl("en", slug, day as CanonicalDay)}
                        className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </Link>
                    ))}
                  </div>

                  <div className="pt-4 border-t ui-border-70 flex flex-wrap gap-3">
                    {HOLIDAY_SLUGS.map((holiday) => (
                      <Link
                        key={holiday}
                        href={buildDayUrl("en", slug, holiday as CanonicalDay)}
                        className="text-[12px] font-medium px-4 py-2.5 rounded-xl border ui-border-orange-30 bg-orange-dim text-orange no-underline hover:opacity-90 transition-opacity"
                      >
                        {holiday.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </Link>
                    ))}
                  </div>
                </div>
              </section>

              {cityLinks.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h3 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">{brand.name} by city</h3>
                  </div>
                  <div className="panel-body flex flex-wrap gap-3">
                    {cityLinks.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/city/${city.slug}/is-${slug}-open`}
                        className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                      >
                        {city.name}, {city.state}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">{editorial.kicker}</h3>
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
                      <h4 className="font-heading font-bold text-[14px] text-text mb-2">{section.title}</h4>
                      <p className="text-[13px] text-muted2 leading-relaxed">{section.body}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">Frequently asked questions</h3>
                </div>
                <div>
                  <FaqItem q={`Is ${brand.name} open right now?`} a={status.isOpen ? `Yes, ${brand.name} is currently open.` : `No, ${brand.name} is currently closed.`} />
                  <FaqItem q={`What are ${brand.name} hours today?`} a={status.todayHours ? `${brand.name} is open from ${status.todayHours} today.` : `${brand.name} is closed today.`} />
                  <FaqItem q={`What time does ${brand.name} close today?`} a={status.closesIn ? `${brand.name} closes in ${status.closesIn}.` : `${brand.name} opens at ${status.opensAt || "unknown"}.`} />
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={110} />
            </main>

            <aside className="sidebar-stack">
              <div className="hidden lg:block">
                <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={250} />
              </div>
              <TrendingSidebar />
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

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <article className="border-b border-border last:border-b-0 px-6 py-5 md:px-7 md:py-6">
      <h3 className="font-heading font-bold text-[14px] md:text-[15px] mb-2 text-text leading-snug">{q}</h3>
      <p className="text-[14px] text-muted2 leading-relaxed">{a}</p>
    </article>
  );
}
