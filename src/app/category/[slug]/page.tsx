import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import TrendingSidebar from "@/components/TrendingSidebar";
import { brandsData } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { generateBreadcrumbJsonLd } from "@/lib/schema";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getCategoryFromSlug(slug: string): string | null {
  const map: Record<string, string> = {
    "fast-food": "Fast Food",
    retail: "Retail",
    coffee: "Coffee",
    wholesale: "Wholesale",
    pharmacy: "Pharmacy",
    "home-improvement": "Home Improvement",
    "fast-casual": "Fast Casual",
    pizza: "Pizza",
    government: "Government",
    financial: "Financial",
    grocery: "Grocery",
    convenience: "Convenience",
    electronics: "Electronics",
    auto: "Auto",
    banking: "Banking",
    shipping: "Shipping",
    gym: "Gym",
  };
  return map[slug] || null;
}

function getAllCategorySlugs(): string[] {
  const cats = new Set(
    brandsData.map((b) => b.brand.category?.toLowerCase().replace(/\s+/g, "-") || "").filter(Boolean)
  );
  return [...cats];
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
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryFromSlug(slug);
  if (!category) notFound();

  const categoryBrands = brandsData.filter((b) => b.brand.category === category);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: "https://isopenow.com/" },
    { name: category, item: `https://isopenow.com/category/${slug}` },
  ]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <div className="page-pad grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start" style={{ paddingTop: 32, paddingBottom: 64 }}>
          <main className="min-w-0">
            <nav className="font-mono text-xs text-muted flex items-center gap-1.5 mb-5">
              <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
              <span className="text-muted">/</span>
              <span className="text-text">{category}</span>
            </nav>

            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-text">
              {category} - What&apos;s Open Now?
            </h1>
            <p className="text-muted2 mb-8 max-w-lg">
              Real-time opening status for major {category.toLowerCase()} brands. Updated frequently.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoryBrands.map(({ brand, hours }, i) => {
                const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
                const isOpen = status.isOpen;

                return (
                  <Link
                    key={brand.slug}
                    href={`/is-${brand.slug}-open`}
                    className={`brand-card-link brand-card-premium p-5 no-underline ${isOpen ? "brand-card-open" : "brand-card-closed"}`}
                    style={{
                      animationDelay: `${Math.min(i * 0.035, 0.28)}s`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
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

            <div className="mt-6">
              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={92} />
            </div>
          </main>

          <aside className="hidden lg:block sticky top-[72px]">
            <TrendingSidebar />
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}

