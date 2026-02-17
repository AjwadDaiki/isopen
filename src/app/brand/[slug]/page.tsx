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
  // SSR default — StatusHero re-fetches immediately with visitor's real timezone
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
      <div className="bg-bg min-h-screen">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-8 pb-20 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 items-start">
          <main className="min-w-0">
            {/* Breadcrumb */}
            <nav className="font-mono text-[12px] text-ink3 flex items-center gap-2 mb-6">
              <Link href="/" className="text-ink3 no-underline hover:text-ink transition-colors">Home</Link>
              <span className="opacity-30">/</span>
              <Link href={`/category/${categorySlug}`} className="text-ink3 no-underline hover:text-ink transition-colors">{brand.category}</Link>
              <span className="opacity-30">/</span>
              <span className="text-ink font-medium">{brand.name}</span>
            </nav>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

            <StatusHero brand={brand} initialStatus={status} />
            <HolidayAlert brandName={brand.name} />
            <HoursTable hours={hours} />
            <AffiliateUnit brandName={brand.name} category={brand.category} isOpen={status.isOpen} />
            <UserReports brandSlug={slug} />
            <RelatedBrands brands={related} />

            {/* Internal links for SEO */}
            <section className="bg-white border border-ink/10 rounded-2xl p-6 mb-5 card-shadow">
              <h2 className="text-base font-bold tracking-tight mb-4">
                📅 {brand.name} hours by day
              </h2>
              <div className="flex flex-wrap gap-2">
                {["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map((day) => (
                  <Link key={day} href={`/is-${slug}-open-on-${day}`}
                    className="text-xs font-mono bg-bg border border-ink/8 rounded-lg px-3.5 py-2 text-ink2 no-underline hover:bg-bg2 hover:text-ink transition-all">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Link>
                ))}
                {["christmas","thanksgiving","new-years","easter"].map((h) => (
                  <Link key={h} href={`/is-${slug}-open-on-${h}`}
                    className="text-xs font-mono bg-amber-bg border border-amber/15 rounded-lg px-3.5 py-2 text-amber no-underline hover:bg-amber/10 transition-all">
                    {h.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </Link>
                ))}
              </div>
            </section>

            {/* FAQ for SEO */}
            <section className="bg-white border border-ink/10 rounded-2xl p-6 card-shadow">
              <h2 className="text-base font-bold tracking-tight mb-5">Frequently asked questions</h2>
              <div className="space-y-5">
                <FaqItem q={`Is ${brand.name} open right now?`}
                  a={status.isOpen
                    ? `Yes, ${brand.name} is currently open${status.todayHours ? `. Today's hours are ${status.todayHours}` : ""}.${status.closesIn ? ` It closes in ${status.closesIn}.` : ""}`
                    : `No, ${brand.name} is currently closed.${status.opensAt ? ` It opens at ${status.opensAt}.` : ""}`} />
                <FaqItem q={`What are ${brand.name} hours today?`}
                  a={status.todayHours ? `${brand.name} is open from ${status.todayHours} today.` : `${brand.name} is closed today.`} />
                <FaqItem q={`Is ${brand.name} open on Sunday?`}
                  a={(() => {
                    const sun = hours.find(h => h.dayOfWeek === 0);
                    if (!sun || sun.isClosed) return `${brand.name} is typically closed on Sundays.`;
                    return `Yes, ${brand.name} is typically open on Sundays from ${sun.openTime} to ${sun.closeTime}.`;
                  })()} />
              </div>
            </section>
          </main>

          <aside className="hidden lg:flex flex-col gap-4 sticky top-[68px]">
            <TrendingSidebar />
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-b border-ink/5 pb-4 last:border-b-0 last:pb-0">
      <h3 className="text-[14px] font-semibold text-ink mb-1.5">{q}</h3>
      <p className="text-[13px] text-ink2 leading-relaxed">{a}</p>
    </div>
  );
}
