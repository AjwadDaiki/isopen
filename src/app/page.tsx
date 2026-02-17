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
      <div className="bg-bg min-h-screen">
        {/* Hero */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-bg border border-green/20 rounded-full px-3 py-1 font-mono text-[11px] text-green tracking-wide mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-breathe" />
              REAL-TIME STATUS
            </div>
            <h1 className="text-4xl sm:text-[64px] font-black tracking-[-0.04em] leading-[1] mb-6">
              Is it{" "}
              <span className="text-green">open</span>{" "}
              right now?
            </h1>
            <p className="text-lg text-ink3 leading-relaxed max-w-lg">
              Instantly check if any store, restaurant, or service is open.
              Real-time status, weekly hours, holiday schedules.
            </p>
          </div>
        </div>

        {/* Brand grid by category */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16">
          {categories.map((cat) => {
            const catSlug = cat.toLowerCase().replace(/\s+/g, "-");
            return (
              <div key={cat} className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-ink3">
                    {cat}
                  </h2>
                  <Link
                    href={`/category/${catSlug}`}
                    className="font-mono text-[11px] text-green no-underline hover:underline"
                  >
                    View all &rarr;
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
                      return (
                        <Link
                          key={brand.slug}
                          href={`/is-${brand.slug}-open`}
                          className="bg-white border border-ink/10 rounded-xl p-4 hover:shadow-[0_8px_40px_rgba(26,22,18,0.12)] hover:-translate-y-0.5 transition-all no-underline flex flex-col items-center gap-2.5"
                        >
                          <span className="text-2xl">{brand.emoji || "🏪"}</span>
                          <span className="text-sm font-bold text-ink text-center leading-tight">
                            {brand.name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                status.isOpen ? "bg-green animate-breathe" : "bg-red"
                              }`}
                            />
                            <span
                              className={`text-xs font-semibold ${
                                status.isOpen ? "text-green" : "text-red"
                              }`}
                            >
                              {status.isOpen ? "Open" : "Closed"}
                            </span>
                          </div>
                          {status.isOpen && status.closesIn && (
                            <span className="text-[10px] font-mono text-ink3">
                              closes in {status.closesIn}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                </div>
              </div>
            );
          })}

          {/* SEO text block */}
          <div className="mt-8 border-t border-ink/10 pt-10">
            <h2 className="text-xl font-bold tracking-tight mb-4">
              Check store hours in real-time
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-ink2 leading-relaxed">
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

            {/* Internal links for SEO */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-ink3 mb-3">Popular searches</h3>
              <div className="flex flex-wrap gap-2">
                {brandsData.slice(0, 12).map(({ brand }) => (
                  <Link
                    key={brand.slug}
                    href={`/is-${brand.slug}-open`}
                    className="text-xs font-mono bg-white border border-ink/10 rounded-lg px-3 py-1.5 text-ink2 no-underline hover:bg-bg2 hover:text-ink transition-colors"
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
