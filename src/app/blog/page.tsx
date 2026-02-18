import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { blogPosts } from "@/data/blog-posts";
import { generateBreadcrumbJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Blog | Store Hours Tips, Holiday Guides & Late Night Shopping",
  description:
    "Expert guides on store opening hours, holiday closures, late-night shopping, and 24-hour stores near you. Updated for 2026.",
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/blog"),
    title: "IsOpenNow Blog — Store Hours Guides & Tips",
    description: "Helpful guides on when stores are open, holiday hours, and finding 24/7 services near you.",
  },
};

export default function BlogIndexPage() {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Blog", item: absoluteUrl("/blog") },
  ]);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Blog posts",
    itemListElement: blogPosts.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
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
            <span className="text-text">Blog</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="mx-auto max-w-[980px] content-stack">
            <section className="ui-panel overflow-hidden">
              <div className="panel-body-lg">
                <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                  Store Hours Blog
                </h1>
                <p className="text-muted2 text-[15px] leading-relaxed mt-5 max-w-[68ch]">
                  Practical guides on store hours, holiday closures, late-night shopping, and finding
                  24/7 services near you. Updated for 2026.
                </p>
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                  Latest articles
                </h2>
                <span className="text-[12px] text-muted2">{blogPosts.length} guides</span>
              </div>
              <div className="panel-body flex flex-col gap-0 divide-y divide-border">
                {blogPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="no-underline py-5 flex items-start gap-4 hover:bg-bg2 transition-colors -mx-5 px-5 rounded-xl"
                  >
                    <span className="text-2xl mt-0.5 shrink-0">{post.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.08em]">
                          {post.category}
                        </span>
                        <span className="text-[11px] text-muted2">·</span>
                        <span className="text-[11px] text-muted2">{post.readingMinutes} min read</span>
                        <span className="text-[11px] text-muted2">·</span>
                        <span className="text-[11px] text-muted2">{post.updatedAt}</span>
                      </div>
                      <h3 className="text-[15px] font-semibold text-text leading-snug">{post.title}</h3>
                      <p className="text-[13px] text-muted2 mt-1.5 leading-relaxed line-clamp-2">{post.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium px-2 py-1 rounded-md bg-bg2 border border-border text-muted2"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-[12px] text-muted2 shrink-0 mt-1">Read →</span>
                  </Link>
                ))}
              </div>
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={100} />

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                  Useful tools
                </h2>
              </div>
              <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { href: "/open-late", label: "Stores Open Late", desc: "Find stores open after 10PM tonight", emoji: "🌙" },
                  { href: "/open-24h", label: "24 Hour Stores", desc: "All brands open 24 hours a day", emoji: "🔁" },
                  { href: "/holiday", label: "Holiday Hours", desc: "Full 2026 holiday hours guide", emoji: "🎄" },
                  { href: "/near-me", label: "Open Near Me", desc: "Category-based local store finder", emoji: "📍" },
                ].map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="brand-card-link brand-card-premium no-underline p-4 flex items-center gap-3"
                  >
                    <span className="text-xl">{tool.emoji}</span>
                    <div>
                      <p className="text-[14px] font-semibold text-text">{tool.label}</p>
                      <p className="text-[12px] text-muted2 mt-0.5">{tool.desc}</p>
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
