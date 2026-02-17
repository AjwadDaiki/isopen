import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import TrendingSidebar from "@/components/TrendingSidebar";
import { brandsData } from "@/data/brands";
import { getCitiesForCategory } from "@/data/cities";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { buildCategoryEditorial } from "@/lib/seo-editorial";
import { generateBreadcrumbJsonLd } from "@/lib/schema";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_BY_SLUG = new Map(
  brandsData
    .map((item) => item.brand.category)
    .filter((category): category is string => Boolean(category))
    .map((category) => [category.toLowerCase().replace(/\s+/g, "-"), category])
);

function getCategoryFromSlug(slug: string): string | null {
  return CATEGORY_BY_SLUG.get(slug) || null;
}

function getAllCategorySlugs(): string[] {
  return [...CATEGORY_BY_SLUG.keys()];
}

export async function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryFromSlug(slug);
  if (!category) return { title: "Not Found" };

  return {
    title: `${category} Open Now - Check Real-Time Hours`,
    description: `See which ${category.toLowerCase()} places are open right now. Real-time status for major ${category.toLowerCase()} brands.`,
    alternates: {
      canonical: `https://isopenow.com/category/${slug}`,
    },
    openGraph: {
      type: "website",
      url: `https://isopenow.com/category/${slug}`,
      title: `${category} Open Now`,
      description: `Real-time opening status for ${category.toLowerCase()} brands.`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryFromSlug(slug);
  if (!category) notFound();

  const categoryBrands = brandsData.filter((b) => b.brand.category === category);
  const categoryCities = getCitiesForCategory(category, 8);
  const editorial = buildCategoryEditorial(category, categoryBrands.map((entry) => entry.brand));
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: "https://isopenow.com/" },
    { name: category, item: `https://isopenow.com/category/${slug}` },
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
            <span className="text-text">{category}</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-text">
                    {category} - What&apos;s Open Now?
                  </h1>
                  <p className="text-muted2 mt-4 max-w-[64ch]">
                    Real-time opening status for major {category.toLowerCase()} brands. Updated frequently.
                  </p>
                </div>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categoryBrands.map(({ brand, hours }, i) => {
                  const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
                  const isOpen = status.isOpen;

                  return (
                    <Link
                      key={brand.slug}
                      href={`/is-${brand.slug}-open`}
                      className={`brand-card-link brand-card-premium p-6 no-underline ${isOpen ? "brand-card-open" : "brand-card-closed"}`}
                      style={{
                        animationDelay: `${Math.min(i * 0.035, 0.28)}s`,
                      }}
                    >
                      <div className="flex items-center gap-3.5 mb-3.5">
                        <span className="text-2xl">{brand.emoji || "Store"}</span>
                        <div className="flex-1">
                          <div className="text-lg font-heading font-bold text-text tracking-[-0.01em]">{brand.name}</div>
                        </div>
                        <span className={`brand-status-pill ${isOpen ? "brand-status-pill-open" : "brand-status-pill-closed"}`}>
                          <span className="status-led" />
                          {isOpen ? "OPEN" : "CLOSED"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted2">
                        {status.todayHours && (
                          <span>
                            <span className="font-mono text-muted">Today:</span> {status.todayHours}
                          </span>
                        )}
                        {isOpen && status.closesIn && (
                          <span>
                            <span className="font-mono text-muted">Closes in:</span> {status.closesIn}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {categoryBrands.length === 0 && (
                <p className="text-muted text-center py-12">No brands found in this category yet.</p>
              )}

              {categoryCities.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Top city pages for {category}</h2>
                  </div>
                  <div className="panel-body flex flex-wrap gap-3">
                    {categoryCities.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/city/${city.slug}`}
                        className="text-[12px] font-medium px-4 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                      >
                        {city.name}, {city.state}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">{editorial.kicker}</h2>
                </div>
                <div className="panel-body flex flex-col gap-5">
                  <p className="text-[14px] text-muted2 leading-relaxed">{editorial.intro}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {editorial.bullets.map((line) => (
                      <div key={line} className="rounded-xl border border-border ui-bg-2-55 px-4 py-3.5 text-[12px] text-muted2">
                        {line}
                      </div>
                    ))}
                  </div>

                  {editorial.sections.map((section) => (
                    <article key={section.title}>
                      <h3 className="font-heading font-bold text-[14px] text-text mb-2">{section.title}</h3>
                      <p className="text-[13px] text-muted2 leading-relaxed">{section.body}</p>
                    </article>
                  ))}
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={92} />
            </main>

            <aside className="sidebar-stack">
              <TrendingSidebar />
              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={220} />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

