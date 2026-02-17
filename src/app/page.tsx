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

        <section className="page-pad relative overflow-hidden" style={{ paddingTop: 52, paddingBottom: 28 }}>
          <div
            className="absolute pointer-events-none"
            style={{
              top: -180,
              right: -120,
              width: 580,
              height: 580,
              borderRadius: "999px",
              background: "radial-gradient(circle, rgba(68,209,141,0.18) 0%, rgba(68,209,141,0) 70%)",
            }}
          />

          <div className="relative z-[1] max-w-3xl">
            <h1
              className="font-heading font-extrabold text-text"
              style={{ fontSize: "clamp(36px, 5vw, 62px)", letterSpacing: "-0.04em", lineHeight: 0.96 }}
            >
              Find open places
              <br />
              in seconds
            </h1>
            <p className="text-muted2 mt-4" style={{ fontSize: 16, maxWidth: 540 }}>
              Pick a brand below and get live open or closed status right away.
            </p>
          </div>
        </section>

        <section className="page-pad" style={{ paddingBottom: 30 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-[22px] font-bold tracking-tight text-text">Top brands</h2>
            <Link href="/search" className="text-sm text-muted2 no-underline hover:text-text transition-colors">
              Browse all
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" style={{ gap: 12 }}>
            {featured.map(({ brand, hours }, i) => {
              const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
              const isOpen = status.isOpen;

              return (
                <Link
                  key={brand.slug}
                  href={`/is-${brand.slug}-open`}
                  className="brand-card-link brand-card-premium no-underline"
                  style={{
                    border: `1px solid ${isOpen ? "rgba(68,209,141,0.38)" : "var(--color-border)"}`,
                    padding: "16px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    minHeight: 120,
                    animationDelay: `${Math.min(i * 0.03, 0.3)}s`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 23, lineHeight: 1 }}>{brand.emoji || "Store"}</span>
                    <span className={`brand-status-pill ${isOpen ? "brand-status-pill-open" : "brand-status-pill-closed"}`}>
                      {isOpen ? "Open" : "Closed"}
                    </span>
                  </div>

                  <div className="font-heading text-[15px] font-bold text-text leading-tight tracking-[-0.01em]">{brand.name}</div>
                  <div className="text-[11px] text-muted2 uppercase tracking-[0.08em]">{brand.category}</div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="page-pad" style={{ paddingBottom: 26 }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP} label="Sponsored" minHeight={92} />
        </section>

        <section className="page-pad" style={{ paddingBottom: 50 }}>
          <div className="flex flex-col gap-8">
            {categories.map((cat) => {
              const catSlug = cat.toLowerCase().replace(/\s+/g, "-");
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{cat}</h3>
                    <Link
                      href={`/category/${catSlug}`}
                      className="text-[12px] text-muted2 no-underline hover:text-text transition-colors"
                    >
                      View category
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {brandsData
                      .filter((b) => b.brand.category === cat)
                      .map(({ brand }) => (
                        <Link
                          key={brand.slug}
                          href={`/is-${brand.slug}-open`}
                          className="no-underline text-[12px] text-muted2 border border-border rounded-md px-3 py-1.5 hover:text-text hover:border-border2 transition-colors"
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

        <section className="page-pad" style={{ paddingBottom: 32 }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={120} />
        </section>

        <Footer />
      </div>
    </>
  );
}
