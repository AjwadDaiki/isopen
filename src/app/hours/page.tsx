import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { brandsData } from "@/data/brands";
import { generateBreadcrumbJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 3600;

const year = new Date().getFullYear();

export const metadata: Metadata = {
  title: `Store Hours ${year} → Live Hours for Every Major US Brand`,
  description: `Find store hours for any major US brand in seconds. Live open/closed status, today's schedule, holiday hours, and full ${year} weekly timetables for 100+ stores.`,
  alternates: { canonical: absoluteUrl("/hours") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/hours"),
    title: `Store Hours ${year} — Live Status Directory`,
    description: `Today's hours for every major US brand. Live status, holiday schedules, and full weekly timetables.`,
  },
};

const TOP_BRANDS = [
  "mcdonalds", "walmart", "starbucks", "target", "cvs",
  "walgreens", "costco", "home-depot", "burger-king", "taco-bell",
  "chick-fil-a", "wendys", "chipotle", "subway", "dominos",
  "pizza-hut", "kfc", "dunkin", "whole-foods", "kroger",
  "lowes", "best-buy", "dollar-general", "dollar-tree", "rite-aid",
  "seven-eleven", "fedex", "ups", "hobby-lobby", "sams-club",
];

const POPULAR_SEARCHES = [
  { label: "McDonald's Hours", href: "/brand/mcdonalds" },
  { label: "Walmart Hours Today", href: "/brand/walmart" },
  { label: "Starbucks Hours", href: "/brand/starbucks" },
  { label: "CVS Hours Today", href: "/brand/cvs" },
  { label: "Walgreens Hours", href: "/brand/walgreens" },
  { label: "Target Hours Today", href: "/brand/target" },
  { label: "Costco Hours", href: "/brand/costco" },
  { label: "Home Depot Hours", href: "/brand/home-depot" },
  { label: "Chick-fil-A Hours", href: "/brand/chick-fil-a" },
  { label: "Dollar General Hours", href: "/brand/dollar-general" },
  { label: "Christmas Day Hours", href: "/holiday/christmas" },
  { label: "Thanksgiving Hours", href: "/holiday/thanksgiving" },
];

function getCategories() {
  const map = new Map<string, number>();
  for (const { brand } of brandsData) {
    if (brand.category) map.set(brand.category, (map.get(brand.category) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

export default function HoursPage() {
  const topBrands = TOP_BRANDS
    .map((slug) => brandsData.find((e) => e.brand.slug === slug))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .map((e) => e.brand);

  const categories = getCategories();

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Store Hours", item: absoluteUrl("/hours") },
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
            <span className="text-text">Store Hours</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="max-w-[860px] mx-auto content-stack">
            <section className="ui-panel overflow-hidden">
              <div className="panel-body-lg flex flex-col gap-4">
                <h1 className="font-heading font-extrabold text-[30px] sm:text-[44px] tracking-[-0.03em] leading-[0.95] text-text">
                  Store Hours {year}
                </h1>
                <p className="text-[15px] text-muted2 leading-relaxed max-w-[60ch]">
                  Instant hours lookup for {brandsData.length}+ major US brands. Every page shows live
                  open/closed status, today&apos;s schedule, holiday exceptions, and the full {year} weekly timetable.
                </p>
                <div className="flex flex-wrap gap-3 text-[13px] text-muted2">
                  <span className="flex items-center gap-1.5"><span className="text-green font-bold">✓</span> Updated every 45 seconds</span>
                  <span className="flex items-center gap-1.5"><span className="text-green font-bold">✓</span> Holiday schedules included</span>
                  <span className="flex items-center gap-1.5"><span className="text-green font-bold">✓</span> {brandsData.length}+ brands covered</span>
                </div>
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Most searched</h2>
              </div>
              <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-2">
                {POPULAR_SEARCHES.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="no-underline flex items-center gap-2 text-[13px] text-muted2 hover:text-text transition-colors px-4 py-2.5 rounded-xl border border-border hover:border-border2 hover:bg-bg2"
                  >
                    <span className="text-green text-[10px] font-bold">→</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={90} />

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Top 30 brand hours</h2>
                <Link href="/stores" className="text-[12px] text-muted2 no-underline hover:text-text transition-colors">Full A-Z directory →</Link>
              </div>
              <div className="panel-body grid grid-cols-2 sm:grid-cols-3 gap-2">
                {topBrands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={`/brand/${brand.slug}`}
                    className="no-underline flex items-center gap-2 text-[13px] text-muted2 hover:text-text transition-colors px-3 py-2.5 rounded-xl border border-border hover:border-border2 hover:bg-bg2"
                  >
                    <span className="shrink-0">{brand.emoji || "🏪"}</span>
                    <span className="truncate">{brand.name}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Browse by category</h2>
              </div>
              <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map(([cat, count]) => {
                  const slug = cat.toLowerCase().replace(/\s+/g, "-");
                  return (
                    <Link
                      key={cat}
                      href={`/category/${slug}`}
                      className="no-underline flex items-center justify-between text-[13px] text-muted2 hover:text-text transition-colors px-4 py-3 rounded-xl border border-border hover:border-border2 hover:bg-bg2"
                    >
                      <span>{cat} Hours</span>
                      <span className="text-[11px] text-muted font-mono">{count} brands</span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Hours by day</h2>
              </div>
              <div className="panel-body flex flex-wrap gap-2">
                {["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((day) => (
                  <Link
                    key={day}
                    href={`/open-on/${day}`}
                    className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors capitalize"
                  >
                    {day}
                  </Link>
                ))}
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Holiday hours</h2>
              </div>
              <div className="panel-body flex flex-wrap gap-2">
                {[
                  { href: "/holiday/christmas", label: "Christmas Hours" },
                  { href: "/holiday/thanksgiving", label: "Thanksgiving Hours" },
                  { href: "/holiday/new-years", label: "New Year's Hours" },
                  { href: "/holiday/easter", label: "Easter Hours" },
                  { href: "/holiday/black-friday", label: "Black Friday Hours" },
                  { href: "/holiday", label: "All Holidays →" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[12px] font-medium px-4 py-2.5 rounded-xl border ui-border-orange-30 bg-orange-dim text-orange no-underline hover:opacity-90 transition-opacity"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={100} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
