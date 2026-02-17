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
        <div className="relative overflow-hidden px-6 sm:px-12 pt-[72px] pb-14">
          {/* Green gradient glow */}
          <div className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(0,232,122,0.06) 0%, transparent 70%)" }} />

          <div className="max-w-[700px] relative z-10">
            <div className="inline-flex items-center gap-2 bg-green-dim border border-green/20 rounded-full px-3.5 py-1 font-mono text-[12px] text-green tracking-[0.06em] uppercase font-semibold mb-7">
              <span className="w-[5px] h-[5px] rounded-full bg-green animate-pulse-dot" />
              Real-time status
            </div>
            <h1 className="font-heading font-extrabold tracking-[-0.04em] leading-[1] mb-5" style={{ fontSize: "clamp(42px, 6vw, 72px)" }}>
              Is it{" "}
              <span className="text-green">open</span>
              <br />
              right now?
            </h1>
            <p className="text-[17px] text-muted2 leading-relaxed max-w-[480px] mb-10">
              Instantly check if any store, restaurant, or service is open.
              Real-time status, weekly hours, holiday schedules.
            </p>
          </div>
        </div>

        {/* Brand grid by category */}
        <div className="px-6 sm:px-12 pb-16">
          {categories.map((cat, i) => {
            const catSlug = cat.toLowerCase().replace(/\s+/g, "-");
            return (
              <div key={cat}>
                {i > 0 && <div className="h-px bg-border mx-0 mb-12" />}
                <div className="mb-12">
                  <div className="flex items-baseline justify-between mb-5">
                    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                      {cat}
                    </span>
                    <Link
                      href={`/category/${catSlug}`}
                      className="text-[13px] text-muted2 no-underline flex items-center gap-1 hover:text-green transition-colors"
                    >
                      View all <span>&rarr;</span>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {brandsData
                      .filter((b) => b.brand.category === cat)
                      .map(({ brand, hours }) => {
                        const status = computeOpenStatus(
                          hours,
                          "America/New_York",
                          brand.is24h
                        );
                        const isOpen = status.isOpen;
                        return (
                          <Link
                            key={brand.slug}
                            href={`/is-${brand.slug}-open`}
                            className={`rounded-[14px] p-5 flex flex-col items-center gap-2.5 text-center no-underline transition-all cursor-pointer hover:-translate-y-0.5 border ${
                              isOpen
                                ? "border-green/20 hover:border-green/40"
                                : "border-border opacity-65 hover:opacity-100 hover:border-border2"
                            }`}
                            style={{
                              background: isOpen
                                ? "linear-gradient(135deg, var(--color-bg1) 0%, rgba(0,232,122,0.04) 100%)"
                                : "var(--color-bg1)",
                              boxShadow: "none",
                            }}
                          >
                            <span className="text-[28px] leading-none">{brand.emoji || "🏪"}</span>
                            <span className="font-heading font-bold text-[13px] tracking-[-0.01em] text-text">
                              {brand.name}
                            </span>
                            <div className="flex items-center gap-[5px] text-xs font-semibold">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isOpen ? "bg-green animate-pulse-dot" : "bg-red"
                                }`}
                                style={isOpen ? { boxShadow: "0 0 6px var(--color-green-glow)" } : {}}
                              />
                              <span className={isOpen ? "text-green" : "text-red"}>
                                {isOpen ? "Open" : "Closed"}
                              </span>
                            </div>
                            {isOpen && status.closesIn && (
                              <span className="text-[11px] font-mono text-muted">
                                closes in {status.closesIn}
                              </span>
                            )}
                            {!isOpen && status.opensAt && (
                              <span className="text-[11px] font-mono text-muted">
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
          <div className="h-px bg-border mb-12" />
          <div className="max-w-3xl">
            <h2 className="font-heading text-xl font-bold tracking-tight mb-4 text-text">
              Check store hours in real-time
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-muted2 leading-relaxed">
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

            <div className="mt-8">
              <h3 className="font-mono text-[11px] font-medium text-muted uppercase tracking-[0.12em] mb-3">Popular searches</h3>
              <div className="flex flex-wrap gap-2">
                {brandsData.slice(0, 12).map(({ brand }) => (
                  <Link
                    key={brand.slug}
                    href={`/is-${brand.slug}-open`}
                    className="text-xs font-mono bg-bg1 border border-border rounded-lg px-3 py-1.5 text-muted2 no-underline hover:border-border2 hover:text-text transition-colors"
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
