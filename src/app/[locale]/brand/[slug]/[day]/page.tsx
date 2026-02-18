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
import { t, getNonEnglishLocales, LOCALES, type Locale } from "@/lib/i18n/translations";
import { CANONICAL_DAYS, type CanonicalDay, buildBrandUrl, buildDayUrl } from "@/lib/i18n/url-patterns";
import { buildLocaleAlternates, absoluteUrl } from "@/lib/i18n/alternates";
import { getLocaleDayRobots } from "@/lib/seo-index-control";

export const revalidate = 300;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ locale: string; slug: string; day: string }>;
}

const DAY_NAME_BY_KEY: Record<CanonicalDay, "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "holiday"> = {
  sunday: "sunday",
  monday: "monday",
  tuesday: "tuesday",
  wednesday: "wednesday",
  thursday: "thursday",
  friday: "friday",
  saturday: "saturday",
  christmas: "holiday",
  thanksgiving: "holiday",
  "new-years": "holiday",
  easter: "holiday",
};

export async function generateStaticParams() {
  const topTen = getAllBrandSlugs().slice(0, 10);
  return getNonEnglishLocales().flatMap((locale) =>
    topTen.flatMap((slug) => CANONICAL_DAYS.map((day) => ({ locale, slug, day })))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug, day } = await params;
  const data = getBrandBySlug(slug);
  if (!data || !CANONICAL_DAYS.includes(day as CanonicalDay)) return { title: "Not Found" };

  const loc = locale as Locale;
  const canonicalDay = day as CanonicalDay;
  const year = String(new Date().getFullYear());

  const alternates = buildLocaleAlternates(
    Object.fromEntries(LOCALES.map((l) => [l, buildDayUrl(l, slug, canonicalDay)])) as Record<Locale, string>
  );

  const robotsDirective = getLocaleDayRobots(locale, slug);

  return {
    title: `${t(loc, "onDay", { brand: data.brand.name, day: t(loc, DAY_NAME_BY_KEY[canonicalDay] as never) })} [${year}]`,
    description: t(loc, "onDayDesc", {
      brand: data.brand.name,
      day: t(loc, DAY_NAME_BY_KEY[canonicalDay] as never),
    }),
    robots: robotsDirective,
    alternates: {
      canonical: absoluteUrl(buildDayUrl(loc, slug, canonicalDay)),
      languages: alternates,
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(buildDayUrl(loc, slug, canonicalDay)),
      title: t(loc, "onDay", { brand: data.brand.name, day: t(loc, DAY_NAME_BY_KEY[canonicalDay] as never) }),
      description: t(loc, "onDayDesc", {
        brand: data.brand.name,
        day: t(loc, DAY_NAME_BY_KEY[canonicalDay] as never),
      }),
    },
  };
}

export default async function LocaleDayPage({ params }: PageProps) {
  const { locale, slug, day } = await params;
  const loc = locale as Locale;
  const canonicalDay = day as CanonicalDay;

  if (!LOCALES.includes(loc) || loc === "en" || !CANONICAL_DAYS.includes(canonicalDay)) notFound();

  const data = getBrandBySlug(slug);
  if (!data) notFound();

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
  const isHoliday = dayIndex < 0;
  const dayHours = dayIndex >= 0 ? hours.find((h) => h.dayOfWeek === dayIndex) : null;
  const isOpenOnDay = dayHours ? !dayHours.isClosed && !!dayHours.openTime : false;
  const hoursStr = dayHours?.openTime && dayHours?.closeTime ? `${formatTime(dayHours.openTime)} - ${formatTime(dayHours.closeTime)}` : t(loc, "closedToday");

  const canonicalPath = buildDayUrl(loc, slug, canonicalDay);
  const currentUrl = absoluteUrl(canonicalPath);
  const status = computeOpenStatus(hours, "America/New_York", brand.is24h);

  const jsonLd = generateJsonLd(brand, hours, currentUrl);
  const faqJsonLd = generateFaqJsonLd(brand, hours, status, loc);
  const websiteJsonLd = generateWebsiteJsonLd();
  const orgJsonLd = generateOrganizationJsonLd();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: t(loc, "home"), item: absoluteUrl(`/${loc}`) },
    { name: brand.name, item: absoluteUrl(buildBrandUrl(loc, slug)) },
    { name: t(loc, DAY_NAME_BY_KEY[canonicalDay] as never), item: currentUrl },
  ]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href={`/${loc}`} className="text-muted2 no-underline hover:text-text transition-colors">{t(loc, "home")}</Link>
            <span>/</span>
            <Link href={buildBrandUrl(loc, slug)} className="text-muted2 no-underline hover:text-text transition-colors">{brand.name}</Link>
            <span>/</span>
            <span className="text-text">{t(loc, DAY_NAME_BY_KEY[canonicalDay] as never)}</span>
          </nav>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg flex flex-col gap-4">
                  <h1 className="font-heading text-[30px] sm:text-[42px] font-extrabold tracking-[-0.03em] leading-[0.96] text-text">
                    {t(loc, "onDay", { brand: brand.name, day: t(loc, DAY_NAME_BY_KEY[canonicalDay] as never) })}
                  </h1>

                  <p className="text-[14px] text-muted2 max-w-[64ch] leading-relaxed">
                    {t(loc, "onDayDesc", { brand: brand.name, day: t(loc, DAY_NAME_BY_KEY[canonicalDay] as never) })}
                  </p>

                  <div
                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2.5 text-[12px] font-semibold ${
                      isHoliday
                        ? "ui-border-orange-30 bg-orange-dim text-orange"
                        : isOpenOnDay
                          ? "ui-border-green-30 bg-green-dim text-green"
                          : "ui-border-red-30 bg-red-dim text-red"
                    }`}
                  >
                    <span className={`w-[7px] h-[7px] rounded-full ${isOpenOnDay && !isHoliday ? "bg-green animate-pulse-dot" : isHoliday ? "bg-orange" : "bg-red"}`} />
                    {isHoliday ? t(loc, "holiday") : isOpenOnDay ? t(loc, "open") : t(loc, "closed")}
                  </div>

                  <p className="text-[15px] text-text">
                    {isHoliday
                      ? `${t(loc, "holiday")}: ${t(loc, "onDayDesc", { brand: brand.name, day: t(loc, DAY_NAME_BY_KEY[canonicalDay] as never) })}`
                      : `${t(loc, "typicalHours", { day: t(loc, DAY_NAME_BY_KEY[canonicalDay] as never) })}: ${hoursStr}`}
                  </p>
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={140} />

              <HoursTable hours={hours} />

              <Link href={buildBrandUrl(loc, slug)} className="inline-flex items-center gap-2 text-sm font-semibold text-green no-underline hover:underline">
                {t(loc, "backHome")}
              </Link>
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
