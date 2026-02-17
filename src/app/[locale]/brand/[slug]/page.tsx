import { notFound } from "next/navigation";
import type { Metadata } from "next";
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
import { generateJsonLd } from "@/lib/schema";
import { t, LOCALES, type Locale } from "@/lib/i18n/translations";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllBrandSlugs();
  const result: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES.filter((l) => l !== "en")) {
    for (const slug of slugs) {
      result.push({ locale, slug });
    }
  }
  return result;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const data = getBrandBySlug(slug);
  if (!data) return { title: "Not Found" };

  const loc = locale as Locale;
  const { brand } = data;
  const year = String(new Date().getFullYear());

  return {
    title: t(loc, "titleWithYear", { brand: brand.name, year }),
    description: t(loc, "description", { brand: brand.name }),
    alternates: {
      canonical: `https://isopenow.com/${locale}/is-${slug}-open`,
      languages: {
        en: `/is-${slug}-open`,
        fr: `/fr/is-${slug}-open`,
        es: `/es/is-${slug}-open`,
        "x-default": `/is-${slug}-open`,
      },
    },
  };
}

export default async function LocaleBrandPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const data = getBrandBySlug(slug);
  if (!data) notFound();

  const { brand, hours } = data;
  const timezone = "America/New_York";
  const status = computeOpenStatus(hours, timezone, brand.is24h);
  const related = getRelatedBrands(slug, brand.category, 6);
  const currentUrl = `https://isopenow.com/${locale}/is-${slug}-open`;
  const jsonLd = generateJsonLd(brand, hours, currentUrl);

  const translatedStatus = { ...status };

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <nav className="px-6 sm:px-12 pt-4 flex items-center gap-2 text-[13px] text-muted">
          <a href={`/${locale}`} className="text-muted2 no-underline hover:text-text transition-colors">
            {t(loc, "home")}
          </a>
          <span className="text-muted">/</span>
          <span className="text-muted2">{brand.category}</span>
          <span className="text-muted">/</span>
          <span className="text-text">{brand.name}</span>
        </nav>

        <link rel="alternate" hrefLang="en" href={`https://isopenow.com/is-${slug}-open`} />
        <link rel="alternate" hrefLang="fr" href={`https://isopenow.com/fr/is-${slug}-open`} />
        <link rel="alternate" hrefLang="es" href={`https://isopenow.com/es/is-${slug}-open`} />
        <link rel="alternate" hrefLang="x-default" href={`https://isopenow.com/is-${slug}-open`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Hero */}
        <div className="mx-6 sm:mx-12 mt-6">
          <StatusHero brand={brand} initialStatus={translatedStatus} />
        </div>

        {/* Body grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 px-6 sm:px-12 py-6 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            <HolidayAlert brandName={brand.name} />
            <HoursTable hours={hours} />
            <AffiliateUnit brandName={brand.name} category={brand.category} isOpen={status.isOpen} />
            <UserReports brandSlug={slug} />
          </div>

          <aside className="hidden lg:flex flex-col gap-4 sticky top-[72px]">
            <TrendingSidebar />
            <RelatedBrands brands={related} />
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
