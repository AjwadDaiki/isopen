import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { generateBreadcrumbJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Holiday Store Hours 2026 | Is It Open on Holidays?",
  description:
    "Check store hours for every major US holiday in 2026. Find out if your favorite store is open on Christmas, Thanksgiving, Easter and more.",
  alternates: { canonical: absoluteUrl("/holiday") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/holiday"),
    title: "Holiday Store Hours 2026",
    description: "Real-time holiday hours for all major US stores and restaurants. Updated for 2026.",
  },
};

const HOLIDAYS = [
  {
    slug: "new-years",
    name: "New Year's Day",
    date: "January 1, 2026",
    emoji: "🎆",
    desc: "Most retailers open reduced hours. Many restaurants and fast food chains open.",
    impact: "Moderate",
  },
  {
    slug: "easter",
    name: "Easter Sunday",
    date: "April 5, 2026",
    emoji: "🐣",
    desc: "Many stores close early or operate reduced Sunday hours. Fast food usually open.",
    impact: "High",
  },
  {
    slug: "memorial-day",
    name: "Memorial Day",
    date: "May 25, 2026",
    emoji: "🇺🇸",
    desc: "Most retailers open normal or extended hours. Good day to shop.",
    impact: "Low",
  },
  {
    slug: "independence-day",
    name: "Independence Day",
    date: "July 4, 2026",
    emoji: "🎇",
    desc: "Many stores close early for fireworks. Fast food open, banks closed.",
    impact: "Moderate",
  },
  {
    slug: "labor-day",
    name: "Labor Day",
    date: "September 7, 2026",
    emoji: "👷",
    desc: "Most retailers open normal hours. Banks and government offices closed.",
    impact: "Low",
  },
  {
    slug: "thanksgiving",
    name: "Thanksgiving",
    date: "November 26, 2026",
    emoji: "🦃",
    desc: "Major closures — most stores closed. Pharmacies and fast food may be open.",
    impact: "Very High",
  },
  {
    slug: "black-friday",
    name: "Black Friday",
    date: "November 27, 2026",
    emoji: "🛍️",
    desc: "Extended hours at most retailers. Best shopping day of the year.",
    impact: "None — Extended",
  },
  {
    slug: "christmas-eve",
    name: "Christmas Eve",
    date: "December 24, 2026",
    emoji: "🎄",
    desc: "Most stores close early (2–6PM). Plan shopping in the morning.",
    impact: "Moderate",
  },
  {
    slug: "christmas",
    name: "Christmas Day",
    date: "December 25, 2026",
    emoji: "🎁",
    desc: "Most stores closed. 24/7 pharmacies and some fast food may stay open.",
    impact: "Very High",
  },
  {
    slug: "new-years-eve",
    name: "New Year's Eve",
    date: "December 31, 2026",
    emoji: "🥂",
    desc: "Most stores open normal hours, may close early. Restaurants busy.",
    impact: "Low",
  },
];

const IMPACT_COLOR: Record<string, string> = {
  "Very High": "text-red-400",
  "High": "text-orange-400",
  "Moderate": "text-yellow-500",
  "Low": "text-green",
  "None — Extended": "text-blue-400",
};

export default function HolidayIndexPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Holiday Hours", item: absoluteUrl("/holiday") },
  ]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <span className="text-text">Holiday Hours</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="mx-auto max-w-[980px] content-stack">
            <section className="ui-panel overflow-hidden">
              <div className="panel-body-lg">
                <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                  Holiday Store Hours 2026
                </h1>
                <p className="text-muted2 text-[15px] leading-relaxed mt-5 max-w-[68ch]">
                  Find out which stores are open — and at what hours — for every major US holiday.
                  We track real-time status for hundreds of brands across all holidays.
                </p>
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                  All US holidays 2026
                </h2>
              </div>
              <div className="panel-body flex flex-col gap-0 divide-y divide-border">
                {HOLIDAYS.map((h) => (
                  <Link
                    key={h.slug}
                    href={`/holiday/${h.slug}`}
                    className="no-underline flex items-start gap-4 py-4 px-1 hover:bg-bg2 transition-colors rounded-lg -mx-1 px-2"
                  >
                    <span className="text-2xl mt-0.5 shrink-0">{h.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-[14px] font-semibold text-text">{h.name}</p>
                        <span className={`text-[11px] font-semibold ${IMPACT_COLOR[h.impact] || "text-muted2"}`}>
                          Impact: {h.impact}
                        </span>
                      </div>
                      <p className="text-[12px] text-muted2 mt-0.5">{h.date}</p>
                      <p className="text-[13px] text-muted2 mt-1.5 leading-relaxed">{h.desc}</p>
                    </div>
                    <span className="text-[12px] text-muted2 mt-1 shrink-0">Check hours →</span>
                  </Link>
                ))}
              </div>
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={100} />

            <section className="ui-panel overflow-hidden">
              <div className="panel-body-lg">
                <h2 className="font-heading font-bold text-[18px] text-text tracking-[-0.02em] mb-4">
                  Holiday Hours Guide
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      emoji: "🎁",
                      title: "Major closures",
                      desc: "Christmas Day and Thanksgiving see the most store closures. Plan ahead and stock up the day before.",
                      color: "text-red-400",
                    },
                    {
                      emoji: "🛍️",
                      title: "Extended hours",
                      desc: "Black Friday and holiday weekends often feature extended store hours. Great time to shop.",
                      color: "text-green",
                    },
                    {
                      emoji: "💊",
                      title: "Always open",
                      desc: "24/7 pharmacies (CVS, Walgreens), hospitals and some gas stations remain open on all holidays.",
                      color: "text-blue-400",
                    },
                  ].map((tip) => (
                    <div key={tip.title} className="rounded-xl border border-border p-4">
                      <span className="text-xl">{tip.emoji}</span>
                      <p className={`text-[13px] font-semibold ${tip.color} mt-2`}>{tip.title}</p>
                      <p className="text-[12px] text-muted2 mt-1.5 leading-relaxed">{tip.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
