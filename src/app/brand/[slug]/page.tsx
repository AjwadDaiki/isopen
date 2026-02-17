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
  const ssrTz = "America/New_York";
  const status = computeOpenStatus(hours, ssrTz, brand.is24h);
  const related = getRelatedBrands(slug, brand.category, 6);
  const currentUrl = `https://isopenow.com/is-${slug}-open`;
  const jsonLd = generateJsonLd(brand, hours, currentUrl);
  const faqJsonLd = generateFaqJsonLd(brand, hours, status);
  const categorySlug = brand.category?.toLowerCase().replace(/\s+/g, "-") || "";

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <nav className="px-6 sm:px-12 pt-4 flex items-center gap-2 text-[13px] text-muted">
          <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
          <span className="text-muted">/</span>
          <Link href={`/category/${categorySlug}`} className="text-muted2 no-underline hover:text-text transition-colors">{brand.category}</Link>
          <span className="text-muted">/</span>
          <span className="text-text">{brand.name}</span>
        </nav>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        {/* Hero - full width */}
        <div className="mx-6 sm:mx-12 mt-6">
          <StatusHero brand={brand} initialStatus={status} />
        </div>

        {/* Body grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 px-6 sm:px-12 py-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-4 min-w-0">
            <HolidayAlert brandName={brand.name} />
            <HoursTable hours={hours} />
            <AffiliateUnit brandName={brand.name} category={brand.category} isOpen={status.isOpen} />
            <UserReports brandSlug={slug} />

            {/* By day tabs */}
            <div className="bg-bg1 border border-border rounded-2xl overflow-hidden">
              <div className="card-title-row">
                <h3 className="font-heading font-bold text-sm tracking-[-0.01em] flex items-center gap-2 text-text">
                  <span>📅</span> {brand.name} hours by day
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5 p-4">
                {["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map((day) => (
                  <Link
                    key={day}
                    href={`/is-${slug}-open-on-${day}`}
                    className="text-xs font-medium px-3 py-1.5 rounded-md border border-transparent text-muted2 no-underline hover:bg-bg2 hover:text-text hover:border-border2 transition-all"
                  >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Link>
                ))}
                {["christmas","thanksgiving","new-years","easter"].map((h) => (
                  <Link
                    key={h}
                    href={`/is-${slug}-open-on-${h}`}
                    className="text-xs font-medium px-3 py-1.5 rounded-md text-orange no-underline hover:bg-orange-dim transition-all"
                  >
                    {h.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </Link>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-bg1 border border-border rounded-2xl overflow-hidden">
              <div className="card-title-row">
                <h3 className="font-heading font-bold text-sm tracking-[-0.01em] flex items-center gap-2 text-text">
                  <span>❓</span> Frequently asked questions
                </h3>
              </div>
              <div>
                <FaqItem
                  q={`Is ${brand.name} open right now?`}
                  a={status.isOpen
                    ? `Yes, ${brand.name} is currently open${status.todayHours ? `. Today's hours are ${status.todayHours}` : ""}.${status.closesIn ? ` It closes in ${status.closesIn}.` : ""}`
                    : `No, ${brand.name} is currently closed.${status.opensAt ? ` It opens at ${status.opensAt}.` : ""}`}
                />
                <FaqItem
                  q={`What are ${brand.name} hours today?`}
                  a={status.todayHours ? `${brand.name} is open from ${status.todayHours} today.` : `${brand.name} is closed today.`}
                />
                <FaqItem
                  q={`Is ${brand.name} open on Sunday?`}
                  a={(() => {
                    const sun = hours.find(h => h.dayOfWeek === 0);
                    if (!sun || sun.isClosed) return `${brand.name} is typically closed on Sundays.`;
                    return `Yes, ${brand.name} is typically open on Sundays from ${sun.openTime} to ${sun.closeTime}.`;
                  })()}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-4 sticky top-[72px]">
            <TrendingSidebar />
            <RelatedBrands brands={related} />

            {/* Official website link */}
            {brand.website && (
              <div className="bg-bg1 border border-border rounded-2xl overflow-hidden">
                <div className="p-5">
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 no-underline text-text"
                  >
                    <span className="text-xl">🌐</span>
                    <div>
                      <div className="text-xs text-muted2 mb-0.5">Official website</div>
                      <div className="font-heading font-bold text-[13px]">
                        {brand.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")} &rarr;
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-border last:border-b-0 px-6 py-4">
      <h3 className="font-heading font-bold text-[13px] mb-1.5 text-text">{q}</h3>
      <p className="text-[13px] text-muted2 leading-relaxed">{a}</p>
    </div>
  );
}
