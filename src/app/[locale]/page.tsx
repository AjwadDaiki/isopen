import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { brandsData } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { LOCALES, type Locale, t } from "@/lib/i18n/translations";
import { buildBrandUrl } from "@/lib/i18n/url-patterns";
import { buildLocaleAlternates, absoluteUrl } from "@/lib/i18n/alternates";
import { generateWebsiteJsonLd, generateOrganizationJsonLd } from "@/lib/schema";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return LOCALES.filter((l) => l !== "en").map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as Locale;

  const alternates = buildLocaleAlternates(
    Object.fromEntries(LOCALES.map((l) => [l, l === "en" ? "/" : `/${l}`])) as Record<Locale, string>
  );

  return {
    title: `IsItOpen - ${t(loc, "realTimeStatus")}`,
    description: t(loc, "heroSub"),
    alternates: {
      canonical: absoluteUrl(`/${loc}`),
      languages: alternates,
    },
  };
}

export default async function LocaleHomePage({ params }: PageProps) {
  const { locale } = await params;
  const loc = locale as Locale;

  const categories = [...new Set(brandsData.map((b) => b.brand.category).filter(Boolean))] as string[];
  const featured = brandsData.slice(0, 15);
  const websiteJsonLd = generateWebsiteJsonLd();
  const orgJsonLd = generateOrganizationJsonLd();

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

        <section className="page-pad" style={{ paddingTop: 52, paddingBottom: 26 }}>
          <h1 className="font-heading text-[clamp(34px,4.6vw,56px)] font-extrabold tracking-[-0.04em] leading-[0.98] text-text">
            {t(loc, "heroTitle").replace("<green>", "").replace("</green>", "")}
          </h1>
          <p className="text-muted2 mt-4 text-[15px] max-w-xl">{t(loc, "heroSub")}</p>
        </section>

        <section className="page-pad" style={{ paddingBottom: 30 }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" style={{ gap: 12 }}>
            {featured.map(({ brand, hours }, i) => {
              const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
              return (
                <Link
                  key={brand.slug}
                  href={buildBrandUrl(loc, brand.slug)}
                  className="brand-card-link brand-card-premium no-underline"
                  style={{
                    border: `1px solid ${status.isOpen ? "rgba(68,209,141,0.38)" : "var(--color-border)"}`,
                    padding: "16px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    minHeight: 120,
                    animationDelay: `${Math.min(i * 0.03, 0.3)}s`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 23, lineHeight: 1 }}>{brand.emoji || "Store"}</span>
                    <span className={`brand-status-pill ${status.isOpen ? "brand-status-pill-open" : "brand-status-pill-closed"}`}>
                      {status.isOpen ? t(loc, "open") : t(loc, "closed")}
                    </span>
                  </div>
                  <span className="font-heading font-bold text-[15px] text-text leading-tight tracking-[-0.01em]">{brand.name}</span>
                  <span className="text-[11px] text-muted2 uppercase tracking-[0.08em]">{brand.category}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="page-pad" style={{ paddingBottom: 26 }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP} label="Sponsored" minHeight={92} />
        </section>

        <section className="page-pad" style={{ paddingBottom: 56 }}>
          <div className="flex flex-col gap-8">
            {categories.map((cat) => {
              const catSlug = cat.toLowerCase().replace(/\s+/g, "-");
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{cat}</h2>
                    <Link href={`/${loc}/category/${catSlug}`} className="text-[12px] text-muted2 no-underline hover:text-text transition-colors">
                      {t(loc, "viewAll")}
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {brandsData
                      .filter((b) => b.brand.category === cat)
                      .map(({ brand }) => (
                        <Link
                          key={brand.slug}
                          href={buildBrandUrl(loc, brand.slug)}
                          className="no-underline text-[12px] text-muted2 border border-border rounded-md px-3 py-1.5 hover:text-text hover:border-border2 transition-colors"
                        >
                          {brand.name}
                        </Link>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="page-pad" style={{ paddingBottom: 32 }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={120} />
        </section>

        <Footer />
      </div>
    </>
  );
}
