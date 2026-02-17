import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
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
    openGraph: {
      type: "website",
      url: absoluteUrl(`/${loc}/category/${slug}`),
      title: t(loc, "categoryTitle", { category }),
      description: t(loc, "categoryDesc", { category: category.toLowerCase() }),
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

        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href={`/${loc}`} className="text-muted2 no-underline hover:text-text transition-colors">
              {t(loc, "home")}
            </Link>
            <span>/</span>
            <span className="text-text">{category}</span>
          </nav>
        </div>

        <div className="page-pad pt-3 pb-14">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-text">
                    {t(loc, "categoryTitle", { category })}
                  </h1>
                  <p className="text-muted2 mt-3 max-w-[64ch]">{t(loc, "categoryDesc", { category: category.toLowerCase() })}</p>
                </div>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {categoryBrands.map(({ brand, hours }, i) => {
                  const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
                  const isOpen = status.isOpen;
                  return (
                    <Link
                      key={brand.slug}
                      href={buildBrandUrl(loc, brand.slug)}
                      className={`brand-card-link brand-card-premium p-5 no-underline ${isOpen ? "brand-card-open" : "brand-card-closed"}`}
                      style={{
                        animationDelay: `${Math.min(i * 0.035, 0.28)}s`,
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="text-2xl">{brand.emoji || "Store"}</span>
                        <div className="flex-1">
                          <div className="text-lg font-heading font-bold text-text tracking-[-0.01em]">{brand.name}</div>
                        </div>
                        <span className={`brand-status-pill ${isOpen ? "brand-status-pill-open" : "brand-status-pill-closed"}`}>
                          <span className="status-led" />
                          {isOpen ? t(loc, "open") : t(loc, "closed")}
                        </span>
                      </div>

                      <div className="text-xs text-muted2">
                        {status.todayHours
                          ? `${t(loc, "todayHours")}: ${status.todayHours}`
                          : t(loc, "closedToday")}
                      </div>
                    </Link>
                  );
                })}
              </div>

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

