import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusHero from "@/components/StatusHero";
import HoursTable from "@/components/HoursTable";
import HolidayAlert from "@/components/HolidayAlert";
import AffiliateUnit from "@/components/AffiliateUnit";
import UserReports from "@/components/UserReports";
import RelatedBrands from "@/components/RelatedBrands";
import TrendingSidebar from "@/components/TrendingSidebar";
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
import { buildBrandUrl } from "@/lib/i18n/url-patterns";
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
    description: `Check if ${brand.name} is open right now. Real-time status, today's hours, holiday schedule and closing time countdown.`,
    alternates: {
      canonical: absoluteUrl(buildBrandUrl("en", slug)),
      languages: alternates,
    },
    openGraph: {
      title: `Is ${brand.name} Open Right Now?`,
      description: `Real-time ${brand.name} opening hours, holiday schedule, and closing time countdown.`,
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
  const ssrTz = "America/New_York";
  const status = computeOpenStatus(hours, ssrTz, brand.is24h);
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
        <nav className="page-pad flex flex-wrap items-center text-muted" style={{ paddingTop: 16, gap: 8, fontSize: 13 }}>
          <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
          <span className="text-muted">/</span>
          <Link href={`/category/${categorySlug}`} className="text-muted2 no-underline hover:text-text transition-colors">
            {brand.category}
          </Link>
          <span className="text-muted">/</span>
          <span className="text-text">{brand.name}</span>
        </nav>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <div className="page-pad" style={{ paddingTop: 22 }}>
          <StatusHero brand={brand} initialStatus={status} />
        </div>

        <div className="page-pad grid grid-cols-1 lg:grid-cols-[1fr_310px]" style={{ gap: 24, paddingTop: 22, paddingBottom: 52 }}>
          <main className="min-w-0 flex flex-col gap-5">
            <HolidayAlert brandName={brand.name} />
            <HoursTable hours={hours} />
            <AffiliateUnit brandName={brand.name} category={brand.category} isOpen={status.isOpen} />
            <UserReports brandSlug={slug} />

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h3 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">Check by day</h3>
                <span className="font-mono text-[10px] text-muted tracking-[0.06em]">Quick links</span>
              </div>

              <div className="px-4 py-4 md:px-6 md:py-5 flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {DAY_SLUGS.map((day) => (
                    <Link
                      key={day}
                      href={`/is-${slug}-open-on-${day}`}
                      className="text-xs font-medium px-3 py-1.5 rounded-md border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Link>
                  ))}
                </div>

                <div className="pt-1 border-t border-border/70 flex flex-wrap gap-2">
                  {HOLIDAY_SLUGS.map((holiday) => (
                    <Link
                      key={holiday}
                      href={`/is-${slug}-open-on-${holiday}`}
                      className="text-xs font-medium px-3 py-1.5 rounded-md border border-orange/30 bg-orange-dim text-orange no-underline hover:opacity-90 transition-opacity"
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
                <FaqItem
                  q={`Is ${brand.name} open right now?`}
                  a={status.isOpen ? `Yes, ${brand.name} is currently open.` : `No, ${brand.name} is currently closed.`}
                />
                <FaqItem
                  q={`What are ${brand.name} hours today?`}
                  a={status.todayHours ? `${brand.name} is open from ${status.todayHours} today.` : `${brand.name} is closed today.`}
                />
                <FaqItem
                  q={`What time does ${brand.name} close today?`}
                  a={status.closesIn ? `${brand.name} closes in ${status.closesIn}.` : `${brand.name} opens at ${status.opensAt || "unknown"}.`}
                />
              </div>
            </section>
          </main>

          <aside className="hidden lg:flex flex-col gap-4 sticky top-[72px] self-start">
            <TrendingSidebar />
            <RelatedBrands brands={related} />
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <article className="border-b border-border last:border-b-0 px-5 py-4 md:px-6 md:py-4.5">
      <h3 className="font-heading font-bold text-[13px] md:text-[13.5px] mb-1.5 text-text leading-snug">{q}</h3>
      <p className="text-[13px] text-muted2 leading-relaxed">{a}</p>
    </article>
  );
}
