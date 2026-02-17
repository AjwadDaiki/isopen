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
  const websiteJsonLd = generateWebsiteJsonLd();
  const orgJsonLd = generateOrganizationJsonLd();

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

        <div className="page-pad" style={{ paddingTop: 64, paddingBottom: 24 }}>
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-dim border border-green/20 rounded-full px-3 py-1 font-mono text-[11px] text-green tracking-wide mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-dot" />
              {t(loc, "realTimeStatus")}
            </div>
            <h1 className="font-heading text-4xl sm:text-[64px] font-extrabold tracking-[-0.04em] leading-[1] mb-6 text-text">
              {t(loc, "heroTitle").replace("<green>", "").replace("</green>", "")}
            </h1>
            <p className="text-lg text-muted2 leading-relaxed max-w-xl">{t(loc, "heroSub")}</p>
          </div>
        </div>

        <div className="page-pad" style={{ paddingBottom: 20 }}>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP} label="Sponsored" minHeight={140} />
        </div>

        <div className="page-pad" style={{ paddingBottom: 56 }}>
          {categories.map((cat) => {
            const catSlug = cat.toLowerCase().replace(/\s+/g, "-");
            return (
              <div key={cat} style={{ marginBottom: 40 }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-muted">{cat}</h2>
                  <Link href={`/${loc}/category/${catSlug}`} className="font-mono text-[11px] text-green no-underline hover:underline">
                    View all &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {brandsData
                    .filter((b) => b.brand.category === cat)
                    .map(({ brand, hours }) => {
                      const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
                      return (
                        <Link
                          key={brand.slug}
                          href={buildBrandUrl(loc, brand.slug)}
                          className="brand-card-link bg-bg1 border border-border rounded-xl p-4 no-underline flex flex-col items-center gap-2.5"
                        >
                          <span className="text-2xl">{brand.emoji || "Store"}</span>
                          <span className="text-sm font-heading font-bold text-text text-center leading-tight">{brand.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${status.isOpen ? "bg-green animate-pulse-dot" : "bg-red"}`} />
                            <span className={`text-xs font-semibold ${status.isOpen ? "text-green" : "text-red"}`}>
                              {status.isOpen ? t(loc, "open") : t(loc, "closed")}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 8 }}>
            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={180} />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
