import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { brandsData } from "@/data/brands";
import { cityData } from "@/data/cities";
import { generateBreadcrumbJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ category: string }>;
}

const CATEGORY_BY_SLUG = new Map(
  brandsData
    .map((e) => e.brand.category)
    .filter((c): c is string => Boolean(c))
    .map((c) => [c.toLowerCase().replace(/\s+/g, "-"), c])
);

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isOpenLate(closeTime: string | null, spansMidnight: boolean): boolean {
  if (!closeTime) return false;
  if (spansMidnight) return true;
  return timeToMinutes(closeTime) >= 22 * 60;
}

function formatCloseTime(closeTime: string | null, spansMidnight: boolean): string {
  if (!closeTime) return "—";
  if (spansMidnight) return "After midnight";
  const mins = timeToMinutes(closeTime);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${dh}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export async function generateStaticParams() {
  return [...CATEGORY_BY_SLUG.keys()].map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORY_BY_SLUG.get(category);
  if (!cat) return { title: "Not Found" };

  return {
    title: `${cat} Open Late Right Now → After 10PM Hours Tonight`,
    description: `Which ${cat.toLowerCase()} places are still open? Live closing times for every major ${cat.toLowerCase()} brand open after 10PM tonight — updated in real time.`,
    alternates: { canonical: absoluteUrl(`/open-late/${category}`) },
    openGraph: {
      type: "website",
      url: absoluteUrl(`/open-late/${category}`),
      title: `${cat} Open Late Near Me`,
      description: `${cat} open after 10PM near you. Live status updated every 45 seconds.`,
    },
  };
}

export default async function OpenLateCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const cat = CATEGORY_BY_SLUG.get(category);
  if (!cat) notFound();

  const catBrands = brandsData.filter((e) => e.brand.category === cat);
  const lateBrands = catBrands.filter((e) => {
    if (e.brand.is24h) return true;
    const mon = e.hours[1];
    return mon && isOpenLate(mon.closeTime, mon.spansMidnight);
  });

  const relatedCities = cityData
    .filter((c) => c.focusCategories.some((fc) => fc.toLowerCase() === cat.toLowerCase()))
    .slice(0, 10);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Open Late", item: absoluteUrl("/open-late") },
    { name: cat, item: absoluteUrl(`/open-late/${category}`) },
  ]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What ${cat.toLowerCase()} places are open late?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: lateBrands.slice(0, 3).map((e) => e.brand.name).join(", ") + " and more are open late.",
        },
      },
      {
        "@type": "Question",
        name: `Is there any ${cat.toLowerCase()} open after 10PM?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: lateBrands.length > 0
            ? `Yes, ${lateBrands.length} ${cat.toLowerCase()} brands are open past 10PM including ${lateBrands.slice(0, 2).map((e) => e.brand.name).join(" and ")}.`
            : `Most ${cat.toLowerCase()} locations close before 10PM. Check individual brand pages for exact hours.`,
        },
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <Link href="/open-late" className="text-muted2 no-underline hover:text-text transition-colors">Open Late</Link>
            <span>/</span>
            <span className="text-text">{cat}</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-[11px] font-semibold mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    {lateBrands.length} brands open late
                  </div>
                  <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                    {cat} Open Late Near Me
                  </h1>
                  <p className="text-muted2 text-[15px] leading-relaxed mt-5 max-w-[68ch]">
                    All {cat.toLowerCase()} brands open after 10PM tonight. Click any brand for live real-time status.
                  </p>
                </div>
              </section>

              {lateBrands.length > 0 ? (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                      {cat} open after 10PM
                    </h2>
                    <span className="text-[12px] text-muted2">{lateBrands.length} results</span>
                  </div>
                  <div className="panel-body flex flex-col gap-3">
                    {lateBrands.map(({ brand, hours }) => {
                      const mon = hours[1];
                      const closeDisplay = brand.is24h
                        ? "24/7"
                        : mon
                          ? formatCloseTime(mon.closeTime, mon.spansMidnight)
                          : "—";
                      const fri = hours[5];
                      const friClose = fri ? formatCloseTime(fri.closeTime, fri.spansMidnight) : null;

                      return (
                        <Link
                          key={brand.slug}
                          href={`/brand/${brand.slug}`}
                          className="brand-card-link brand-card-premium no-underline p-4 flex items-center gap-4"
                        >
                          <span className="text-2xl">{brand.emoji || "🏪"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-semibold text-text">{brand.name}</p>
                            <p className="text-[12px] text-muted2 mt-0.5">
                              Mon–Thu closes: <span className="text-text font-medium">{closeDisplay}</span>
                              {friClose && friClose !== closeDisplay && (
                                <> &middot; Fri: <span className="text-text font-medium">{friClose}</span></>
                              )}
                            </p>
                          </div>
                          <div className="shrink-0">
                            <span className={`brand-status-pill ${brand.is24h ? "brand-status-pill-open" : "text-orange-400 border border-orange-500/30 bg-orange-500/10 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"}`}>
                              {brand.is24h ? (
                                <>
                                  <span className="status-led" />
                                  24/7
                                </>
                              ) : "Late"}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <section className="ui-panel overflow-hidden">
                  <div className="panel-body-lg text-center">
                    <p className="text-muted2 text-[15px]">
                      Most {cat.toLowerCase()} brands close before 10PM. Browse all {cat.toLowerCase()} below.
                    </p>
                  </div>
                </section>
              )}

              {catBrands.filter((e) => !lateBrands.includes(e)).length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                      All {cat} brands
                    </h2>
                  </div>
                  <div className="panel-body grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {catBrands.map(({ brand }) => (
                      <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="brand-card-link no-underline p-3 flex items-center gap-2"
                      >
                        <span className="text-lg">{brand.emoji}</span>
                        <p className="text-[13px] font-medium text-text truncate">{brand.name}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={100} />

              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <h2 className="font-heading font-bold text-[18px] text-text tracking-[-0.02em] mb-4">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-4">
                    <div className="border-b border-border pb-4">
                      <p className="text-[14px] font-semibold text-text">What {cat.toLowerCase()} places are open late?</p>
                      <p className="text-[13px] text-muted2 mt-1.5 leading-relaxed">
                        {lateBrands.length > 0
                          ? `${lateBrands.slice(0, 3).map((e) => e.brand.name).join(", ")} and others stay open past 10PM. Hours vary by location.`
                          : `Most ${cat.toLowerCase()} locations have standard hours closing before 10PM. Check individual brand pages for exact local hours.`
                        }
                      </p>
                    </div>
                    <div className="border-b border-border pb-4">
                      <p className="text-[14px] font-semibold text-text">Are {cat.toLowerCase()} stores open on weekends?</p>
                      <p className="text-[13px] text-muted2 mt-1.5 leading-relaxed">
                        Most {cat.toLowerCase()} brands are open on weekends, often with extended Friday and Saturday hours. Sunday hours tend to be shorter.
                      </p>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-text">How do I check if a {cat.toLowerCase()} is open right now?</p>
                      <p className="text-[13px] text-muted2 mt-1.5 leading-relaxed">
                        Click any brand above for live real-time status. We check every 45 seconds and factor in your timezone.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </main>

            <aside className="sidebar-stack">
              {relatedCities.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h3 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                      {cat} by city
                    </h3>
                  </div>
                  <div className="panel-body flex flex-col gap-2">
                    {relatedCities.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/city/${city.slug}/category/${category}`}
                        className="no-underline text-[13px] text-muted2 hover:text-text transition-colors px-4 py-2.5 rounded-xl border border-border hover:border-border2"
                      >
                        {cat} in {city.name} →
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">More late-night</h3>
                </div>
                <div className="panel-body flex flex-col gap-2">
                  {[
                    { href: "/open-late/fast-food", label: "Fast Food Open Late" },
                    { href: "/open-late/pharmacy", label: "Pharmacy Open Late" },
                    { href: "/open-24h", label: "24 Hour Stores" },
                    { href: "/near-me/fast-food", label: "Fast Food Near Me" },
                  ].filter((l) => !l.href.includes(category)).map((link) => (
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
