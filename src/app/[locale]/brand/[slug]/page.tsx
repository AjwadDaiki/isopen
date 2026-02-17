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
import { buildBrandUrl } from "@/lib/i18n/url-patterns";
import { buildLocaleAlternates, absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

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
        <nav className="page-pad flex flex-wrap items-center text-muted" style={{ paddingTop: 14, gap: 8, fontSize: 13 }}>
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

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <div className="page-pad" style={{ paddingTop: 16 }}>
          <StatusHero brand={brand} initialStatus={status} locale={loc} />
        </div>

        <div className="page-pad grid grid-cols-1 lg:grid-cols-[1fr_300px]" style={{ gap: 22, paddingTop: 20, paddingBottom: 52 }}>
          <main className="min-w-0 flex flex-col gap-4">
            <HolidayAlert brandName={brand.name} />
            <HoursTable hours={hours} />
            <UserReports brandSlug={slug} />
            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={110} />
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
