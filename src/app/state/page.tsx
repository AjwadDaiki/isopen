import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { getStateSummaries } from "@/data/cities";
import { generateBreadcrumbJsonLd } from "@/lib/schema";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "State Pages - Open Now by State",
  description:
    "Browse state pages to check what stores, restaurants, pharmacies, and services are open now across major US states.",
  alternates: {
    canonical: "https://isopenow.com/state",
  },
  openGraph: {
    type: "website",
    url: "https://isopenow.com/state",
    title: "Open Now by State",
    description: "State-level pages for fast open-now checks.",
  },
};

export default function StateIndexPage() {
  const states = getStateSummaries();
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: "https://isopenow.com/" },
    { name: "States", item: "https://isopenow.com/state" },
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
            <span className="text-text">States</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="mx-auto max-w-[980px] content-stack">
            <section className="ui-panel overflow-hidden">
              <div className="panel-body-lg">
                <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                  Open Now by State
                </h1>
                <p className="text-muted2 text-[15px] leading-relaxed mt-5 max-w-[68ch]">
                  State-level landing pages for high-intent searches like &quot;open now near me&quot; and
                  &quot;is it open in my state&quot;.
                </p>
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="card-title-row">
                <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Available state pages</h2>
                <span className="font-mono text-[10px] text-muted tracking-[0.08em]">{states.length} states</span>
              </div>
              <div className="panel-body grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {states.map((state) => (
                  <Link
                    key={state.code}
                    href={`/state/${state.slug}`}
                    className="brand-card-link brand-card-premium no-underline p-6"
                  >
                    <p className="text-[16px] font-heading font-bold text-text tracking-[-0.01em]">
                      {state.name}
                    </p>
                    <p className="text-[12px] text-muted2 mt-1.5">{state.code}</p>
                    <div className="mt-3.5 inline-flex items-center rounded-full border border-border px-2.5 py-1">
                      <span className="font-mono text-[10px] text-muted uppercase tracking-[0.08em]">{state.cityCount} city pages</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={120} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
