import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { brandsData } from "@/data/brands";
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

        <section className="page-pad relative overflow-hidden" style={{ paddingTop: 112, paddingBottom: 88 }}>
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

        <section className="page-pad" style={{ paddingBottom: 56 }}>
          <div className="flex items-baseline justify-between mb-7">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Top brands</h2>
            <Link href="/search" className="text-[13px] text-muted2 no-underline hover:text-text transition-colors">
              View all &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" style={{ gap: 18 }}>
            {featured.map(({ brand, hours }, i) => {
              const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
              const isOpen = status.isOpen;

              return (
                <Link
                  key={brand.slug}
                  href={`/is-${brand.slug}-open`}
                  className={`brand-card-link brand-card-premium no-underline ${isOpen ? "brand-card-open" : "brand-card-closed"}`}
                  style={{
                    padding: "26px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    textAlign: "center",
                    minHeight: 152,
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

        <section className="page-pad" style={{ paddingBottom: 38 }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP} label="Sponsored" minHeight={92} />
        </section>

        <section className="page-pad" style={{ paddingBottom: 72 }}>
          <div className="flex flex-col gap-12">
            {categories.map((cat) => {
              const catSlug = cat.toLowerCase().replace(/\s+/g, "-");
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.13em] text-muted">{cat}</h3>
                    <Link
                      href={`/category/${catSlug}`}
                      className="text-[12px] text-muted2 no-underline hover:text-text transition-colors"
                    >
                      View category &rarr;
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {brandsData
                      .filter((b) => b.brand.category === cat)
                      .map(({ brand }) => (
                        <Link
                          key={brand.slug}
                          href={`/is-${brand.slug}-open`}
                          className="no-underline text-[12px] font-medium text-muted2 border border-border rounded-xl px-4 py-2.5 hover:text-text hover:border-border2 transition-colors bg-bg1"
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

        <section className="page-pad" style={{ paddingBottom: 44 }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={120} />
        </section>

        <Footer />
      </div>
    </>
  );
}
