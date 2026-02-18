import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { brandsData } from "@/data/brands";
import { getCitiesForCategory } from "@/data/cities";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { generateBreadcrumbJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_BY_SLUG = new Map(
  brandsData
    .map((entry) => entry.brand.category)
    .filter((category): category is string => Boolean(category))
    .map((category) => [category.toLowerCase().replace(/\s+/g, "-"), category])
);

function getCategoryFromSlug(slug: string): string | null {
  return CATEGORY_BY_SLUG.get(slug) || null;
}

export async function generateStaticParams() {
  return [...CATEGORY_BY_SLUG.keys()].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryFromSlug(slug);
  if (!category) return { title: "Not Found" };

  const canonicalPath = `/near-me/${slug}`;

  return {
    title: `${category} Near Me Open Now`,
    description: `Find ${category.toLowerCase()} places open near you right now with live status and fast city shortcuts.`,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(canonicalPath),
      title: `${category} Near Me Open Now`,
      description: `Live open-now checks for ${category.toLowerCase()} near you.`,
    },
  };
}

export default async function NearMeCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryFromSlug(slug);
  if (!category) notFound();

  const categoryBrands = brandsData.filter((entry) => entry.brand.category === category).slice(0, 24);
  const categoryCities = getCitiesForCategory(category, 16);
  const openCount = categoryBrands.reduce((acc, entry) => {
    const status = computeOpenStatus(entry.hours, "America/New_York", entry.brand.is24h);
    return acc + (status.isOpen ? 1 : 0);
  }, 0);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Near Me", item: absoluteUrl("/near-me") },
    { name: category, item: absoluteUrl(`/near-me/${slug}`) },
  ]);
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category} near me`,
    itemListElement: categoryBrands.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.brand.name,
      url: absoluteUrl(`/is-${entry.brand.slug}-open`),
    })),
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />

        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <Link href="/near-me" className="text-muted2 no-underline hover:text-text transition-colors">Near Me</Link>
            <span>/</span>
            <span className="text-text">{category}</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                    {category} Near Me - Open Now
                  </h1>
                  <p className="text-muted2 text-[15px] leading-relaxed mt-5 max-w-[68ch]">
                    Fast local-intent page for users searching &quot;{category.toLowerCase()} near me open now&quot;.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 border ui-border-green-30 bg-green-dim text-[12px] text-green font-semibold">
                    <span className="w-[7px] h-[7px] rounded-full bg-green animate-pulse-dot" />
                    {openCount} / {categoryBrands.length} featured brands open right now
                  </div>
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Top {category} brands</h2>
                </div>
                <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categoryBrands.map(({ brand, hours }) => {
                    const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
                    return (
                      <Link
                        key={brand.slug}
                        href={`/is-${brand.slug}-open`}
                        className={`brand-card-link brand-card-premium p-5 no-underline ${status.isOpen ? "brand-card-open" : "brand-card-closed"}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{brand.emoji || "Store"}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-heading font-bold text-text truncate">{brand.name}</p>
                            <p className="text-[11px] text-muted2 mt-0.5">{status.todayHours || "Closed today"}</p>
                          </div>
                          <span className={`brand-status-pill ${status.isOpen ? "brand-status-pill-open" : "brand-status-pill-closed"}`}>
                            <span className="status-led" />
                            {status.isOpen ? "Open" : "Closed"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={100} />
            </main>

            <aside className="sidebar-stack">
              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">{category} city shortcuts</h3>
                </div>
                <div className="panel-body flex flex-col gap-3">
                  {categoryCities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/city/${city.slug}`}
                      className="no-underline rounded-xl border border-border ui-bg-2-55 hover:bg-bg2 hover:border-border2 transition-colors px-5 py-4"
                    >
                      <p className="text-[14px] font-semibold text-text leading-tight">{city.name}, {city.state}</p>
                      <p className="text-[12px] text-muted2 mt-1">Check {category.toLowerCase()} open now</p>
                    </Link>
                  ))}
                </div>
              </section>
              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={220} />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
