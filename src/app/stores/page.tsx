import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { brandsData } from "@/data/brands";
import { generateBreadcrumbJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 86400;

const year = new Date().getFullYear();

export const metadata: Metadata = {
  title: `All Store Hours ${year} → Complete A-Z Directory`,
  description:
    `Complete directory of store hours for every major US brand. A-Z listing of ${brandsData.length}+ stores with live open/closed status, today's schedule, and full weekly hours.`,
  alternates: { canonical: absoluteUrl("/stores") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/stores"),
    title: `All Store Hours ${year} — A-Z Directory`,
    description: `Live hours directory for ${brandsData.length}+ major US brands. Always up to date.`,
  },
};

function getBrandsByLetter() {
  const map = new Map<string, typeof brandsData>();
  for (const entry of brandsData) {
    const letter = entry.brand.name[0].toUpperCase();
    const key = /[A-Z]/.test(letter) ? letter : "#";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
  }
  return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

function getCategories() {
  const cats = new Set<string>();
  for (const { brand } of brandsData) {
    if (brand.category) cats.add(brand.category);
  }
  return [...cats].sort();
}

export default function StoresPage() {
  const byLetter = getBrandsByLetter();
  const letters = [...byLetter.keys()];
  const categories = getCategories();

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "All Stores", item: absoluteUrl("/stores") },
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Complete US store hours directory",
    description: `A-Z listing of ${brandsData.length}+ major US brand hours`,
    numberOfItems: brandsData.length,
    itemListElement: brandsData.slice(0, 30).map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${entry.brand.name} Hours`,
      url: absoluteUrl(`/brand/${entry.brand.slug}`),
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
            <span className="text-text">All Stores</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="max-w-[860px] mx-auto content-stack">
            <section className="ui-panel overflow-hidden">
              <div className="panel-body-lg flex flex-col gap-4">
                <h1 className="font-heading font-extrabold text-[30px] sm:text-[44px] tracking-[-0.03em] leading-[0.95] text-text">
                  All Store Hours<br />{year} Directory
                </h1>
                <p className="text-[15px] text-muted2 leading-relaxed max-w-[60ch]">
                  Complete A-Z hours directory for {brandsData.length}+ major US brands.
                  Every listing includes today&apos;s hours, live open/closed status, and full weekly schedule.
                </p>
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Browse by category</h2>
              </div>
              <div className="panel-body flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const slug = cat.toLowerCase().replace(/\s+/g, "-");
                  return (
                    <Link
                      key={cat}
                      href={`/category/${slug}`}
                      className="text-[12px] font-medium px-4 py-2 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                    >
                      {cat}
                    </Link>
                  );
                })}
              </div>
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={90} />

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Jump to letter</h2>
              </div>
              <div className="panel-body flex flex-wrap gap-2">
                {letters.map((letter) => (
                  <a
                    key={letter}
                    href={`#letter-${letter}`}
                    className="text-[12px] font-mono font-bold w-9 h-9 rounded-lg border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors flex items-center justify-center"
                  >
                    {letter}
                  </a>
                ))}
              </div>
            </section>

            {[...byLetter.entries()].map(([letter, entries]) => (
              <section key={letter} id={`letter-${letter}`} className="ui-panel overflow-hidden scroll-mt-20">
                <div className="card-title-row">
                  <h2 className="font-heading font-extrabold text-[20px] text-text tracking-tight">{letter}</h2>
                  <span className="text-[12px] text-muted2">{entries.length} {entries.length === 1 ? "brand" : "brands"}</span>
                </div>
                <div className="panel-body grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {entries.sort((a, b) => a.brand.name.localeCompare(b.brand.name)).map(({ brand }) => (
                    <Link
                      key={brand.slug}
                      href={`/brand/${brand.slug}`}
                      className="no-underline flex items-center gap-2.5 text-[13px] text-muted2 hover:text-text transition-colors px-3.5 py-2.5 rounded-xl border border-border hover:border-border2 hover:bg-bg2"
                    >
                      <span className="shrink-0 text-base">{brand.emoji || "🏪"}</span>
                      <span className="truncate">{brand.name} Hours</span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={100} />

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">More resources</h2>
              </div>
              <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { href: "/open-now", label: "What's Open Right Now", emoji: "🟢", desc: "Live status for all brands" },
                  { href: "/open-late", label: "Stores Open Late", emoji: "🌙", desc: "Open after 10PM tonight" },
                  { href: "/open-24h", label: "24 Hour Stores", emoji: "🔁", desc: "Always-open locations" },
                  { href: "/holiday", label: "Holiday Hours", emoji: "🎄", desc: "Christmas, Thanksgiving & more" },
                  { href: "/near-me/fast-food", label: "Fast Food Near Me", emoji: "🍟", desc: "Burgers, pizza, tacos" },
                  { href: "/near-me/pharmacy", label: "Pharmacy Near Me", emoji: "💊", desc: "Meds and health items" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="brand-card-link brand-card-premium no-underline p-4 flex items-center gap-3"
                  >
                    <span className="text-2xl shrink-0">{link.emoji}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-text leading-tight">{link.label}</p>
                      <p className="text-[11px] text-muted2 mt-0.5">{link.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
