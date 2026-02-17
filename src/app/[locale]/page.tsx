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

function renderLocalizedHero(title: string) {
  const match = title.match(/^(.*)<green>(.*)<\/green>(.*)$/);
  if (!match) {
    return title;
  }

  const [, before, highlighted, after] = match;
  return (
    <>
      {before}
      <span style={{ color: "var(--color-green)" }}>{highlighted}</span>
      {after}
    </>
  );
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

        <section className="page-pad relative overflow-hidden" style={{ paddingTop: 120, paddingBottom: 100 }}>
          <div
            className="absolute pointer-events-none"
            style={{
              top: -170,
              left: "50%",
              transform: "translateX(-50%)",
              width: 860,
              height: 430,
              background: "radial-gradient(ellipse, rgba(24,242,142,0.075) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-[1] max-w-4xl">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
              style={{
                background: "var(--color-green-dim)",
                border: "1px solid rgba(24,242,142,0.2)",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--color-green)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <span className="rounded-full bg-green animate-pulse-dot" style={{ width: 6, height: 6 }} />
              {t(loc, "realTimeStatus")}
            </div>

            <h1
              className="font-heading font-extrabold text-text"
              style={{
                fontSize: "clamp(52px, 8vw, 98px)",
                letterSpacing: "-0.052em",
                lineHeight: 0.92,
              }}
            >
              {renderLocalizedHero(t(loc, "heroTitle"))}
            </h1>

            <p className="text-muted2 mt-6" style={{ fontSize: 18, maxWidth: 620, lineHeight: 1.7 }}>
              {t(loc, "heroSub")}
            </p>
          </div>
        </section>

        <section className="page-pad" style={{ paddingBottom: 64 }}>
          <div className="flex items-baseline justify-between mb-7">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{t(loc, "topBrands")}</h2>
            <Link href="/search" className="text-[13px] text-muted2 no-underline hover:text-text transition-colors">
              {t(loc, "viewAll")} &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {featured.map(({ brand, hours }, i) => {
              const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
              const isOpen = status.isOpen;
              return (
                <Link
                  key={brand.slug}
                  href={buildBrandUrl(loc, brand.slug)}
                  className={`brand-card-link brand-card-premium no-underline ${isOpen ? "brand-card-open" : "brand-card-closed"}`}
                  style={{
                    padding: "28px 22px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                    textAlign: "center",
                    minHeight: 160,
                    animationDelay: `${Math.min(i * 0.045, 0.42)}s`,
                  }}
                >
                  <span style={{ fontSize: 30, lineHeight: 1 }}>{brand.emoji || "Store"}</span>

                  <span className="font-heading text-[14px] font-extrabold text-text tracking-[-0.02em]">
                    {brand.name}
                  </span>

                  <span className={`brand-status-pill ${isOpen ? "brand-status-pill-open" : "brand-status-pill-closed"}`}>
                    <span className="status-led" />
                    {isOpen ? t(loc, "open") : t(loc, "closed")}
                  </span>

                  <span className="font-mono text-[11px] text-muted2 uppercase tracking-[0.08em]">{brand.category}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="page-pad" style={{ paddingBottom: 48 }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP} label="Sponsored" minHeight={92} />
        </section>

        <section className="page-pad" style={{ paddingBottom: 80 }}>
          <div className="flex flex-col gap-12">
            {categories.map((cat) => {
              const catSlug = cat.toLowerCase().replace(/\s+/g, "-");
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.13em] text-muted">{cat}</h3>
                    <Link
                      href={`/${loc}/category/${catSlug}`}
                      className="text-[12px] text-muted2 no-underline hover:text-text transition-colors"
                    >
                      {t(loc, "viewAll")} &rarr;
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {brandsData
                      .filter((b) => b.brand.category === cat)
                      .map(({ brand }) => (
                        <Link
                          key={brand.slug}
                          href={buildBrandUrl(loc, brand.slug)}
                          className="no-underline text-[12px] font-medium text-muted2 border border-border rounded-xl px-4 py-2.5 hover:text-text hover:border-border2 transition-colors bg-bg1"
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

        <section className="page-pad" style={{ paddingBottom: 52 }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={120} />
        </section>

        <Footer />
      </div>
    </>
  );
}
