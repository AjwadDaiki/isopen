import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { brandsData } from "@/data/brands";
import { generateBreadcrumbJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Stores Open Late Right Now → After 10PM & Midnight Hours",
  description:
    "Which stores are still open? Live status for every major brand open after 10PM tonight — fast food, pharmacies, grocery, and 24h locations near you.",
  alternates: {
    canonical: absoluteUrl("/open-late"),
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/open-late"),
    title: "Stores Open Late Near Me | Open After 10PM",
    description: "Real-time status for stores open late tonight. McDonald's, CVS, Walgreens, Walmart and more.",
  },
};

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isOpenLate(closeTime: string | null, spansMidnight: boolean): boolean {
  if (!closeTime) return false;
  if (spansMidnight) return true;
  const closeMin = timeToMinutes(closeTime);
  return closeMin >= 22 * 60; // 10 PM or later
}

function getLateClosingTime(hours: { closeTime: string | null; spansMidnight: boolean }[]): string {
  const typicalClose = hours[1]; // Monday
  if (!typicalClose?.closeTime) return "Late";
  if (typicalClose.spansMidnight) return "Midnight+";
  const closeMin = timeToMinutes(typicalClose.closeTime);
  const h = Math.floor(closeMin / 60);
  const m = closeMin % 60;
  if (h === 0) return "Midnight";
  const suffix = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${suffix}`;
}

const LATE_CATEGORIES = [
  { slug: "fast-food", label: "Fast Food", emoji: "🍔" },
  { slug: "pharmacy", label: "Pharmacy", emoji: "💊" },
  { slug: "retail", label: "Retail", emoji: "🛍️" },
  { slug: "grocery", label: "Grocery", emoji: "🛒" },
  { slug: "convenience", label: "Convenience", emoji: "🏪" },
  { slug: "pizza", label: "Pizza", emoji: "🍕" },
  { slug: "coffee", label: "Coffee", emoji: "☕" },
  { slug: "auto", label: "Auto", emoji: "🚗" },
];

export default function OpenLateIndexPage() {
  const lateBrands = brandsData
    .filter((entry) => {
      if (entry.brand.is24h) return true;
      const monHours = entry.hours[1];
      return monHours && isOpenLate(monHours.closeTime, monHours.spansMidnight);
    })
    .slice(0, 30);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Open Late", item: absoluteUrl("/open-late") },
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Stores open late",
    itemListElement: lateBrands.map((entry, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: entry.brand.name,
      url: absoluteUrl(`/brand/${entry.brand.slug}`),
    })),
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <span className="text-text">Open Late</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-[11px] font-semibold mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    Live late-night tracker
                  </div>
                  <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                    Stores Open Late Tonight
                  </h1>
                  <p className="text-muted2 text-[15px] leading-relaxed mt-5 max-w-[68ch]">
                    Real-time status for every major brand open after 10PM. From fast food to pharmacies,
                    find what&apos;s still open near you tonight.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="text-[12px] text-muted2 font-medium px-3 py-1.5 bg-bg2 border border-border rounded-full">
                      {lateBrands.length} brands tracked
                    </span>
                    <span className="text-[12px] text-muted2 font-medium px-3 py-1.5 bg-bg2 border border-border rounded-full">
                      Updated every 45s
                    </span>
                    <span className="text-[12px] text-muted2 font-medium px-3 py-1.5 bg-bg2 border border-border rounded-full">
                      All US timezones
                    </span>
                  </div>
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Browse by category</h2>
                </div>
                <div className="panel-body grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LATE_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/open-late/${cat.slug}`}
                      className="brand-card-link brand-card-premium no-underline p-4 flex flex-col items-center text-center gap-2"
                    >
                      <span className="text-2xl">{cat.emoji}</span>
                      <p className="text-[13px] font-semibold text-text">{cat.label}</p>
                      <p className="text-[11px] text-muted2">Open late</p>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                    All brands open late
                  </h2>
                </div>
                <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {lateBrands.map(({ brand, hours }) => {
                    const lateClose = getLateClosingTime(hours);
                    return (
                      <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="brand-card-link brand-card-premium no-underline p-4 flex items-center gap-3"
                      >
                        <span className="text-xl">{brand.emoji || "🏪"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-text truncate">{brand.name}</p>
                          <p className="text-[11px] text-muted2">{brand.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[12px] font-mono text-orange-400 font-semibold">
                            {brand.is24h ? "24/7" : `Until ${lateClose}`}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={100} />

              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <h2 className="font-heading font-bold text-[20px] text-text tracking-[-0.02em] mb-4">
                    Late Night FAQs
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        q: "What fast food places are open late?",
                        a: "McDonald's, Burger King, Taco Bell, Wendy's, Jack in the Box and Denny's are typically open until midnight or later on weekends. Many have 24-hour drive-throughs.",
                      },
                      {
                        q: "Which pharmacies are open 24 hours?",
                        a: "Select CVS and Walgreens locations are open 24 hours. Most Rite Aid, Walmart Pharmacy and Kroger Pharmacy locations close by 10PM.",
                      },
                      {
                        q: "Are grocery stores open after midnight?",
                        a: "Walmart Supercenter and some Kroger/Safeway locations stay open 24 hours. Most standard grocery stores close between 10PM and midnight.",
                      },
                    ].map((faq, i) => (
                      <div key={i} className="border-b border-border last:border-0 pb-4 last:pb-0">
                        <p className="text-[14px] font-semibold text-text">{faq.q}</p>
                        <p className="text-[13px] text-muted2 mt-1.5 leading-relaxed">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </main>

            <aside className="sidebar-stack">
              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">24/7 stores</h3>
                </div>
                <div className="panel-body flex flex-col gap-2">
                  {brandsData.filter((e) => e.brand.is24h).slice(0, 8).map(({ brand }) => (
                    <Link
                      key={brand.slug}
                      href={`/brand/${brand.slug}`}
                      className="no-underline flex items-center gap-3 rounded-xl border border-border px-4 py-3 hover:border-border2 transition-colors"
                    >
                      <span className="text-lg">{brand.emoji}</span>
                      <div>
                        <p className="text-[13px] font-semibold text-text">{brand.name}</p>
                        <p className="text-[11px] text-green font-semibold">Always open</p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href="/open-24h"
                    className="no-underline text-center text-[12px] text-muted2 hover:text-text mt-1 transition-colors"
                  >
                    See all 24/7 stores →
                  </Link>
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Related pages</h3>
                </div>
                <div className="panel-body flex flex-col gap-2">
                  {[
                    { href: "/near-me/fast-food", label: "Fast Food Near Me" },
                    { href: "/near-me/pharmacy", label: "Pharmacy Near Me" },
                    { href: "/open-24h", label: "24 Hour Stores" },
                    { href: "/holiday/christmas", label: "Christmas Hours" },
                    { href: "/holiday/thanksgiving", label: "Thanksgiving Hours" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="no-underline text-[13px] text-muted2 hover:text-text transition-colors px-4 py-2.5 rounded-xl border border-border hover:border-border2"
                    >
                      {link.label} →
                    </Link>
                  ))}
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={220} />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
