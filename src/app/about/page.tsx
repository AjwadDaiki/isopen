import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About - IsItOpen",
  description:
    "About IsItOpen: how we collect opening-hours data, update status in real time, and maintain quality.",
  alternates: {
    canonical: "https://isopenow.com/about",
  },
  openGraph: {
    title: "About - IsItOpen",
    description:
      "Learn how IsItOpen provides real-time store status and weekly opening hours.",
    url: "https://isopenow.com/about",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="page-pad pt-12 pb-14">
          <div className="max-w-[760px] content-stack">
            <section className="ui-panel overflow-hidden">
              <div className="panel-body-lg">
                <h1 className="font-heading font-extrabold text-[34px] tracking-[-0.04em] text-text">
                  About IsItOpen
                </h1>
                <p className="text-muted2 text-[15px] leading-relaxed mt-4">
                  IsItOpen helps people answer one question fast: is a place open right now? We publish brand-level hours,
                  live open or closed status, and day-specific checks in one page.
                </p>
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="panel-body">
                <h2 className="font-heading font-bold text-[19px] text-text mb-3">
                  What we publish
                </h2>
                <ul className="legal-content text-muted2 text-[14px] leading-relaxed">
                  <li>Current open or closed status</li>
                  <li>Weekly opening hours by day</li>
                  <li>Holiday and special-day checks</li>
                  <li>User-reported issues used for quality review</li>
                </ul>
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="panel-body">
                <h2 className="font-heading font-bold text-[19px] text-text mb-3">
                  How quality is handled
                </h2>
                <p className="text-muted2 text-[14px] leading-relaxed">
                  We combine schedule data, timezone-aware calculations, and report moderation to reduce errors.
                  Opening hours can still vary by specific location, temporary closures, or seasonal changes. For
                  critical visits, always confirm directly with the location.
                </p>
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="panel-body">
                <h2 className="font-heading font-bold text-[19px] text-text mb-3">
                  Contact and policies
                </h2>
                <p className="text-muted2 text-[14px] leading-relaxed">
                  You can reach us for data corrections or partnership requests on the <Link href="/contact" className="text-green no-underline hover:underline">contact page</Link>.
                  Please also review our <Link href="/privacy" className="text-green no-underline hover:underline">privacy policy</Link> and <Link href="/terms" className="text-green no-underline hover:underline">terms of service</Link>.
                </p>
              </div>
            </section>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
