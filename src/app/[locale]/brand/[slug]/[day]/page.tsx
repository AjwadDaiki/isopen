import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

  return {
    title: `${t(loc, "onDay", { brand: data.brand.name, day: t(loc, DAY_NAME_BY_KEY[canonicalDay] as never) })} [${year}]`,
    description: t(loc, "onDayDesc", {
      brand: data.brand.name,
      day: t(loc, DAY_NAME_BY_KEY[canonicalDay] as never),
    }),
    alternates: {
      canonical: absoluteUrl(buildDayUrl(loc, slug, canonicalDay)),
      languages: alternates,
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
  const hoursStr = dayHours?.openTime && dayHours?.closeTime ? `${dayHours.openTime} - ${dayHours.closeTime}` : t(loc, "closedToday");

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
        <div className="page-pad grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start" style={{ paddingTop: 32, paddingBottom: 64 }}>
          <main className="min-w-0">
            <nav className="font-mono text-xs text-muted flex items-center gap-1.5 mb-5">
              <Link href={`/${loc}`} className="text-muted2 no-underline hover:text-text transition-colors">{t(loc, "home")}</Link>
              <span className="text-muted">/</span>
              <Link href={buildBrandUrl(loc, slug)} className="text-muted2 no-underline hover:text-text transition-colors">{brand.name}</Link>
              <span className="text-muted">/</span>
              <span className="text-text">{t(loc, DAY_NAME_BY_KEY[canonicalDay] as never)}</span>
            </nav>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 text-text">
              {t(loc, "onDay", { brand: brand.name, day: t(loc, DAY_NAME_BY_KEY[canonicalDay] as never) })}
            </h1>

            <div className={`rounded-[20px] p-6 sm:p-8 mb-6 border ${isHoliday ? "border-orange/30" : isOpenOnDay ? "border-green/25" : "border-red/20"}`}>
              {isHoliday ? (
                <p className="text-sm text-muted2">
                  {t(loc, "holiday")}: {t(loc, "onDayDesc", { brand: brand.name, day: t(loc, DAY_NAME_BY_KEY[canonicalDay] as never) })}
                </p>
              ) : (
                <p className="text-lg text-text">
                  {isOpenOnDay ? t(loc, "yes") : t(loc, "no")} - {t(loc, "typicalHours", { day: t(loc, DAY_NAME_BY_KEY[canonicalDay] as never) })}: {hoursStr}
                </p>
              )}
            </div>

            <h2 className="font-heading text-lg font-bold mb-3 text-text">{t(loc, "allWeekHours")}</h2>
            <HoursTable hours={hours} />

            <Link href={buildBrandUrl(loc, slug)} className="inline-flex items-center gap-2 text-sm font-semibold text-green no-underline hover:underline mt-4">
              {t(loc, "backHome")}
            </Link>
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
