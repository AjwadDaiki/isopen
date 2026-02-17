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
    openGraph: {
      type: "website",
      url: absoluteUrl(buildDayUrl("en", slug, canonicalDay)),
      title: `Is ${data.brand.name} Open on ${DAY_LABELS[canonicalDay]}?`,
      description: `Typical ${DAY_LABELS[canonicalDay]} hours for ${data.brand.name}.`,
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
  const hoursStr = dayHours?.openTime && dayHours?.closeTime ? `${formatTime(dayHours.openTime)} - ${formatTime(dayHours.closeTime)}` : "Closed";

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
        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <Link href={buildBrandUrl("en", slug)} className="text-muted2 no-underline hover:text-text transition-colors">{brand.name}</Link>
            <span>/</span>
            <span className="text-text">{DAY_LABELS[canonicalDay]}</span>
          </nav>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <div className="page-pad pt-3 pb-14">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg flex flex-col gap-4">
                  <h1 className="font-heading text-[30px] sm:text-[42px] font-extrabold tracking-[-0.03em] leading-[0.96] text-text">
                    Is {brand.name} Open on {DAY_LABELS[canonicalDay]}?
                  </h1>

                  <p className="text-[14px] text-muted2 max-w-[64ch] leading-relaxed">
                    Typical schedule reference for {DAY_LABELS[canonicalDay]}. Check local branch details before visiting.
                  </p>

                  <div
                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-semibold ${
                      isHoliday
                        ? "border-orange/30 bg-orange-dim text-orange"
                        : isOpenOnDay
                          ? "border-green/30 bg-green-dim text-green"
                          : "border-red/30 bg-red-dim text-red"
                    }`}
                  >
                    <span className={`w-[7px] h-[7px] rounded-full ${isOpenOnDay && !isHoliday ? "bg-green animate-pulse-dot" : isHoliday ? "bg-orange" : "bg-red"}`} />
                    {isHoliday ? "Holiday schedule" : isOpenOnDay ? "Usually open" : "Usually closed"}
                  </div>

                  <p className="text-[15px] text-text">
                    {isHoliday ? `${DAY_LABELS[canonicalDay]} hours may vary by location.` : `Typical hours: ${hoursStr}`}
                  </p>
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={140} />

              <HoursTable hours={hours} />
            </main>

            <aside className="sidebar-stack">
              <TrendingSidebar />
              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={240} />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}
