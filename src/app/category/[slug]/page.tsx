import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrendingSidebar from "@/components/TrendingSidebar";
import { brandsData } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";

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
  };
  return map[slug] || null;
}

function getAllCategorySlugs(): string[] {
  return [
    "fast-food",
    "retail",
    "coffee",
    "wholesale",
    "pharmacy",
    "home-improvement",
    "fast-casual",
    "pizza",
    "government",
    "financial",
  ];
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

  return (
    <>
      <Navbar />
      <div className="bg-bg pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0 items-start">
          <main className="min-w-0 lg:pr-10">
            <nav className="font-mono text-xs text-ink3 flex items-center gap-1.5 mb-5">
              <Link href="/" className="text-ink3 no-underline hover:text-ink">
                Home
              </Link>
              <span className="opacity-40">/</span>
              <span>{category}</span>
            </nav>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              {category} - What&apos;s Open Now?
            </h1>
            <p className="text-ink3 mb-8 max-w-lg">
              Real-time opening status for major {category.toLowerCase()} brands.
              Updated every 5 minutes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryBrands.map(({ brand, hours }) => {
                const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
                return (
                  <Link
                    key={brand.slug}
                    href={`/is-${brand.slug}-open`}
                    className={`rounded-xl p-5 border-2 no-underline transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      status.isOpen
                        ? "bg-green-bg border-green/30"
                        : "bg-red-bg border-red/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{brand.emoji || "Store"}</span>
                      <div className="flex-1">
                        <div className="text-lg font-bold text-ink">{brand.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            status.isOpen ? "bg-green animate-breathe" : "bg-red"
                          }`}
                        />
                        <span
                          className={`text-sm font-bold ${
                            status.isOpen ? "text-green" : "text-red"
                          }`}
                        >
                          {status.isOpen ? "OPEN" : "CLOSED"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-ink2">
                      {status.todayHours && (
                        <span>
                          <span className="font-mono text-ink3">Today:</span>{" "}
                          {status.todayHours}
                        </span>
                      )}
                      {status.isOpen && status.closesIn && (
                        <span>
                          <span className="font-mono text-ink3">Closes in:</span>{" "}
                          {status.closesIn}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {categoryBrands.length === 0 && (
              <p className="text-ink3 text-center py-12">
                No brands found in this category yet.
              </p>
            )}
          </main>

          <aside className="hidden lg:block sticky top-[84px]">
            <TrendingSidebar />
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
