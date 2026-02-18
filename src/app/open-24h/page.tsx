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
  title: "24 Hour Stores Open Now | Always Open Near Me",
  description:
    "Complete list of stores, restaurants and services open 24 hours a day, 7 days a week. Real-time status for all 24/7 locations near you.",
  alternates: {
    canonical: absoluteUrl("/open-24h"),
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/open-24h"),
    title: "24 Hour Stores Open Now | Always Open Near Me",
    description: "Find stores open 24 hours near you. Real-time live status for all major 24/7 brands.",
  },
};

export default function Open24hPage() {
  const brands24h = brandsData.filter((e) => e.brand.is24h);
  const lateNightBrands = brandsData.filter((e) => {
    if (e.brand.is24h) return false;
    const fri = e.hours[5];
    if (!fri) return false;
    if (fri.spansMidnight) return true;
    if (!fri.closeTime) return false;
    const [h] = fri.closeTime.split(":").map(Number);
    return h === 0 || h <= 2;
  }).slice(0, 12);

  const by24hCategory: Record<string, typeof brands24h> = {};
  for (const entry of brands24h) {
    const cat = entry.brand.category || "Other";
    if (!by24hCategory[cat]) by24hCategory[cat] = [];
    by24hCategory[cat].push(entry);
  }

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "24 Hour Stores", item: absoluteUrl("/open-24h") },
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "24 hour stores",
    itemListElement: brands24h.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.brand.name,
      url: absoluteUrl(`/brand/${e.brand.slug}`),
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What stores are open 24 hours?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `${brands24h.slice(0, 4).map((e) => e.brand.name).join(", ")} and select locations of other chains are open 24 hours. Availability varies by location.`,
        },
      },
      {
        "@type": "Question",
        name: "Is Walmart open 24 hours?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Some Walmart Supercenters operate 24 hours but many standard Walmart locations close between 11PM and midnight. Use our live status checker to confirm your local store.",
        },
      },
      {
        "@type": "Question",
        name: "What pharmacies are open 24 hours?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Select CVS and Walgreens pharmacy locations operate 24 hours. The 24-hour availability depends on the specific store location.",
        },
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <span className="text-text">24 Hour Stores</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 border ui-border-green-30 bg-green-dim text-green text-[11px] font-semibold mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                    Always open
                  </div>
                  <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                    24 Hour Stores Near Me
                  </h1>
                  <p className="text-muted2 text-[15px] leading-relaxed mt-5 max-w-[68ch]">
                    Stores, pharmacies, restaurants and services open 24 hours a day, 7 days a week.
                    Real-time live status — updated every 45 seconds.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-3 max-w-[360px]">
                    <div className="text-center">
                      <p className="text-[28px] font-heading font-extrabold text-green tracking-[-0.04em]">{brands24h.length}</p>
                      <p className="text-[11px] text-muted2 mt-0.5">24/7 brands</p>
                    </div>
                    <div className="text-center border-x border-border">
                      <p className="text-[28px] font-heading font-extrabold text-text tracking-[-0.04em]">365</p>
                      <p className="text-[11px] text-muted2 mt-0.5">Days per year</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[28px] font-heading font-extrabold text-text tracking-[-0.04em]">24/7</p>
                      <p className="text-[11px] text-muted2 mt-0.5">Always live</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                    All 24-hour brands
                  </h2>
                  <span className="text-[12px] text-green font-semibold">{brands24h.length} total</span>
                </div>
                <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {brands24h.map(({ brand }) => (
                    <Link
                      key={brand.slug}
                      href={`/brand/${brand.slug}`}
                      className="brand-card-link brand-card-open brand-card-premium no-underline p-4 flex items-center gap-3"
                    >
                      <span className="text-xl">{brand.emoji || "🏪"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-text">{brand.name}</p>
                        <p className="text-[11px] text-muted2">{brand.category}</p>
                      </div>
                      <span className="brand-status-pill brand-status-pill-open">
                        <span className="status-led" />
                        24/7
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              {Object.entries(by24hCategory).length > 1 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">By category</h2>
                  </div>
                  <div className="panel-body flex flex-col gap-4">
                    {Object.entries(by24hCategory).map(([cat, entries]) => (
                      <div key={cat}>
                        <p className="text-[12px] font-semibold text-muted uppercase tracking-[0.08em] mb-2">{cat}</p>
                        <div className="flex flex-wrap gap-2">
                          {entries.map(({ brand }) => (
                            <Link
                              key={brand.slug}
                              href={`/brand/${brand.slug}`}
                              className="no-underline text-[12px] font-medium text-muted2 hover:text-text border border-border rounded-xl px-3 py-1.5 hover:border-border2 transition-colors flex items-center gap-1.5"
                            >
                              <span>{brand.emoji}</span>
                              {brand.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={100} />

              {lateNightBrands.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                      Also open very late (midnight+)
                    </h2>
                  </div>
                  <div className="panel-body grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {lateNightBrands.map(({ brand }) => (
                      <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="brand-card-link no-underline p-3 flex items-center gap-2"
                      >
                        <span>{brand.emoji}</span>
                        <p className="text-[13px] font-medium text-text truncate">{brand.name}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <h2 className="font-heading font-bold text-[18px] text-text tracking-[-0.02em] mb-5">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        q: "What stores are open 24 hours?",
                        a: `${brands24h.slice(0, 4).map((e) => e.brand.name).join(", ")} and more operate 24/7 at select locations. Always verify your specific location.`,
                      },
                      {
                        q: "Is Walmart open 24 hours?",
                        a: "Some Walmart Supercenters run 24/7 but most standard Walmarts close between 11PM and midnight. Use our brand page to check live status.",
                      },
                      {
                        q: "What pharmacies are open 24 hours?",
                        a: "Select CVS and Walgreens locations offer 24-hour pharmacy services. Availability varies by location — always check the specific store.",
                      },
                      {
                        q: "Are fast food restaurants open 24 hours?",
                        a: "Many McDonald's, Burger King, Taco Bell and Jack in the Box locations have 24-hour drive-throughs, especially on weekends.",
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
                  <h3 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Late night pages</h3>
                </div>
                <div className="panel-body flex flex-col gap-2">
                  {[
                    { href: "/open-late", label: "Stores Open Late" },
                    { href: "/open-late/fast-food", label: "Fast Food Open Late" },
                    { href: "/open-late/pharmacy", label: "Pharmacy Open Late" },
                    { href: "/open-late/grocery", label: "Grocery Open Late" },
                    { href: "/near-me", label: "Near Me Open Now" },
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

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Holiday hours</h3>
                </div>
                <div className="panel-body flex flex-col gap-2">
                  {[
                    { href: "/holiday/christmas", label: "Christmas Hours" },
                    { href: "/holiday/thanksgiving", label: "Thanksgiving Hours" },
                    { href: "/holiday/new-years", label: "New Year's Hours" },
                    { href: "/holiday/easter", label: "Easter Hours" },
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
