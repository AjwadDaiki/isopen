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
import AdSlot from "@/components/AdSlot";
import { getBrandBySlug, getRelatedBrands, getAllBrandSlugs } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { generateJsonLd, generateFaqJsonLd } from "@/lib/schema";

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
    openGraph: {
      title: `Is ${brand.name} Open Right Now?`,
      description: `Real-time ${brand.name} opening hours, holiday schedule, and closing time countdown.`,
      type: "website",
      url: `https://isopenow.com/is-${slug}-open`,
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
  const faqJsonLd = generateFaqJsonLd(brand, hours, status);
  const categorySlug = brand.category?.toLowerCase().replace(/\s+/g, "-") || "";

  return (
    <>
      <Navbar />
      <div className="bg-bg pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0 items-start">
          <main className="min-w-0 lg:pr-10">
            <nav className="font-mono text-xs text-ink3 flex items-center gap-1.5 mb-5">
              <Link href="/" className="text-ink3 no-underline hover:text-ink transition-colors">
                Home
              </Link>
              <span className="opacity-40">/</span>
              <Link
                href={`/category/${categorySlug}`}
                className="text-ink3 no-underline hover:text-ink transition-colors"
              >
                {brand.category}
              </Link>
              <span className="opacity-40">/</span>
              <span className="text-ink">{brand.name}</span>
            </nav>

            <div className="inline-flex items-center gap-1.5 bg-bg2 border border-ink/10 rounded-full px-3 py-1 font-mono text-xs text-ink3 mb-4">
              Your timezone: {timezone}
            </div>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />

            <StatusHero brand={brand} initialStatus={status} />
            <HolidayAlert brandName={brand.name} />
            <HoursTable hours={hours} timezone={timezone} />

            <AdSlot size="728x90" position="In-content leaderboard" />
            <AdSlot size="300x250" position="In-content between sections" />

            <AffiliateUnit
              brandName={brand.name}
              category={brand.category}
              isOpen={status.isOpen}
            />

            <UserReports brandSlug={slug} />
            <AdSlot size="728x90" position="Mid-page leaderboard" />
            <RelatedBrands brands={related} />

            <div className="bg-white border border-ink/10 rounded-xl p-6 mb-4 shadow-[0_2px_16px_rgba(26,22,18,0.08)]">
              <h2 className="text-[15px] font-bold tracking-[-0.01em] mb-3">
                Hours by day
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ].map((day) => (
                  <Link
                    key={day}
                    href={`/is-${slug}-open-on-${day}`}
                    className="text-xs font-mono bg-bg border border-ink/10 rounded-lg px-3 py-1.5 text-ink2 no-underline hover:bg-bg2 hover:text-ink transition-colors"
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Link>
                ))}
                {["christmas", "thanksgiving", "new-years", "easter"].map((holiday) => (
                  <Link
                    key={holiday}
                    href={`/is-${slug}-open-on-${holiday}`}
                    className="text-xs font-mono bg-amber-bg border border-amber/20 rounded-lg px-3 py-1.5 text-amber no-underline hover:bg-amber/10 transition-colors"
                  >
                    {holiday
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white border border-ink/10 rounded-xl p-6 mb-4 shadow-[0_2px_16px_rgba(26,22,18,0.08)]">
              <h2 className="text-[15px] font-bold tracking-[-0.01em] mb-4">
                Frequently asked questions
              </h2>
              <div className="space-y-4">
                <FaqItem
                  q={`Is ${brand.name} open right now?`}
                  a={
                    status.isOpen
                      ? `Yes, ${brand.name} is currently open${status.todayHours ? `. Today's hours are ${status.todayHours}` : ""}.${status.closesIn ? ` It closes in ${status.closesIn}.` : ""}`
                      : `No, ${brand.name} is currently closed.${status.opensAt ? ` It opens at ${status.opensAt}.` : ""}`
                  }
                />
                <FaqItem
                  q={`What are ${brand.name} hours today?`}
                  a={
                    status.todayHours
                      ? `${brand.name} is open from ${status.todayHours} today.`
                      : `${brand.name} is closed today.`
                  }
                />
                <FaqItem
                  q={`Is ${brand.name} open on Sunday?`}
                  a={(() => {
                    const sun = hours.find((h) => h.dayOfWeek === 0);
                    if (!sun || sun.isClosed) {
                      return `${brand.name} is typically closed on Sundays.`;
                    }
                    return `Yes, ${brand.name} is typically open on Sundays from ${sun.openTime} to ${sun.closeTime}.`;
                  })()}
                />
              </div>
            </div>

            <AdSlot size="728x90" position="Footer leaderboard" />
          </main>

          <aside className="hidden lg:block sticky top-[84px]">
            <AdSlot size="300x250" position="Sidebar sticky" />
            <TrendingSidebar />
            <AdSlot size="300x600" position="Half-page sidebar" />
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-ink/5 pb-3 last:border-b-0 last:pb-0">
      <h3 className="text-sm font-semibold text-ink mb-1">{q}</h3>
      <p className="text-[13px] text-ink2 leading-relaxed">{a}</p>
    </div>
  );
}
