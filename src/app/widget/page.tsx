import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { brandsData } from "@/data/brands";
import { absoluteUrl } from "@/lib/i18n/alternates";
import { generateBreadcrumbJsonLd } from "@/lib/schema";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Free Store Hours Widget → Embed Live Status on Your Website",
  description:
    "Add a free live open/closed badge to your website or blog. Automatically updates with real-time store hours. No account needed — copy and paste the embed code.",
  alternates: { canonical: absoluteUrl("/widget") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/widget"),
    title: "Free Store Hours Widget — Embed on Any Site",
    description: "Copy-paste iframe widget that shows live open/closed status for any major US store.",
  },
};

const FEATURED_BRANDS = [
  "mcdonalds", "walmart", "starbucks", "target", "cvs",
  "walgreens", "home-depot", "costco", "dunkin", "burger-king",
];

export default function WidgetPage() {
  const featuredBrands = FEATURED_BRANDS
    .map((slug) => brandsData.find((e) => e.brand.slug === slug))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .map((e) => e.brand);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Widget", item: absoluteUrl("/widget") },
  ]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <span className="text-text">Widget</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg flex flex-col gap-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-green">Free · No account needed</p>
                  <h1 className="font-heading font-extrabold text-[30px] sm:text-[44px] tracking-[-0.03em] leading-[0.95] text-text">
                    Embed a Live<br />Store Hours Widget
                  </h1>
                  <p className="text-[15px] text-muted2 leading-relaxed max-w-[60ch]">
                    Add a real-time open/closed badge to your website, blog, or local guide — completely free.
                    The widget auto-updates with live hours. No JavaScript required.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-1 text-[13px] text-muted2">
                    <span className="flex items-center gap-1.5"><span className="text-green">✓</span> Updates automatically</span>
                    <span className="flex items-center gap-1.5"><span className="text-green">✓</span> Mobile responsive</span>
                    <span className="flex items-center gap-1.5"><span className="text-green">✓</span> 100+ major brands</span>
                    <span className="flex items-center gap-1.5"><span className="text-green">✓</span> No API key needed</span>
                  </div>
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">How to embed</h2>
                </div>
                <div className="panel-body flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <p className="text-[14px] font-semibold text-text">Step 1 — Choose a store</p>
                    <div className="flex flex-wrap gap-2">
                      {featuredBrands.map((brand) => (
                        <Link
                          key={brand.slug}
                          href={`/embed/${brand.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] font-medium px-3.5 py-2 rounded-xl border border-border2 bg-bg2 text-muted2 no-underline hover:text-text hover:border-border transition-colors flex items-center gap-1.5"
                        >
                          <span>{brand.emoji}</span>
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="text-[14px] font-semibold text-text">Step 2 — Copy the iframe code</p>
                    <p className="text-[13px] text-muted2">Replace <code className="bg-bg2 border border-border rounded px-1.5 py-0.5 text-[11px]">BRAND-SLUG</code> with the brand name (e.g. <code className="bg-bg2 border border-border rounded px-1.5 py-0.5 text-[11px]">mcdonalds</code>, <code className="bg-bg2 border border-border rounded px-1.5 py-0.5 text-[11px]">walmart</code>):</p>
                    <pre className="text-[11px] text-muted2 bg-bg2 border border-border rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
{`<iframe
  src="https://isopenow.com/embed/BRAND-SLUG"
  width="320"
  height="80"
  frameborder="0"
  style="border-radius:12px;border:none;"
  title="Store hours widget"
></iframe>`}
                    </pre>
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="text-[14px] font-semibold text-text">Step 3 — Paste anywhere</p>
                    <p className="text-[13px] text-muted2 leading-relaxed">
                      Works in any HTML page, WordPress, Webflow, Squarespace, or static site.
                      The badge shows live open/closed status and refreshes every 45 seconds.
                    </p>
                  </div>
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Available for all major brands</h2>
                </div>
                <div className="panel-body">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {brandsData.map(({ brand }) => (
                      <Link
                        key={brand.slug}
                        href={`/embed/${brand.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] text-muted2 no-underline hover:text-text transition-colors flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:border-border2 hover:bg-bg2"
                      >
                        <span className="shrink-0">{brand.emoji || "🏪"}</span>
                        <span className="truncate">{brand.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">FAQ</h2>
                </div>
                <div>
                  {[
                    {
                      q: "Is the widget really free?",
                      a: "Yes, completely free. No account, no API key, no limits. Just copy and paste the iframe code.",
                    },
                    {
                      q: "How often does it update?",
                      a: "The widget polls for status updates every 45 seconds, so it always reflects the current open/closed state.",
                    },
                    {
                      q: "Can I customize the size?",
                      a: "Yes — adjust the width and height attributes in the iframe code. The widget is responsive and scales gracefully.",
                    },
                    {
                      q: "Which brands are supported?",
                      a: `All ${brandsData.length}+ brands in our database — including McDonald's, Walmart, Starbucks, CVS, Walgreens, Target, and more.`,
                    },
                  ].map((item) => (
                    <article key={item.q} className="border-b border-border last:border-b-0 px-6 py-5">
                      <h3 className="font-heading font-bold text-[14px] text-text mb-2">{item.q}</h3>
                      <p className="text-[13px] text-muted2 leading-relaxed">{item.a}</p>
                    </article>
                  ))}
                </div>
              </section>
            </main>

            <aside className="sidebar-stack">
              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Quick links</h3>
                </div>
                <div className="panel-body flex flex-col gap-2">
                  {[
                    { href: "/brand/mcdonalds", label: "McDonald's Hours", emoji: "🍟" },
                    { href: "/brand/walmart", label: "Walmart Hours", emoji: "🛒" },
                    { href: "/brand/starbucks", label: "Starbucks Hours", emoji: "☕" },
                    { href: "/open-late", label: "Stores Open Late", emoji: "🌙" },
                    { href: "/open-24h", label: "24 Hour Stores", emoji: "🔁" },
                    { href: "/holiday", label: "Holiday Hours", emoji: "🎄" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="no-underline flex items-center gap-2.5 text-[13px] text-muted2 hover:text-text transition-colors px-4 py-2.5 rounded-xl border border-border hover:border-border2"
                    >
                      <span>{link.emoji}</span>
                      {link.label} →
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
