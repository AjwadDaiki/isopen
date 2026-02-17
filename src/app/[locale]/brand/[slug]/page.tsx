import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
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

  // Translate status labels for the hero
  const translatedStatus = {
    ...status,
    // Keep the data but UI will use translated labels
  };

  return (
    <>
      <Navbar />
      <div className="bg-bg pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0 items-start">
          <main className="min-w-0 lg:pr-10">
            <nav className="font-mono text-xs text-ink3 flex items-center gap-1.5 mb-5">
              <a href={`/${locale}`} className="text-ink3 no-underline hover:text-ink">
                {t(loc, "home")}
              </a>
              <span className="opacity-40">/</span>
              <span>{brand.category}</span>
              <span className="opacity-40">/</span>
              <span>{brand.name}</span>
            </nav>

            <div className="inline-flex items-center gap-1.5 bg-bg2 border border-ink/10 rounded-full px-3 py-1 font-mono text-xs text-ink3 mb-4">
              🌍 {t(loc, "timezone")}: {timezone}
            </div>

            {/* Hreflang links */}
            <link rel="alternate" hrefLang="en" href={`https://isopenow.com/is-${slug}-open`} />
            <link rel="alternate" hrefLang="fr" href={`https://isopenow.com/fr/is-${slug}-open`} />
            <link rel="alternate" hrefLang="es" href={`https://isopenow.com/es/is-${slug}-open`} />
            <link rel="alternate" hrefLang="x-default" href={`https://isopenow.com/is-${slug}-open`} />

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <StatusHero brand={brand} initialStatus={translatedStatus} />
            <HolidayAlert brandName={brand.name} />
            <HoursTable hours={hours} timezone={timezone} />
            <AffiliateUnit brandName={brand.name} category={brand.category} isOpen={status.isOpen} />
            <UserReports brandSlug={slug} />
            <RelatedBrands brands={related} />
          </main>

          <aside className="hidden lg:block sticky top-[84px]">
            <TrendingSidebar />
          </aside>
        </div>
      </div>

      <footer className="border-t border-ink/10 py-8 px-4 sm:px-6 bg-bg">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <a href={`/${locale}`} className="font-extrabold text-lg text-green tracking-tight no-underline">
            isitopen
          </a>
          <div className="font-mono text-[11px] text-ink3">
            {t(loc, "footer")} · {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </>
  );
}
