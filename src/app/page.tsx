import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { brandsData } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";

export const revalidate = 300;

export default function Home() {
  const categories = [
    ...new Set(brandsData.map((b) => b.brand.category).filter(Boolean)),
  ] as string[];

  return (
    <>
      <Navbar />
      <div className="bg-bg min-h-screen">
        {/* Hero */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-bg border border-green/20 rounded-full px-3 py-1 font-mono text-[11px] text-green tracking-wide mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-breathe" />
              REAL-TIME STATUS
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-[1] mb-6">
              Is it{" "}
              <span className="text-green">open</span>{" "}
              right now?
            </h1>
            <p className="text-lg text-ink3 leading-relaxed mb-10 max-w-lg">
              Instantly check if any store, restaurant, or service is open.
              Real-time status, weekly hours, holiday schedules.
            </p>
          </div>

          {/* Brand grid by category */}
          {categories.map((cat) => (
            <div key={cat} className="mb-10">
              <h2 className="font-mono text-xs uppercase tracking-widest text-ink3 mb-4">
                {cat}
              </h2>
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
                        className="bg-white border border-ink/10 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all no-underline flex flex-col items-center gap-2"
                      >
                        <span className="text-2xl">{brand.emoji || "🏪"}</span>
                        <span className="text-sm font-bold text-ink text-center">
                          {brand.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              status.isOpen ? "bg-green" : "bg-red"
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
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <Footer />
      </div>
    </>
  );
}
