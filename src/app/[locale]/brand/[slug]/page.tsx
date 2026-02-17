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
import { t, getNonEnglishLocales, LOCALES, type Locale } from "@/lib/i18n/translations";
import { buildBrandUrl, buildDayUrl, type CanonicalDay } from "@/lib/i18n/url-patterns";
import { buildLocaleAlternates, absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
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
  const slugs = getAllBrandSlugs();
  return getNonEnglishLocales().flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const data = getBrandBySlug(slug);
  if (!data) return { title: "Not Found" };

  const loc = locale as Locale;
  const { brand } = data;
  const year = String(new Date().getFullYear());

  const alternates = buildLocaleAlternates(
    Object.fromEntries(LOCALES.map((l) => [l, buildBrandUrl(l, slug)])) as Record<Locale, string>
  );

  return {
    title: t(loc, "titleWithYear", { brand: brand.name, year }),
    description: t(loc, "description", { brand: brand.name }),
    alternates: {
      canonical: absoluteUrl(buildBrandUrl(loc, slug)),
      languages: alternates,
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(buildBrandUrl(loc, slug)),
      title: t(loc, "title", { brand: brand.name }),
      description: t(loc, "description", { brand: brand.name }),
    },
  };
}

export default async function LocaleBrandPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const data = getBrandBySlug(slug);
  if (!data || !LOCALES.includes(loc) || loc === "en") notFound();

  const { brand, hours } = data;
  const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
  const related = getRelatedBrands(slug, brand.category, 6);

  const currentUrl = absoluteUrl(buildBrandUrl(loc, slug));
  const jsonLd = generateJsonLd(brand, hours, currentUrl);
  const faqJsonLd = generateFaqJsonLd(brand, hours, status, loc);
  const websiteJsonLd = generateWebsiteJsonLd();
  const orgJsonLd = generateOrganizationJsonLd();
  const categorySlug = brand.category?.toLowerCase().replace(/\s+/g, "-") || "";
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: t(loc, "home"), item: absoluteUrl(`/${loc}`) },
    { name: brand.category || "Category", item: absoluteUrl(`/${loc}/category/${categorySlug}`) },
    { name: brand.name, item: currentUrl },
  ]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href={`/${loc}`} className="text-muted2 no-underline hover:text-text transition-colors">
              {t(loc, "home")}
            </Link>
            <span>/</span>
            <Link href={`/${loc}/category/${categorySlug}`} className="text-muted2 no-underline hover:text-text transition-colors">
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

        <div className="page-pad pt-2">
          <StatusHero brand={brand} initialStatus={status} locale={loc} />
        </div>

        <div className="page-pad pt-4">
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={90} />
        </div>

        <div className="page-pad pt-7 pb-14">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <HolidayAlert brandName={brand.name} />
              <HoursTable hours={hours} />

              <AffiliateUnit brandName={brand.name} category={brand.category || null} isOpen={status.isOpen} />

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={100} />

              <UserReports brandSlug={slug} />

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">{t(loc, "openingHours")}+</h3>
                </div>

                <div className="panel-body flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2.5">
                    {DAY_SLUGS.map((day) => (
                      <Link
                        key={day}
                        href={buildDayUrl(loc, slug, day as CanonicalDay)}
                        className="text-[12px] font-medium px-3.5 py-2 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                      >
                        {t(loc, day)}
                      </Link>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-border/70 flex flex-wrap gap-2.5">
                    {HOLIDAY_SLUGS.map((holiday) => (
                      <Link
                        key={holiday}
                        href={buildDayUrl(loc, slug, holiday as CanonicalDay)}
                        className="text-[12px] font-medium px-3.5 py-2 rounded-xl border border-orange/30 bg-orange-dim text-orange no-underline hover:opacity-90 transition-opacity"
                      >
                        {holiday.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </Link>
                    ))}
                  </div>
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">FAQ</h3>
                </div>
                <div>
                  <FaqItem
                    q={t(loc, "whatTimeCloseQ", { brand: brand.name })}
                    a={status.closesIn ? `${t(loc, "closesIn")} ${status.closesIn}.` : `${t(loc, "opensAt")} ${status.opensAt || "--"}.`}
                  />
                  <FaqItem
                    q={t(loc, "openHolidaysQ", { brand: brand.name })}
                    a={status.holidayName ? `${t(loc, "holiday")}: ${status.holidayName}` : `${t(loc, "holiday")}: ${t(loc, "no")}`}
                  />
                  <FaqItem
                    q={t(loc, "open24HoursQ", { brand: brand.name })}
                    a={brand.is24h ? `${t(loc, "yes")} - ${t(loc, "open24h")}.` : `${t(loc, "no")} - ${t(loc, "closedToday")}.`}
                  />
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
    <article className="border-b border-border last:border-b-0 px-5 py-4 md:px-6 md:py-5">
      <h3 className="font-heading font-bold text-[14px] md:text-[15px] mb-1.5 text-text leading-snug">{q}</h3>
      <p className="text-[14px] text-muted2 leading-relaxed">{a}</p>
    </article>
  );
}
