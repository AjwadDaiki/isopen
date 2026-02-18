import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { cityData } from "@/data/cities";
import { generateBreadcrumbJsonLd } from "@/lib/schema";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "City Pages - Open Now by Location",
  description:
    "Browse city pages to check what stores, restaurants, pharmacies, and services are open now in major US locations.",
  alternates: {
    canonical: "https://isopenow.com/city",
  },
  openGraph: {
    type: "website",
    url: "https://isopenow.com/city",
    title: "City Pages - Open Now by Location",
    description: "Location-focused pages for fast local open-now checks.",
  },
};

export default function CityIndexPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: "https://isopenow.com/" },
    { name: "Cities", item: "https://isopenow.com/city" },
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
            <span className="text-text">Cities</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="mx-auto max-w-[980px] content-stack">
            <section className="ui-panel overflow-hidden">
              <div className="panel-body-lg">
                <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                  Open Now by City
                </h1>
                <p className="text-muted2 text-[15px] leading-relaxed mt-5 max-w-[68ch]">
                  Location-focused pages for high-intent local checks. Pick a city to see live status across major brands.
                </p>
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Available city pages</h2>
                <span className="font-mono text-[10px] text-muted tracking-[0.08em]">{cityData.length} pages</span>
              </div>
              <div className="panel-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cityData.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/city/${city.slug}`}
                    className="brand-card-link brand-card-premium no-underline p-6"
                  >
                    <p className="text-[16px] font-heading font-bold text-text tracking-[-0.01em]">
                      {city.name}, {city.state}
                    </p>
                    <p className="text-[12px] text-muted2 mt-1.5">{city.timezone}</p>
                    <div className="mt-3.5 flex flex-wrap gap-2">
                      {city.focusCategories.slice(0, 3).map((category) => (
                        <span key={category} className="text-[10px] uppercase tracking-[0.08em] text-muted border border-border px-2.5 py-1 rounded-full">
                          {category}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Expand your search</h2>
              </div>
              <div className="panel-body flex flex-wrap gap-3">
                <Link
                  href="/state"
                  className="no-underline text-[12px] font-medium text-muted2 border border-border rounded-xl px-4 py-2.5 hover:text-text hover:border-border2 transition-colors bg-bg1"
                >
                  Browse by state
                </Link>
                <Link
                  href="/near-me"
                  className="no-underline text-[12px] font-medium text-muted2 border border-border rounded-xl px-4 py-2.5 hover:text-text hover:border-border2 transition-colors bg-bg1"
                >
                  Open now near me
                </Link>
              </div>
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={120} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
