import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import TrendingSidebar from "@/components/TrendingSidebar";
import { brandsData } from "@/data/brands";
import { generateBreadcrumbJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ day: string }>;
}

const DAY_CONFIG: Record<string, { label: string; dayOfWeek: number | null; isHoliday: boolean; emoji: string }> = {
  sunday:    { label: "Sunday",        dayOfWeek: 0, isHoliday: false, emoji: "☀️" },
  monday:    { label: "Monday",        dayOfWeek: 1, isHoliday: false, emoji: "📅" },
  tuesday:   { label: "Tuesday",       dayOfWeek: 2, isHoliday: false, emoji: "📅" },
  wednesday: { label: "Wednesday",     dayOfWeek: 3, isHoliday: false, emoji: "📅" },
  thursday:  { label: "Thursday",      dayOfWeek: 4, isHoliday: false, emoji: "📅" },
  friday:    { label: "Friday",        dayOfWeek: 5, isHoliday: false, emoji: "🎉" },
  saturday:  { label: "Saturday",      dayOfWeek: 6, isHoliday: false, emoji: "🛍️" },
  christmas:     { label: "Christmas Day",   dayOfWeek: null, isHoliday: true, emoji: "🎄" },
  thanksgiving:  { label: "Thanksgiving",    dayOfWeek: null, isHoliday: true, emoji: "🦃" },
  "new-years":   { label: "New Year's Day",  dayOfWeek: null, isHoliday: true, emoji: "🎆" },
  easter:        { label: "Easter",          dayOfWeek: null, isHoliday: true, emoji: "🐣" },
};

export async function generateStaticParams() {
  return Object.keys(DAY_CONFIG).map((day) => ({ day }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { day } = await params;
  const config = DAY_CONFIG[day];
  if (!config) return { title: "Not Found" };

  const year = new Date().getFullYear();

  return {
    title: `Stores Open on ${config.label} ${year} → Hours & Live Status`,
    description: `Which stores are open on ${config.label}? Full ${year} hours for every major US brand — grocery, pharmacy, fast food, retail, and more.`,
    alternates: { canonical: absoluteUrl(`/open-on/${day}`) },
    openGraph: {
      type: "website",
      url: absoluteUrl(`/open-on/${day}`),
      title: `Stores Open on ${config.label} ${year}`,
      description: `Full ${config.label} hours for every major US brand.`,
    },
  };
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default async function OpenOnDayPage({ params }: PageProps) {
  const { day } = await params;
  const config = DAY_CONFIG[day];
  if (!config) notFound();

  const year = new Date().getFullYear();

  const brandResults = brandsData.map(({ brand, hours }) => {
    if (brand.is24h) {
      return { brand, isOpen: true, hoursStr: "Open 24 hours", hours };
    }
    if (config.isHoliday) {
      return { brand, isOpen: null, hoursStr: "Hours may vary", hours };
    }
    const dayHours = hours.find((h) => h.dayOfWeek === config.dayOfWeek);
    if (!dayHours || dayHours.isClosed) {
      return { brand, isOpen: false, hoursStr: "Closed", hours };
    }
    const hoursStr = dayHours.openTime && dayHours.closeTime
      ? `${formatTime(dayHours.openTime)} – ${formatTime(dayHours.closeTime)}`
      : "Open";
    return { brand, isOpen: true, hoursStr, hours };
  });

  const openBrands = brandResults.filter((b) => b.isOpen === true);
  const closedBrands = brandResults.filter((b) => b.isOpen === false);
  const unknownBrands = brandResults.filter((b) => b.isOpen === null);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: `Open on ${config.label}`, item: absoluteUrl(`/open-on/${day}`) },
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
            <span className="text-text">Open on {config.label}</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg flex flex-col gap-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                    {config.emoji} {config.isHoliday ? "Holiday hours" : "Weekly schedule"}
                  </p>
                  <h1 className="font-heading font-extrabold text-[30px] sm:text-[44px] tracking-[-0.03em] leading-[0.96] text-text">
                    Stores Open on<br />{config.label} {year}
                  </h1>
                  <p className="text-[15px] text-muted2 leading-relaxed max-w-[60ch]">
                    {config.isHoliday
                      ? `Holiday hours vary by location. Most brands reduce ${config.label} hours or close entirely — check your local store before visiting.`
                      : `Confirmed ${config.label} schedule for ${brandResults.length}+ major US brands. Hours shown are typical national hours — local branches may differ.`
                    }
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border ui-border-green-30 bg-green-dim px-4 py-2 text-[13px] text-green font-semibold">
                      <span className="w-2 h-2 rounded-full bg-green" />
                      {openBrands.length} brands open
                    </div>
                    {closedBrands.length > 0 && (
                      <div className="inline-flex items-center gap-2 rounded-full border ui-border-red-30 bg-red-dim px-4 py-2 text-[13px] text-red font-medium">
                        {closedBrands.length} brands closed
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={90} />

              {openBrands.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Open on {config.label}</h2>
                  </div>
                  <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {openBrands.map(({ brand, hoursStr }) => (
                      <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="brand-card-link brand-card-premium brand-card-open p-4 no-underline flex items-center gap-3"
                      >
                        <span className="text-2xl shrink-0">{brand.emoji || "🏪"}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-heading font-bold text-text truncate">{brand.name}</p>
                          <p className="text-[11px] text-muted2 mt-0.5">{hoursStr}</p>
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

              {unknownBrands.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Hours may vary on {config.label}</h2>
                  </div>
                  <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {unknownBrands.map(({ brand }) => (
                      <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="brand-card-link brand-card-premium p-4 no-underline flex items-center gap-3"
                      >
                        <span className="text-2xl shrink-0">{brand.emoji || "🏪"}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-heading font-bold text-text truncate">{brand.name}</p>
                          <p className="text-[11px] text-muted2 mt-0.5">Check local branch</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ui-border-orange-30 bg-orange-dim text-orange">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange" />
                          VARIES
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {closedBrands.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Closed on {config.label}</h2>
                  </div>
                  <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {closedBrands.map(({ brand }) => (
                      <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="brand-card-link brand-card-premium brand-card-closed p-4 no-underline flex items-center gap-3 opacity-70"
                      >
                        <span className="text-2xl shrink-0 grayscale">{brand.emoji || "🏪"}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-heading font-bold text-text truncate">{brand.name}</p>
                          <p className="text-[11px] text-muted2 mt-0.5">Closed {config.label}</p>
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
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Other day schedules</h2>
                </div>
                <div className="panel-body flex flex-wrap gap-2">
                  {Object.entries(DAY_CONFIG).filter(([d]) => d !== day).map(([d, cfg]) => (
                    <Link
                      key={d}
                      href={`/open-on/${d}`}
                      className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                    >
                      {cfg.emoji} {cfg.label}
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
