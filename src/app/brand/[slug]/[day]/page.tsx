import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import HoursTable from "@/components/HoursTable";
import TrendingSidebar from "@/components/TrendingSidebar";
import { getBrandBySlug, getAllBrandSlugs } from "@/data/brands";
import {
  generateJsonLd,
  generateFaqJsonLd,
  generateWebsiteJsonLd,
  generateOrganizationJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/schema";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { LOCALES, type Locale } from "@/lib/i18n/translations";
import { CANONICAL_DAYS, type CanonicalDay, buildDayUrl, buildBrandUrl } from "@/lib/i18n/url-patterns";
import { buildLocaleAlternates, absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 300;

const DAY_LABELS: Record<CanonicalDay, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  christmas: "Christmas",
  thanksgiving: "Thanksgiving",
  "new-years": "New Year's Day",
  easter: "Easter",
};

interface PageProps {
  params: Promise<{ slug: string; day: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllBrandSlugs();
  return slugs.flatMap((slug) => CANONICAL_DAYS.map((day) => ({ slug, day })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, day } = await params;
  const data = getBrandBySlug(slug);
  if (!data || !CANONICAL_DAYS.includes(day as CanonicalDay)) return { title: "Not Found" };

  const canonicalDay = day as CanonicalDay;
  const year = new Date().getFullYear();

  const alternates = buildLocaleAlternates(
    Object.fromEntries(LOCALES.map((l) => [l, buildDayUrl(l, slug, canonicalDay)])) as Record<Locale, string>
  );

  return {
    title: `Is ${data.brand.name} Open on ${DAY_LABELS[canonicalDay]}? [${year} Hours]`,
    description: `Check ${data.brand.name} hours on ${DAY_LABELS[canonicalDay]}. Opening time, closing time, and whether it's typically open.`,
    alternates: {
      canonical: absoluteUrl(buildDayUrl("en", slug, canonicalDay)),
      languages: alternates,
    },
  };
}

export default async function DayPage({ params }: PageProps) {
  const { slug, day } = await params;
  const canonicalDay = day as CanonicalDay;
  const data = getBrandBySlug(slug);
  if (!data || !CANONICAL_DAYS.includes(canonicalDay)) notFound();

  const { brand, hours } = data;
  const dayIndexMap: Record<CanonicalDay, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    christmas: -1,
    thanksgiving: -2,
    "new-years": -3,
    easter: -4,
  };

  const dayIndex = dayIndexMap[canonicalDay];
  const dayHours = dayIndex >= 0 ? hours.find((h) => h.dayOfWeek === dayIndex) : null;
  const isHoliday = dayIndex < 0;
  const isOpenOnDay = dayHours ? !dayHours.isClosed && !!dayHours.openTime : false;
  const hoursStr = dayHours?.openTime && dayHours?.closeTime ? `${dayHours.openTime} - ${dayHours.closeTime}` : "Closed";

  const currentUrl = absoluteUrl(buildDayUrl("en", slug, canonicalDay));
  const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
  const jsonLd = generateJsonLd(brand, hours, currentUrl);
  const faqJsonLd = generateFaqJsonLd(brand, hours, status, "en");
  const websiteJsonLd = generateWebsiteJsonLd();
  const orgJsonLd = generateOrganizationJsonLd();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: brand.name, item: absoluteUrl(buildBrandUrl("en", slug)) },
    { name: DAY_LABELS[canonicalDay], item: currentUrl },
  ]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="page-pad grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start" style={{ paddingTop: 32, paddingBottom: 64 }}>
          <main className="min-w-0">
            <nav className="font-mono text-xs text-muted flex items-center gap-1.5 mb-5">
              <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
              <span className="text-muted">/</span>
              <Link href={buildBrandUrl("en", slug)} className="text-muted2 no-underline hover:text-text transition-colors">{brand.name}</Link>
              <span className="text-muted">/</span>
              <span className="text-text">{DAY_LABELS[canonicalDay]}</span>
            </nav>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 text-text">
              Is {brand.name} Open on {DAY_LABELS[canonicalDay]}?
            </h1>

            <div className={`rounded-[20px] p-6 sm:p-8 mb-6 border ${isHoliday ? "border-orange/30" : isOpenOnDay ? "border-green/25" : "border-red/20"}`}>
              {isHoliday ? (
                <p className="text-sm text-muted2">{DAY_LABELS[canonicalDay]} - Hours may vary by location.</p>
              ) : (
                <p className="text-lg text-text">{isOpenOnDay ? "Yes, typically open" : "No, usually closed"} - {hoursStr}</p>
              )}
            </div>

            <div className="mb-6">
              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={140} />
            </div>

            <h2 className="font-heading text-lg font-bold mb-3 text-text">Full week hours</h2>
            <HoursTable hours={hours} />
          </main>

          <aside className="hidden lg:block sticky top-[72px]">
            <TrendingSidebar />
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
