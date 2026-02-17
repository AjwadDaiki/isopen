import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { brandsData } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "IsItOpen — Check if any store is open right now",
  description:
    "Instantly check if any store, restaurant, or service is open right now. Real-time status, weekly hours, holiday schedules for McDonald's, Walmart, Starbucks, and more.",
  alternates: {
    canonical: "https://isopenow.com",
  },
};

export default function Home() {
  const categories = [
    ...new Set(brandsData.map((b) => b.brand.category).filter(Boolean)),
  ] as string[];

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        {/* Hero */}
        <div className="relative overflow-hidden page-pad" style={{ paddingTop: 72, paddingBottom: 56 }}>
          {/* Green gradient glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: -80,
              left: "50%",
              transform: "translateX(-50%)",
              width: 800,
              height: 400,
              background: "radial-gradient(ellipse, rgba(0,232,122,0.08) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10" style={{ maxWidth: 700 }}>
            <div
              className="inline-flex items-center font-mono font-semibold uppercase text-green"
              style={{
                gap: 8,
                background: "var(--color-green-dim)",
                border: "1px solid rgba(0,232,122,0.2)",
                borderRadius: 100,
                padding: "5px 14px",
                fontSize: 12,
                letterSpacing: "0.06em",
                marginBottom: 28,
              }}
            >
              <span
                className="rounded-full bg-green animate-pulse-dot"
                style={{ width: 5, height: 5 }}
              />
              Real-time status
            </div>
            <h1
              className="font-heading font-extrabold text-text"
              style={{
                fontSize: "clamp(42px, 6vw, 72px)",
                letterSpacing: "-0.04em",
                lineHeight: 1.0,
                marginBottom: 20,
              }}
            >
              Is it <span className="text-green">open</span>
              <br />
              right now?
            </h1>
            <p className="text-muted2" style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 480, marginBottom: 40 }}>
              Instantly check if any store, restaurant, or service is open.
              Real-time status, weekly hours, holiday schedules.
            </p>
          </div>
        </div>

        {/* Brand grid by category */}
        <div className="page-pad" style={{ paddingBottom: 48 }}>
          {categories.map((cat, i) => {
            const catSlug = cat.toLowerCase().replace(/\s+/g, "-");
            return (
              <div key={cat}>
                {i > 0 && (
                  <div style={{ height: 1, background: "var(--color-border)", marginBottom: 48 }} />
                )}
                <div style={{ marginBottom: 48 }}>
                  <div className="flex items-baseline justify-between" style={{ marginBottom: 20 }}>
                    <span
                      className="font-mono font-medium uppercase text-muted"
                      style={{ fontSize: 11, letterSpacing: "0.12em" }}
                    >
                      {cat}
                    </span>
                    <Link
                      href={`/category/${catSlug}`}
                      className="text-muted2 no-underline flex items-center hover:text-green transition-colors"
                      style={{ fontSize: 13, gap: 4 }}
                    >
                      View all <span>&rarr;</span>
                    </Link>
                  </div>
                  <div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                    style={{ gap: 12 }}
                  >
                    {brandsData
                      .filter((b) => b.brand.category === cat)
                      .map(({ brand, hours }) => {
                        const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
                        const isOpen = status.isOpen;
                        return (
                          <Link
                            key={brand.slug}
                            href={`/is-${brand.slug}-open`}
                            className="brand-card-link no-underline"
                            style={{
                              background: isOpen
                                ? "linear-gradient(135deg, var(--color-bg1) 0%, rgba(0,232,122,0.04) 100%)"
                                : "var(--color-bg1)",
                              border: `1px solid ${isOpen ? "rgba(0,232,122,0.2)" : "var(--color-border)"}`,
                              borderRadius: 14,
                              padding: "20px 16px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 10,
                              textAlign: "center",
                              cursor: "pointer",
                              position: "relative",
                              overflow: "hidden",
                              opacity: isOpen ? 1 : 0.65,
                            }}
                          >
                            <span style={{ fontSize: 28, lineHeight: 1 }}>{brand.emoji || "🏪"}</span>
                            <span
                              className="font-heading font-bold text-text"
                              style={{ fontSize: 13, letterSpacing: "-0.01em" }}
                            >
                              {brand.name}
                            </span>
                            <div className="flex items-center font-semibold" style={{ gap: 5, fontSize: 12 }}>
                              <span
                                className={`rounded-full shrink-0 ${isOpen ? "bg-green animate-pulse-dot" : "bg-red"}`}
                                style={{
                                  width: 6,
                                  height: 6,
                                  ...(isOpen ? { boxShadow: "0 0 6px var(--color-green-glow)" } : {}),
                                }}
                              />
                              <span className={isOpen ? "text-green" : "text-red"}>
                                {isOpen ? "Open" : "Closed"}
                              </span>
                            </div>
                            {isOpen && status.closesIn && (
                              <span className="font-mono text-muted" style={{ fontSize: 11 }}>
                                closes in {status.closesIn}
                              </span>
                            )}
                            {!isOpen && status.opensAt && (
                              <span className="font-mono text-muted" style={{ fontSize: 11 }}>
                                opens at {status.opensAt}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* SEO text block */}
          <div style={{ height: 1, background: "var(--color-border)", marginBottom: 48 }} />
          <div style={{ maxWidth: 720 }}>
            <h2
              className="font-heading font-bold text-text"
              style={{ fontSize: 20, letterSpacing: "-0.02em", marginBottom: 16 }}
            >
              Check store hours in real-time
            </h2>
            <div
              className="text-muted2 grid grid-cols-1 sm:grid-cols-2"
              style={{ gap: 24, fontSize: 14, lineHeight: 1.7 }}
            >
              <p>
                IsItOpen helps you instantly find out if a store, restaurant, or service
                is open right now. We track opening hours for major brands like
                McDonald&apos;s, Walmart, Starbucks, Costco, Target, and more — updated
                in real-time based on your timezone.
              </p>
              <p>
                Each store page shows today&apos;s hours, a countdown to closing time,
                holiday schedules, and community reports. Whether you&apos;re checking
                if the post office is open on Saturday or if Chick-fil-A is open on
                Sunday — we&apos;ve got you covered.
              </p>
            </div>

            <div style={{ marginTop: 32 }}>
              <h3
                className="font-mono font-medium text-muted uppercase"
                style={{ fontSize: 11, letterSpacing: "0.12em", marginBottom: 12 }}
              >
                Popular searches
              </h3>
              <div className="flex flex-wrap" style={{ gap: 8 }}>
                {brandsData.slice(0, 12).map(({ brand }) => (
                  <Link
                    key={brand.slug}
                    href={`/is-${brand.slug}-open`}
                    className="font-mono text-muted2 no-underline hover:text-text hover:border-border2 transition-colors"
                    style={{
                      fontSize: 12,
                      background: "var(--color-bg1)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      padding: "6px 12px",
                    }}
                  >
                    Is {brand.name} open?
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
