import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { getBrandBySlug, brandsData } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { generateBreadcrumbJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";
import { TOP_BRANDS } from "@/lib/seo-index-control";
import type { HoursData } from "@/lib/types";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseSlugs(slug: string): [string, string] | null {
  const idx = slug.indexOf("-vs-");
  if (idx === -1) return null;
  const a = slug.slice(0, idx);
  const b = slug.slice(idx + 4);
  if (!a || !b) return null;
  return [a, b];
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getEarliestOpen(hours: HoursData[]): string | null {
  return hours
    .filter((d) => !d.isClosed && d.openTime)
    .reduce<string | null>((acc, d) => {
      if (!d.openTime) return acc;
      if (!acc) return d.openTime;
      const [ah, am] = acc.split(":").map(Number);
      const [dh, dm] = d.openTime.split(":").map(Number);
      return dh * 60 + dm < ah * 60 + am ? d.openTime : acc;
    }, null);
}

function getLatestClose(hours: HoursData[]): string | null {
  return hours
    .filter((d) => !d.isClosed && d.closeTime && !d.spansMidnight)
    .reduce<string | null>((acc, d) => {
      if (!d.closeTime) return acc;
      if (!acc) return d.closeTime;
      const [ah, am] = acc.split(":").map(Number);
      const [dh, dm] = d.closeTime.split(":").map(Number);
      return dh * 60 + dm > ah * 60 + am ? d.closeTime : acc;
    }, null);
}

function generateComparePairs(): { slug: string }[] {
  const pairs = new Set<string>();

  const byCategory = new Map<string, string[]>();
  for (const entry of brandsData) {
    const cat = entry.brand.category || "Other";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(entry.brand.slug);
  }

  for (const [, slugs] of byCategory) {
    const topInCat = slugs.filter((s) => TOP_BRANDS.includes(s));
    for (let i = 0; i < topInCat.length; i++) {
      for (let j = i + 1; j < topInCat.length; j++) {
        pairs.add(`${topInCat[i]}-vs-${topInCat[j]}`);
      }
    }
  }

  const topTen = TOP_BRANDS.slice(0, 10);
  for (let i = 0; i < topTen.length; i++) {
    for (let j = i + 1; j < topTen.length; j++) {
      pairs.add(`${topTen[i]}-vs-${topTen[j]}`);
    }
  }

  return [...pairs].map((slug) => ({ slug }));
}

export function generateStaticParams() {
  return generateComparePairs();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlugs(slug);
  if (!parsed) return { title: "Not Found" };
  const [slugA, slugB] = parsed;
  const dataA = getBrandBySlug(slugA);
  const dataB = getBrandBySlug(slugB);
  if (!dataA || !dataB) return { title: "Not Found" };

  const { brand: a } = dataA;
  const { brand: b } = dataB;
  const year = new Date().getFullYear();

  return {
    title: `Is ${a.name} or ${b.name} Open Right Now? Hours Comparison ${year}`,
    description: `Compare ${a.name} vs ${b.name} hours side by side. Which one is open right now? Live status, today's hours, and weekly schedule comparison — updated every 5 minutes.`,
    alternates: {
      canonical: absoluteUrl(`/compare/${slug}`),
    },
    openGraph: {
      type: "website",
      url: absoluteUrl(`/compare/${slug}`),
      title: `${a.name} vs ${b.name} — Which Is Open Right Now?`,
      description: `Live side-by-side comparison of ${a.name} and ${b.name} opening hours.`,
    },
  };
}

export default async function ComparePage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseSlugs(slug);
  if (!parsed) notFound();
  const [slugA, slugB] = parsed;

  const dataA = getBrandBySlug(slugA);
  const dataB = getBrandBySlug(slugB);
  if (!dataA || !dataB) notFound();

  const { brand: a, hours: hoursA } = dataA;
  const { brand: b, hours: hoursB } = dataB;

  const statusA = computeOpenStatus(hoursA, "America/New_York", a.is24h);
  const statusB = computeOpenStatus(hoursB, "America/New_York", b.is24h);

  const earliestA = getEarliestOpen(hoursA);
  const earliestB = getEarliestOpen(hoursB);
  const latestA = getLatestClose(hoursA);
  const latestB = getLatestClose(hoursB);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Compare", item: absoluteUrl("/compare") },
    { name: `${a.name} vs ${b.name}`, item: absoluteUrl(`/compare/${slug}`) },
  ]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is ${a.name} or ${b.name} open right now?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: statusA.isOpen && statusB.isOpen
            ? `Both ${a.name} and ${b.name} are currently open.`
            : statusA.isOpen
            ? `${a.name} is currently open. ${b.name} is currently closed.`
            : statusB.isOpen
            ? `${b.name} is currently open. ${a.name} is currently closed.`
            : `Both ${a.name} and ${b.name} are currently closed.`,
        },
      },
      {
        "@type": "Question",
        name: `Which opens earlier, ${a.name} or ${b.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: earliestA && earliestB
            ? `${a.name} typically opens as early as ${formatTime(earliestA)}. ${b.name} typically opens as early as ${formatTime(earliestB)}.`
            : "Opening times vary by location.",
        },
      },
      {
        "@type": "Question",
        name: `Which closes later, ${a.name} or ${b.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: latestA && latestB
            ? `${a.name} can stay open as late as ${formatTime(latestA)}. ${b.name} can stay open as late as ${formatTime(latestB)}.`
            : "Closing times vary by location.",
        },
      },
      {
        "@type": "Question",
        name: `Are ${a.name} and ${b.name} open on weekends?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${a.name} ${hoursA.find((d) => d.dayOfWeek === 6 && !d.isClosed) ? "is open" : "may be closed"} on Saturday. ${b.name} ${hoursB.find((d) => d.dayOfWeek === 6 && !d.isClosed) ? "is open" : "may be closed"} on Saturday.`,
        },
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <Link href="/compare" className="text-muted2 no-underline hover:text-text transition-colors">Compare</Link>
            <span>/</span>
            <span className="text-text">{a.name} vs {b.name}</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">

              {/* Hero */}
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <h1 className="font-heading font-extrabold text-[28px] sm:text-[38px] tracking-[-0.04em] leading-[0.95] text-text">
                    Is {a.name} or {b.name} Open Right Now?
                  </h1>
                  <p className="text-muted2 text-[15px] leading-relaxed mt-4 max-w-[65ch]">
                    Live side-by-side status comparison. Updated every 5 minutes using standard US East Coast hours.
                  </p>
                </div>
              </section>

              {/* Live status cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatusCard
                  brand={a}
                  status={statusA}
                  slug={slugA}
                  earliest={earliestA}
                  latest={latestA}
                />
                <StatusCard
                  brand={b}
                  status={statusB}
                  slug={slugB}
                  earliest={earliestB}
                  latest={latestB}
                />
              </div>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={90} />

              {/* Hours comparison table */}
              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">
                    Weekly Hours Comparison
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-6 py-3 font-semibold text-muted2 uppercase tracking-[0.06em] text-[10px]">Day</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted2 uppercase tracking-[0.06em] text-[10px]">{a.emoji} {a.name}</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted2 uppercase tracking-[0.06em] text-[10px]">{b.emoji} {b.name}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAY_LABELS.map((day, i) => {
                        const dayIdx = i; // 0=Sun
                        const hA = hoursA.find((d) => d.dayOfWeek === dayIdx);
                        const hB = hoursB.find((d) => d.dayOfWeek === dayIdx);
                        return (
                          <tr key={day} className="border-b border-border last:border-b-0 hover:bg-bg2/50 transition-colors">
                            <td className="px-6 py-3.5 font-semibold text-text">{day}</td>
                            <td className="px-4 py-3.5 text-muted2">
                              {hA?.isClosed ? (
                                <span className="text-red text-[11px] font-medium">Closed</span>
                              ) : hA?.openTime && hA?.closeTime ? (
                                `${formatTime(hA.openTime)} – ${formatTime(hA.closeTime)}`
                              ) : a.is24h ? (
                                <span className="text-green text-[11px] font-medium">24 hours</span>
                              ) : "—"}
                            </td>
                            <td className="px-4 py-3.5 text-muted2">
                              {hB?.isClosed ? (
                                <span className="text-red text-[11px] font-medium">Closed</span>
                              ) : hB?.openTime && hB?.closeTime ? (
                                `${formatTime(hB.openTime)} – ${formatTime(hB.closeTime)}`
                              ) : b.is24h ? (
                                <span className="text-green text-[11px] font-medium">24 hours</span>
                              ) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Quick facts */}
              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">Key Differences</h2>
                </div>
                <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Earliest Opening",
                      valA: earliestA ? formatTime(earliestA) : "Varies",
                      valB: earliestB ? formatTime(earliestB) : "Varies",
                    },
                    {
                      label: "Latest Closing",
                      valA: latestA ? formatTime(latestA) : a.is24h ? "Open 24h" : "Varies",
                      valB: latestB ? formatTime(latestB) : b.is24h ? "Open 24h" : "Varies",
                    },
                    {
                      label: "Open Weekends",
                      valA: hoursA.some((d) => (d.dayOfWeek === 0 || d.dayOfWeek === 6) && !d.isClosed) ? "Yes" : "No",
                      valB: hoursB.some((d) => (d.dayOfWeek === 0 || d.dayOfWeek === 6) && !d.isClosed) ? "Yes" : "No",
                    },
                    {
                      label: "24/7 Locations",
                      valA: a.is24h ? "Some locations" : "No",
                      valB: b.is24h ? "Some locations" : "No",
                    },
                  ].map(({ label, valA, valB }) => (
                    <div key={label} className="rounded-xl border border-border bg-bg2 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted mb-3">{label}</p>
                      <div className="flex gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-muted2 truncate">{a.emoji} {a.name}</p>
                          <p className="text-[14px] font-semibold text-text mt-0.5">{valA}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-muted2 truncate">{b.emoji} {b.name}</p>
                          <p className="text-[14px] font-semibold text-text mt-0.5">{valB}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ section */}
              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">Frequently Asked Questions</h2>
                </div>
                <div>
                  <FaqItem
                    q={`Is ${a.name} or ${b.name} open right now?`}
                    a={statusA.isOpen && statusB.isOpen
                      ? `Both ${a.name} and ${b.name} are currently open.`
                      : statusA.isOpen
                      ? `${a.name} is open right now. ${b.name} is currently closed.`
                      : statusB.isOpen
                      ? `${b.name} is open right now. ${a.name} is currently closed.`
                      : `Both ${a.name} and ${b.name} are currently closed. ${a.name} opens at ${statusA.opensAt || "unknown"}, ${b.name} opens at ${statusB.opensAt || "unknown"}.`}
                  />
                  <FaqItem
                    q={`Which opens earlier: ${a.name} or ${b.name}?`}
                    a={earliestA && earliestB
                      ? `${a.name} opens as early as ${formatTime(earliestA)}. ${b.name} opens as early as ${formatTime(earliestB)}. ${(parseInt(earliestA) < parseInt(earliestB)) ? a.name : b.name} typically opens earlier.`
                      : "Opening times vary by location. Check the individual brand pages for the most accurate schedule."}
                  />
                  <FaqItem
                    q={`Which stays open later: ${a.name} or ${b.name}?`}
                    a={latestA && latestB
                      ? `${a.name} can close as late as ${formatTime(latestA)}. ${b.name} can close as late as ${formatTime(latestB)}.`
                      : a.is24h || b.is24h
                      ? `${a.is24h ? a.name : b.name} has some 24-hour locations that never close.`
                      : "Closing times vary by location."}
                  />
                  <FaqItem
                    q={`Are ${a.name} and ${b.name} open on Sundays?`}
                    a={`${a.name} is ${hoursA.find((d) => d.dayOfWeek === 0 && !d.isClosed) ? "typically open" : "often closed"} on Sundays. ${b.name} is ${hoursB.find((d) => d.dayOfWeek === 0 && !d.isClosed) ? "typically open" : "often closed"} on Sundays. Individual locations may vary.`}
                  />
                </div>
              </section>

              {/* Links to individual pages */}
              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">Full brand pages</h2>
                </div>
                <div className="panel-body flex flex-wrap gap-3">
                  <Link
                    href={`/is-${slugA}-open`}
                    className="text-[12px] font-medium px-5 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                  >
                    {a.emoji} {a.name} full schedule →
                  </Link>
                  <Link
                    href={`/is-${slugB}-open`}
                    className="text-[12px] font-medium px-5 py-2.5 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors"
                  >
                    {b.emoji} {b.name} full schedule →
                  </Link>
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={110} />
            </main>

            <aside className="sidebar-stack">
              <div className="hidden lg:block">
                <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE} label="Sponsored" minHeight={250} />
              </div>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">More comparisons</h3>
                </div>
                <div className="panel-body flex flex-col gap-2.5">
                  {generateRelatedPairs(slugA, slugB).map(({ slugC, slugD, nameC, nameD }) => (
                    <Link
                      key={`${slugC}-vs-${slugD}`}
                      href={`/compare/${slugC}-vs-${slugD}`}
                      className="text-[13px] text-muted2 no-underline hover:text-text transition-colors py-1"
                    >
                      {nameC} vs {nameD} →
                    </Link>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function StatusCard({
  brand,
  status,
  slug,
  earliest,
  latest,
}: {
  brand: { name: string; emoji?: string | null; is24h?: boolean };
  status: { isOpen: boolean; todayHours: string | null; closesIn: string | null; opensAt: string | null };
  slug: string;
  earliest: string | null;
  latest: string | null;
}) {
  return (
    <Link
      href={`/is-${slug}-open`}
      className={`no-underline rounded-2xl border p-6 flex flex-col gap-4 transition-colors hover:opacity-90 ${
        status.isOpen
          ? "border-green/30 bg-green-dim"
          : "border-red/20 bg-red-dim"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl leading-none">{brand.emoji || "🏪"}</span>
        <div>
          <p className="text-[16px] font-heading font-bold text-text leading-tight">{brand.name}</p>
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold mt-1 ${status.isOpen ? "text-green" : "text-red"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.isOpen ? "bg-green animate-pulse" : "bg-red"}`} />
            {status.isOpen ? "Open now" : "Closed now"}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        {status.todayHours && (
          <p className="text-[12px] text-muted2">Today: <span className="text-text font-medium">{status.todayHours}</span></p>
        )}
        {status.isOpen && status.closesIn && (
          <p className="text-[12px] text-muted2">Closes in: <span className="text-text font-medium">{status.closesIn}</span></p>
        )}
        {!status.isOpen && status.opensAt && (
          <p className="text-[12px] text-muted2">Opens at: <span className="text-text font-medium">{status.opensAt}</span></p>
        )}
        {brand.is24h && (
          <p className="text-[11px] text-green font-medium">Some 24h locations</p>
        )}
      </div>

      <p className="text-[11px] text-muted mt-auto">View full schedule →</p>
    </Link>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <article className="border-b border-border last:border-b-0 px-6 py-5 md:px-7 md:py-6">
      <h3 className="font-heading font-bold text-[14px] md:text-[15px] mb-2 text-text leading-snug">{q}</h3>
      <p className="text-[14px] text-muted2 leading-relaxed">{a}</p>
    </article>
  );
}

function generateRelatedPairs(slugA: string, slugB: string): { slugC: string; slugD: string; nameC: string; nameD: string }[] {
  const results: { slugC: string; slugD: string; nameC: string; nameD: string }[] = [];
  const involved = new Set([slugA, slugB]);

  for (const s of TOP_BRANDS.slice(0, 15)) {
    if (involved.has(s)) continue;
    const entryA = brandsData.find((e) => e.brand.slug === slugA);
    const entryB = brandsData.find((e) => e.brand.slug === slugB);
    const entryS = brandsData.find((e) => e.brand.slug === s);
    if (!entryA || !entryB || !entryS) continue;

    if (entryS.brand.category === entryA.brand.category || entryS.brand.category === entryB.brand.category) {
      results.push({ slugC: slugA, slugD: s, nameC: entryA.brand.name, nameD: entryS.brand.name });
      if (results.length >= 5) break;
    }
  }

  // Fill with cross-pairs if needed
  if (results.length < 5) {
    for (const s of TOP_BRANDS.slice(0, 10)) {
      if (involved.has(s) || results.some((r) => r.slugD === s)) continue;
      const entryA = brandsData.find((e) => e.brand.slug === slugA);
      const entryS = brandsData.find((e) => e.brand.slug === s);
      if (!entryA || !entryS) continue;
      results.push({ slugC: slugA, slugD: s, nameC: entryA.brand.name, nameD: entryS.brand.name });
      if (results.length >= 5) break;
    }
  }

  return results;
}
