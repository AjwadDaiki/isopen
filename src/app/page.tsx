import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { brandsData } from "@/data/brands";
import { cityData } from "@/data/cities";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { generateWebsiteJsonLd, generateOrganizationJsonLd } from "@/lib/schema";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "IsItOpen - Check if any store is open right now",
  description:
    "Check instantly if major stores and restaurants are open now. Live status and today's opening hours.",
  alternates: {
    canonical: "https://isopenow.com",
  },
};

export default function Home() {
  const websiteJsonLd = generateWebsiteJsonLd();
  const orgJsonLd = generateOrganizationJsonLd();

  const categories = [...new Set(brandsData.map((b) => b.brand.category).filter(Boolean))] as string[];
  const featured = brandsData.slice(0, 15);
  const featuredCities = cityData.slice(0, 8);

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

        <section className="page-pad relative overflow-hidden" style={{ paddingTop: 120, paddingBottom: 100 }}>
          <div
            className="absolute pointer-events-none"
            style={{
              top: -170,
              left: "50%",
              transform: "translateX(-50%)",
              width: 860,
              height: 430,
              background: "radial-gradient(ellipse, rgba(24,242,142,0.075) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-[1] max-w-4xl">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
              style={{
                background: "var(--color-green-dim)",
                border: "1px solid rgba(24,242,142,0.2)",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--color-green)",
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
              }}
            >
              <span className="rounded-full bg-green animate-pulse-dot" style={{ width: 6, height: 6 }} />
              Real-time status
            </div>

            <h1
              className="font-heading font-extrabold text-text"
              style={{
                fontSize: "clamp(54px, 8vw, 104px)",
                letterSpacing: "-0.055em",
                lineHeight: 0.9,
              }}
            >
              Is it <span style={{ color: "var(--color-green)" }}>open</span>
              <br />
              right now?
            </h1>

            <p className="text-muted2 mt-6" style={{ fontSize: 18, maxWidth: 580, lineHeight: 1.7 }}>
              Instantly check if any store, restaurant, or service is open. Real-time status, weekly hours,
              and holiday schedules.
            </p>
          </div>
        </section>

        <section className="page-pad" style={{ paddingBottom: 64 }}>
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Top brands</h2>
            <Link href="/search" className="text-[13px] text-muted2 no-underline hover:text-text transition-colors">
              View all &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {featured.map(({ brand, hours }, i) => {
              const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
              const isOpen = status.isOpen;

              return (
                <Link
                  key={brand.slug}
                  href={`/is-${brand.slug}-open`}
                  className={`brand-card-link brand-card-premium no-underline ${isOpen ? "brand-card-open" : "brand-card-closed"}`}
                  style={{
                    padding: "28px 22px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                    textAlign: "center",
                    minHeight: 160,
                    animationDelay: `${Math.min(i * 0.045, 0.42)}s`,
                  }}
                >
                  <span style={{ fontSize: 30, lineHeight: 1 }}>{brand.emoji || "Store"}</span>

                  <span className="font-heading text-[14px] font-extrabold text-text tracking-[-0.02em]">
                    {brand.name}
                  </span>

                  <span className={`brand-status-pill ${isOpen ? "brand-status-pill-open" : "brand-status-pill-closed"}`}>
                    <span className="status-led" />
                    {isOpen ? "Open" : "Closed"}
                  </span>

                  <span className="font-mono text-[11px] text-muted">
                    {isOpen && status.closesIn ? `closes in ${status.closesIn}` : ""}
                    {!isOpen && status.opensAt ? `opens ${status.opensAt}` : ""}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="page-pad" style={{ paddingBottom: 64 }}>
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Open now by city</h2>
            <Link href="/city" className="text-[13px] text-muted2 no-underline hover:text-text transition-colors">
              Browse cities &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredCities.map((city) => (
              <Link
                key={city.slug}
                href={`/city/${city.slug}`}
                className="brand-card-link brand-card-premium no-underline p-6"
              >
                <p className="text-[15px] font-heading font-bold text-text tracking-[-0.01em]">
                  {city.name}, {city.state}
                </p>
                <p className="text-[11px] text-muted2 mt-1">{city.timezone}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {city.focusCategories.slice(0, 2).map((cat) => (
                    <span key={cat} className="text-[10px] uppercase tracking-[0.08em] text-muted border border-border rounded-full px-2 py-[3px]">
                      {cat}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="page-pad" style={{ paddingBottom: 64 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/state" className="brand-card-link brand-card-premium no-underline p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">New layer</p>
              <h2 className="font-heading font-bold text-[20px] text-text tracking-[-0.02em] mt-2">
                Open now by state
              </h2>
              <p className="text-[13px] text-muted2 mt-2">
                Compare city coverage and top open-now brands across major US states.
              </p>
            </Link>

            <Link href="/near-me" className="brand-card-link brand-card-premium no-underline p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">High intent</p>
              <h2 className="font-heading font-bold text-[20px] text-text tracking-[-0.02em] mt-2">
                Open now near me
              </h2>
              <p className="text-[13px] text-muted2 mt-2">
                Fast local-intent pages for queries like pharmacy, coffee, and grocery near me.
              </p>
            </Link>
          </div>
        </section>

        <section className="page-pad" style={{ paddingBottom: 48 }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP} label="Sponsored" minHeight={92} />
        </section>

        <section className="page-pad" style={{ paddingBottom: 80 }}>
          <div className="flex flex-col gap-14">
            {categories.map((cat) => {
              const catSlug = cat.toLowerCase().replace(/\s+/g, "-");
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.13em] text-muted">{cat}</h3>
                    <Link
                      href={`/category/${catSlug}`}
                      className="text-[12px] text-muted2 no-underline hover:text-text transition-colors"
                    >
                      View category &rarr;
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-3.5">
                    {brandsData
                      .filter((b) => b.brand.category === cat)
                      .map(({ brand }) => (
                        <Link
                          key={brand.slug}
                          href={`/is-${brand.slug}-open`}
                          className="no-underline text-[12px] font-medium text-muted2 border border-border rounded-xl px-5 py-3 hover:text-text hover:border-border2 transition-colors bg-bg1"
                        >
                          {brand.name}
                        </Link>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="page-pad" style={{ paddingBottom: 52 }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={120} />
        </section>

        <Footer />
      </div>
    </>
  );
}
