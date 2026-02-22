import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { brandsData } from "@/data/brands";
import { generateBreadcrumbJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";
import { TOP_BRANDS } from "@/lib/seo-index-control";

export const metadata: Metadata = {
  title: "Compare Store Hours — Which Is Open Right Now?",
  description: "Compare opening hours for two stores side by side. Find which chain is open right now, which opens earlier, and which stays open latest.",
  alternates: {
    canonical: absoluteUrl("/compare"),
  },
};

type CompareEntry = { slugA: string; slugB: string; nameA: string; nameB: string; emojiA: string; emojiB: string; category: string };

function buildTopComparisons(): CompareEntry[] {
  const pairs: CompareEntry[] = [];

  const byCategory = new Map<string, typeof brandsData>();
  for (const entry of brandsData) {
    const cat = entry.brand.category || "Other";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(entry);
  }

  for (const [cat, entries] of byCategory) {
    const topInCat = entries.filter((e) => TOP_BRANDS.includes(e.brand.slug));
    for (let i = 0; i < topInCat.length; i++) {
      for (let j = i + 1; j < topInCat.length; j++) {
        const a = topInCat[i].brand;
        const b = topInCat[j].brand;
        pairs.push({ slugA: a.slug, slugB: b.slug, nameA: a.name, nameB: b.name, emojiA: a.emoji || "🏪", emojiB: b.emoji || "🏪", category: cat });
      }
    }
  }

  // Top cross-category pairs
  const topTen = TOP_BRANDS.slice(0, 10);
  for (let i = 0; i < topTen.length; i++) {
    for (let j = i + 1; j < topTen.length; j++) {
      const eA = brandsData.find((e) => e.brand.slug === topTen[i]);
      const eB = brandsData.find((e) => e.brand.slug === topTen[j]);
      if (!eA || !eB) continue;
      const alreadyExists = pairs.some(
        (p) => (p.slugA === topTen[i] && p.slugB === topTen[j]) || (p.slugA === topTen[j] && p.slugB === topTen[i])
      );
      if (!alreadyExists) {
        pairs.push({
          slugA: eA.brand.slug, slugB: eB.brand.slug,
          nameA: eA.brand.name, nameB: eB.brand.name,
          emojiA: eA.brand.emoji || "🏪", emojiB: eB.brand.emoji || "🏪",
          category: "Mixed",
        });
      }
    }
  }

  return pairs.slice(0, 60);
}

export default function ComparePage() {
  const comparisons = buildTopComparisons();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Compare", item: absoluteUrl("/compare") },
  ]);

  const byCategory = new Map<string, CompareEntry[]>();
  for (const entry of comparisons) {
    if (!byCategory.has(entry.category)) byCategory.set(entry.category, []);
    byCategory.get(entry.category)!.push(entry);
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <span className="text-text">Compare</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="max-w-4xl mx-auto content-stack">
            <section className="ui-panel overflow-hidden">
              <div className="panel-body-lg">
                <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                  Compare Store Hours
                </h1>
                <p className="text-muted2 text-[15px] leading-relaxed mt-4 max-w-[65ch]">
                  Side-by-side live comparison for any two stores. Who&apos;s open right now? Which opens earlier? Which stays open latest?
                </p>
              </div>
            </section>

            {[...byCategory.entries()].map(([category, entries]) => (
              <section key={category} className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">{category} comparisons</h2>
                </div>
                <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {entries.map(({ slugA, slugB, nameA, nameB, emojiA, emojiB }) => (
                    <Link
                      key={`${slugA}-vs-${slugB}`}
                      href={`/compare/${slugA}-vs-${slugB}`}
                      className="no-underline rounded-xl border border-border bg-bg2 hover:border-border2 hover:bg-bg3 transition-colors px-5 py-4 flex items-center gap-3"
                    >
                      <span className="text-xl leading-none shrink-0">{emojiA}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-text leading-tight truncate">{nameA} vs {nameB}</p>
                        <p className="text-[11px] text-muted2 mt-0.5">Live hours comparison</p>
                      </div>
                      <span className="text-xl leading-none shrink-0">{emojiB}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
