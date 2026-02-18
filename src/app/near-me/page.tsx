import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { brandsData } from "@/data/brands";
import { cityData } from "@/data/cities";
import { generateBreadcrumbJsonLd } from "@/lib/schema";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Open Now Near Me - Quick Local Search Pages",
  description:
    "Browse near-me landing pages by category and city to quickly find what is open right now.",
  alternates: {
    canonical: "https://isopenow.com/near-me",
  },
  openGraph: {
    type: "website",
    url: "https://isopenow.com/near-me",
    title: "Open Now Near Me",
    description: "Fast near-me pages for high-intent local open-now checks.",
  },
};

function uniqueCategorySlugs(): string[] {
  return [...new Set(
    brandsData
      .map((entry) => entry.brand.category)
      .filter((category): category is string => Boolean(category))
      .map((category) => category.toLowerCase().replace(/\s+/g, "-"))
  )];
}

export default function NearMeIndexPage() {
  const categories = uniqueCategorySlugs().slice(0, 15);
  const topCities = cityData.slice(0, 12);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: "https://isopenow.com/" },
    { name: "Near Me", item: "https://isopenow.com/near-me" },
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
            <span className="text-text">Near Me</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="mx-auto max-w-[980px] content-stack">
            <section className="ui-panel overflow-hidden">
              <div className="panel-body-lg">
                <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                  Open Now Near Me
                </h1>
                <p className="text-muted2 text-[15px] leading-relaxed mt-5 max-w-[68ch]">
                  Local-intent landing pages designed for searches like &quot;pharmacy near me open now&quot; and
                  &quot;coffee near me open now&quot;.
                </p>
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Near me by category</h2>
              </div>
              <div className="panel-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((categorySlug) => (
                  <Link
                    key={categorySlug}
                    href={`/near-me/${categorySlug}`}
                    className="brand-card-link brand-card-premium no-underline p-5"
                  >
                    <p className="text-[15px] font-heading font-bold text-text tracking-[-0.01em]">
                      {categorySlug.replace(/-/g, " ")}
                    </p>
                    <p className="text-[12px] text-muted2 mt-1.5">
                      Open now near me
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Popular city shortcuts</h2>
              </div>
              <div className="panel-body flex flex-wrap gap-3">
                {topCities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/city/${city.slug}`}
                    className="no-underline text-[12px] font-medium text-muted2 border border-border rounded-xl px-4 py-2.5 hover:text-text hover:border-border2 transition-colors bg-bg1"
                  >
                    {city.name}, {city.state}
                  </Link>
                ))}
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
