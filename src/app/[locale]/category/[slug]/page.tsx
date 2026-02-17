import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrendingSidebar from "@/components/TrendingSidebar";
import { brandsData } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { t, LOCALES, type Locale } from "@/lib/i18n/translations";
import { buildBrandUrl } from "@/lib/i18n/url-patterns";
import { buildLocaleAlternates, absoluteUrl } from "@/lib/i18n/alternates";
import { generateBreadcrumbJsonLd } from "@/lib/schema";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
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
  return LOCALES.filter((l) => l !== "en").flatMap((locale) =>
    getAllCategorySlugs().map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const category = getCategoryFromSlug(slug);
  if (!category) return { title: "Not Found" };

  const alternates = buildLocaleAlternates(
    Object.fromEntries(
      LOCALES.map((l) => [l, l === "en" ? `/category/${slug}` : `/${l}/category/${slug}`])
    ) as Record<Locale, string>
  );

  return {
    title: t(loc, "categoryTitle", { category }),
    description: t(loc, "categoryDesc", { category: category.toLowerCase() }),
    alternates: {
      canonical: absoluteUrl(`/${loc}/category/${slug}`),
      languages: alternates,
    },
  };
}

export default async function LocaleCategoryPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const category = getCategoryFromSlug(slug);
  if (!category) notFound();

  const categoryBrands = brandsData.filter((b) => b.brand.category === category);
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: t(loc, "home"), item: absoluteUrl(`/${loc}`) },
    { name: category, item: absoluteUrl(`/${loc}/category/${slug}`) },
  ]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <div className="page-pad grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0 items-start" style={{ paddingTop: 32, paddingBottom: 64 }}>
          <main className="min-w-0 lg:pr-10">
            <nav className="font-mono text-xs text-muted flex items-center gap-1.5 mb-5">
              <Link href={`/${loc}`} className="text-muted2 no-underline hover:text-text">
                {t(loc, "home")}
              </Link>
              <span className="opacity-40">/</span>
              <span>{category}</span>
            </nav>

            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-text">
              {t(loc, "categoryTitle", { category })}
            </h1>
            <p className="text-muted2 mb-8 max-w-lg">
              {t(loc, "categoryDesc", { category: category.toLowerCase() })}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryBrands.map(({ brand, hours }) => {
                const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
                return (
                  <Link
                    key={brand.slug}
                    href={buildBrandUrl(loc, brand.slug)}
                    className={`rounded-xl p-5 border no-underline transition-all hover:-translate-y-0.5 hover:border-border2 ${
                      status.isOpen ? "bg-green-dim border-green/20" : "bg-red-dim border-red/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{brand.emoji || "Store"}</span>
                      <div className="flex-1">
                        <div className="text-lg font-heading font-bold text-text">{brand.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${status.isOpen ? "bg-green animate-pulse-dot" : "bg-red"}`} />
                        <span className={`text-sm font-bold ${status.isOpen ? "text-green" : "text-red"}`}>
                          {status.isOpen ? t(loc, "open") : t(loc, "closed")}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
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
