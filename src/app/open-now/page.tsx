import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import TrendingSidebar from "@/components/TrendingSidebar";
import { brandsData } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { generateBreadcrumbJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 60;

const year = new Date().getFullYear();

export const metadata: Metadata = {
  title: `What's Open Right Now? → Live Status Every Major Brand ${year}`,
  description:
    "See which stores, restaurants, and services are open right this second. Live real-time status for 100+ major US brands — no guessing, no outdated hours.",
  alternates: {
    canonical: absoluteUrl("/open-now"),
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/open-now"),
    title: "What's Open Right Now? Live Status",
    description: "Real-time open/closed status for every major US store and restaurant.",
  },
};

const CATEGORY_ORDER = [
  "Fast Food",
  "Grocery",
  "Pharmacy",
  "Coffee",
  "Retail",
  "Home Improvement",
  "Shipping",
];

export default function OpenNowPage() {
  const tz = "America/New_York";

  const openBrands = brandsData
    .map(({ brand, hours }) => ({
      brand,
      hours,
      status: computeOpenStatus(hours, tz, brand.is24h),
    }))
    .filter(({ status }) => status.isOpen);

  const closedSoon = brandsData
    .map(({ brand, hours }) => ({
      brand,
      hours,
      status: computeOpenStatus(hours, tz, brand.is24h),
    }))
    .filter(({ status }) => !status.isOpen && status.opensAt);

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    brands: openBrands.filter(({ brand }) => brand.category === cat),
  })).filter(({ brands }) => brands.length > 0);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Open Now", item: absoluteUrl("/open-now") },
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Stores open right now",
    description: "Real-time list of open stores and restaurants",
    itemListElement: openBrands.slice(0, 20).map(({ brand }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: brand.name,
      url: absoluteUrl(`/brand/${brand.slug}`),
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
            <span className="text-text">Open Now</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg flex flex-col gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green animate-pulse-dot" style={{ boxShadow: "0 0 10px var(--color-green-glow)" }} />
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-green">Live right now</span>
                  </div>
                  <h1 className="font-heading font-extrabold text-[32px] sm:text-[46px] tracking-[-0.03em] leading-[0.95] text-text">
                    What&apos;s Open<br />Right Now?
                  </h1>
                  <p className="text-[15px] text-muted2 leading-relaxed max-w-[60ch]">
                    Real-time open/closed status for {brandsData.length}+ major US brands.
                    Status reflects Eastern Time and updates every minute.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <div className="inline-flex items-center gap-2 rounded-full border ui-border-green-30 bg-green-dim px-4 py-2 text-[13px] text-green font-semibold">
                      <span className="w-2 h-2 rounded-full bg-green animate-pulse-dot" />
                      {openBrands.length} brands open now
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border2 bg-bg2 px-4 py-2 text-[13px] text-muted2">
                      {closedSoon.length} brands opening soon
                    </div>
                  </div>
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={90} />

              {byCategory.map(({ category, brands }) => (
                <section key={category} className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                      {category} open now
                    </h2>
                    <Link
                      href={`/category/${category.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-[12px] text-muted2 no-underline hover:text-text transition-colors"
                    >
                      See all →
                    </Link>
                  </div>
                  <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {brands.map(({ brand, status }) => (
                      <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="brand-card-link brand-card-premium brand-card-open p-4 no-underline flex items-center gap-3"
                      >
                        <span className="text-2xl shrink-0">{brand.emoji || "🏪"}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-heading font-bold text-text truncate">{brand.name}</p>
                          <p className="text-[11px] text-muted2 mt-0.5">
                            {brand.is24h ? "Open 24 hours" : status.closesIn ? `Closes in ${status.closesIn}` : status.todayHours || "Open"}
                          </p>
                        </div>
                        <span className="brand-status-pill brand-status-pill-open shrink-0">
                          <span className="status-led" />
                          OPEN
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}

              {openBrands.filter(({ brand }) => !CATEGORY_ORDER.includes(brand.category || "")).length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Other brands open now</h2>
                  </div>
                  <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {openBrands
                      .filter(({ brand }) => !CATEGORY_ORDER.includes(brand.category || ""))
                      .map(({ brand, status }) => (
                        <Link
                          key={brand.slug}
                          href={`/brand/${brand.slug}`}
                          className="brand-card-link brand-card-premium brand-card-open p-4 no-underline flex items-center gap-3"
                        >
                          <span className="text-2xl shrink-0">{brand.emoji || "🏪"}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-heading font-bold text-text truncate">{brand.name}</p>
                            <p className="text-[11px] text-muted2 mt-0.5">
                              {brand.is24h ? "Open 24 hours" : status.closesIn ? `Closes in ${status.closesIn}` : status.todayHours || "Open"}
                            </p>
                          </div>
                          <span className="brand-status-pill brand-status-pill-open shrink-0">
                            <span className="status-led" />
                            OPEN
                          </span>
                        </Link>
                      ))}
                  </div>
                </section>
              )}

              {closedSoon.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Opening soon</h2>
                  </div>
                  <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {closedSoon.slice(0, 12).map(({ brand, status }) => (
                      <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="brand-card-link brand-card-premium p-4 no-underline flex items-center gap-3"
                      >
                        <span className="text-2xl shrink-0">{brand.emoji || "🏪"}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-heading font-bold text-text truncate">{brand.name}</p>
                          <p className="text-[11px] text-muted2 mt-0.5">Opens at {status.opensAt}</p>
                        </div>
                        <span className="brand-status-pill brand-status-pill-closed shrink-0">
                          <span className="status-led" />
                          CLOSED
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={100} />

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Browse by intent</h2>
                </div>
                <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { href: "/open-late", label: "Stores Open Late Tonight", emoji: "🌙", desc: "After 10PM & midnight" },
                    { href: "/open-24h", label: "24 Hour Stores", emoji: "🔁", desc: "Always open, 24/7" },
                    { href: "/near-me/fast-food", label: "Fast Food Near Me", emoji: "🍟", desc: "Quick bites, open now" },
                    { href: "/near-me/pharmacy", label: "Pharmacy Near Me", emoji: "💊", desc: "Meds and health items" },
                    { href: "/near-me/grocery", label: "Grocery Near Me", emoji: "🛒", desc: "Supermarkets open now" },
                    { href: "/holiday", label: "Holiday Hours", emoji: "🎄", desc: "Christmas, Thanksgiving & more" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="brand-card-link brand-card-premium no-underline p-4 flex items-center gap-3"
                    >
                      <span className="text-2xl shrink-0">{link.emoji}</span>
                      <div>
                        <p className="text-[14px] font-semibold text-text leading-tight">{link.label}</p>
                        <p className="text-[12px] text-muted2 mt-0.5">{link.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </main>

            <aside className="sidebar-stack">
              <div className="hidden lg:block">
                <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={250} />
              </div>
              <TrendingSidebar />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
