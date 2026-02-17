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

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBrandSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = getBrandBySlug(slug);
  if (!data) return { title: "Not Found" };

  const { brand } = data;
  const year = new Date().getFullYear();

  return {
    title: `Is ${brand.name} Open Right Now? [${year} Hours]`,
    description: `Check if ${brand.name} is open right now. Real-time status, today's hours, holiday schedule and closing time countdown.`,
    alternates: {
      canonical: `https://isopenow.com/is-${slug}-open`,
      languages: {
        en: `/is-${slug}-open`,
        fr: `/fr/is-${slug}-open`,
        es: `/es/is-${slug}-open`,
      },
    },
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const data = getBrandBySlug(slug);
  if (!data) notFound();

  const { brand, hours } = data;
  const timezone = "America/New_York";
  const status = computeOpenStatus(hours, timezone, brand.is24h);
  const related = getRelatedBrands(slug, brand.category, 6);
  const currentUrl = `https://isopenow.com/is-${slug}-open`;
  const jsonLd = generateJsonLd(brand, hours, currentUrl);

  return (
    <>
      <Navbar />
      <div className="bg-bg pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0 items-start">
          {/* Main Column */}
          <main className="min-w-0 lg:pr-10">
            {/* Breadcrumb */}
            <nav className="font-mono text-xs text-ink3 flex items-center gap-1.5 mb-5">
              <a href="/" className="text-ink3 no-underline hover:text-ink">Home</a>
              <span className="opacity-40">/</span>
              <a href={`/category/${brand.category?.toLowerCase().replace(/\s+/g, "-")}`} className="text-ink3 no-underline hover:text-ink">{brand.category}</a>
              <span className="opacity-40">/</span>
              <span>{brand.name}</span>
            </nav>

            {/* Timezone pill */}
            <div className="inline-flex items-center gap-1.5 bg-bg2 border border-ink/10 rounded-full px-3 py-1 font-mono text-xs text-ink3 mb-4">
              🌍 Timezone: {timezone}
            </div>

            {/* JSON-LD */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero status — the big OPEN/CLOSED answer */}
            <StatusHero brand={brand} initialStatus={status} />

            {/* Holiday alert */}
            <HolidayAlert brandName={brand.name} />

            {/* Hours table */}
            <HoursTable hours={hours} timezone={timezone} />

            {/* Affiliate unit */}
            <AffiliateUnit
              brandName={brand.name}
              category={brand.category}
              isOpen={status.isOpen}
            />

            {/* User reports */}
            <UserReports brandSlug={slug} />

            {/* Related brands */}
            <RelatedBrands brands={related} />

            {/* Day-specific pages links for SEO internal linking */}
            <div className="bg-white border border-ink/10 rounded-xl p-6 mb-4 shadow-sm">
              <h2 className="text-[15px] font-bold tracking-tight mb-3 flex items-center gap-2">
                <span>📅</span> Hours by day
              </h2>
              <div className="flex flex-wrap gap-2">
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                  <a
                    key={day}
                    href={`/is-${slug}-open-on-${day}`}
                    className="text-xs font-mono bg-bg border border-ink/10 rounded-lg px-3 py-1.5 text-ink2 no-underline hover:bg-bg2 hover:text-ink transition-colors"
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </a>
                ))}
                <a
                  href={`/is-${slug}-open-on-christmas`}
                  className="text-xs font-mono bg-red-bg border border-red/20 rounded-lg px-3 py-1.5 text-red no-underline hover:bg-red/10 transition-colors"
                >
                  Christmas
                </a>
                <a
                  href={`/is-${slug}-open-on-thanksgiving`}
                  className="text-xs font-mono bg-amber-bg border border-amber/20 rounded-lg px-3 py-1.5 text-amber no-underline hover:bg-amber/10 transition-colors"
                >
                  Thanksgiving
                </a>
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block sticky top-[84px]">
            <TrendingSidebar />
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
}
