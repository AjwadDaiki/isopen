import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { blogPosts, getBlogPost, type BlogSection } from "@/data/blog-posts";
import { generateBreadcrumbJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: absoluteUrl(`/blog/${slug}`) },
    openGraph: {
      type: "article",
      url: absoluteUrl(`/blog/${slug}`),
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
    },
    other: {
      "article:published_time": post.publishedAt,
      "article:modified_time": post.updatedAt,
    },
  };
}

function renderSection(section: BlogSection, idx: number) {
  switch (section.type) {
    case "intro":
      return (
        <p key={idx} className="text-[15px] text-muted2 leading-relaxed border-l-2 border-green pl-4 italic">
          {section.text}
        </p>
      );
    case "h2":
      return (
        <h2 key={idx} className="font-heading font-bold text-[22px] text-text tracking-[-0.02em] mt-8 mb-3">
          {section.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={idx} className="font-heading font-semibold text-[17px] text-text tracking-[-0.01em] mt-6 mb-2">
          {section.text}
        </h3>
      );
    case "p":
      return (
        <p key={idx} className="text-[14px] text-muted2 leading-relaxed">
          {section.text}
        </p>
      );
    case "ul":
      return (
        <ul key={idx} className="space-y-2 pl-4">
          {section.items?.map((item, i) => (
            <li key={i} className="text-[14px] text-muted2 leading-relaxed flex items-start gap-2">
              <span className="text-green mt-1 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={idx} className="space-y-2 pl-4">
          {section.items?.map((item, i) => (
            <li key={i} className="text-[14px] text-muted2 leading-relaxed flex items-start gap-3">
              <span className="text-green font-bold shrink-0 w-5">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );
    case "tip":
      return (
        <div key={idx} className="rounded-xl border border-green/20 bg-green/5 px-5 py-4 flex gap-3">
          <span className="text-green text-[16px] shrink-0 mt-0.5">💡</span>
          <p className="text-[13px] text-muted2 leading-relaxed">{section.text}</p>
        </div>
      );
    case "table":
      return (
        <div key={idx} className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-bg2">
                {section.headers?.map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 font-semibold text-text">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows?.map((row, ri) => (
                <tr key={ri} className="border-b border-border last:border-0 hover:bg-bg2 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className={`px-4 py-3 ${ci === 0 ? "font-medium text-text" : "text-muted2"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const relatedPosts = post.relatedSlugs
    .map((s) => getBlogPost(s))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Blog", item: absoluteUrl("/blog") },
    { name: post.title, item: absoluteUrl(`/blog/${slug}`) },
  ]);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: "IsOpenNow",
      url: absoluteUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      name: "IsOpenNow",
      url: absoluteUrl("/"),
    },
    mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
    keywords: post.tags.join(", "),
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="text-muted2 no-underline hover:text-text transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-text truncate max-w-[200px]">{post.title}</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <article className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className="text-2xl">{post.emoji}</span>
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-[0.08em]">
                      {post.category}
                    </span>
                    <span className="text-[11px] text-muted2">·</span>
                    <span className="text-[11px] text-muted2">{post.readingMinutes} min read</span>
                    <span className="text-[11px] text-muted2">·</span>
                    <span className="text-[11px] text-muted2">Updated {post.updatedAt}</span>
                  </div>

                  <h1 className="font-heading font-extrabold text-[26px] sm:text-[36px] tracking-[-0.03em] leading-[1.05] text-text mb-6">
                    {post.title}
                  </h1>

                  <div className="flex flex-col gap-5">
                    {post.content.map((section, idx) => renderSection(section, idx))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-bg2 border border-border text-muted2"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={100} />

              {relatedPosts.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                      Related articles
                    </h2>
                  </div>
                  <div className="panel-body flex flex-col gap-3">
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/blog/${related.slug}`}
                        className="brand-card-link brand-card-premium no-underline p-4 flex items-start gap-3"
                      >
                        <span className="text-xl shrink-0 mt-0.5">{related.emoji}</span>
                        <div>
                          <p className="text-[14px] font-semibold text-text leading-snug">{related.title}</p>
                          <p className="text-[12px] text-muted2 mt-1 line-clamp-2">{related.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </main>

            <aside className="sidebar-stack">
              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Quick tools</h3>
                </div>
                <div className="panel-body flex flex-col gap-2">
                  {[
                    { href: "/open-late", label: "Stores Open Late Tonight", emoji: "🌙" },
                    { href: "/open-24h", label: "24 Hour Stores", emoji: "🔁" },
                    { href: "/holiday", label: "Holiday Hours 2026", emoji: "🎄" },
                    { href: "/near-me", label: "Open Near Me", emoji: "📍" },
                    { href: "/brand/mcdonalds", label: "McDonald's Hours", emoji: "🍟" },
                    { href: "/brand/walgreens", label: "Walgreens Hours", emoji: "💊" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="no-underline flex items-center gap-2.5 text-[13px] text-muted2 hover:text-text transition-colors px-4 py-2.5 rounded-xl border border-border hover:border-border2"
                    >
                      <span className="text-base">{link.emoji}</span>
                      {link.label} →
                    </Link>
                  ))}
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">All articles</h3>
                </div>
                <div className="panel-body flex flex-col gap-2">
                  {blogPosts.filter((p) => p.slug !== slug).map((p) => (
                    <Link
                      key={p.slug}
                      href={`/blog/${p.slug}`}
                      className="no-underline flex items-start gap-2.5 text-[13px] text-muted2 hover:text-text transition-colors px-4 py-2.5 rounded-xl border border-border hover:border-border2"
                    >
                      <span className="shrink-0">{p.emoji}</span>
                      <span className="leading-tight">{p.title}</span>
                    </Link>
                  ))}
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={220} />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
