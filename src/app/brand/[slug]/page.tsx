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
import { getBrandBySlug, getRelatedBrands, getAllBrandSlugs } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";
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
        <nav className="page-pad flex flex-wrap items-center text-muted" style={{ paddingTop: 20, paddingBottom: 4, gap: 8, fontSize: 13 }}>
          <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/category/${categorySlug}`} className="text-muted2 no-underline hover:text-text transition-colors">
            {brand.category}
          </Link>
          <span>/</span>
          <span className="text-text">{brand.name}</span>
        </nav>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <div className="page-pad" style={{ paddingTop: 16 }}>
          <StatusHero brand={brand} initialStatus={status} locale="en" />
        </div>

        {/* Ad banner after hero */}
        <div className="page-pad" style={{ paddingTop: 20, paddingBottom: 0 }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={90} />
        </div>

        <div className="page-pad grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]" style={{ gap: 28, paddingTop: 28, paddingBottom: 48 }}>
          <main className="min-w-0 flex flex-col" style={{ gap: 20 }}>
            <HolidayAlert brandName={brand.name} />
            <HoursTable hours={hours} />

            {/* Affiliate unit */}
            <AffiliateUnit brandName={brand.name} category={brand.category || null} isOpen={status.isOpen} />

            {/* Inline ad between content */}
            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={100} />

            <UserReports brandSlug={slug} />

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h3 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">Quick checks</h3>
              </div>

              <div className="px-5 py-5 md:px-7 md:py-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {DAY_SLUGS.map((day) => (
                    <Link
                      key={day}
                      href={buildDayUrl("en", slug, day as CanonicalDay)}
                      className="text-[12px] font-medium px-3.5 py-2 rounded-lg border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Link>
                  ))}
                </div>

                <div className="pt-1 border-t border-border/70 flex flex-wrap gap-2">
                  {HOLIDAY_SLUGS.map((holiday) => (
                    <Link
                      key={holiday}
                      href={buildDayUrl("en", slug, holiday as CanonicalDay)}
                      className="text-[12px] font-medium px-3.5 py-2 rounded-lg border border-orange/30 bg-orange-dim text-orange no-underline hover:opacity-90 transition-opacity"
                    >
                      {holiday.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </Link>
                  ))}
                </div>
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

            {/* Bottom inline ad */}
            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={110} />
          </main>

          {/* Sidebar: visible on all screen sizes, stacks below main on mobile */}
          <aside className="flex flex-col" style={{ gap: 20 }}>
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
      <Footer />
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <article className="border-b border-border last:border-b-0 px-5 py-4.5 md:px-6 md:py-5">
      <h3 className="font-heading font-bold text-[14px] md:text-[15px] mb-1.5 text-text leading-snug">{q}</h3>
      <p className="text-[14px] text-muted2 leading-relaxed">{a}</p>
    </article>
  );
}
