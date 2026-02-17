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
        <div className="page-pad" style={{ paddingTop: 48, paddingBottom: 64 }}>
          <div style={{ maxWidth: 760 }}>
            <h1
              className="font-heading font-extrabold text-text"
              style={{ fontSize: 34, letterSpacing: "-0.04em", marginBottom: 16 }}
            >
              About IsItOpen
            </h1>

            <p className="text-muted2" style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 28 }}>
              IsItOpen helps people answer one question fast: is a place open right now? We publish brand-level hours,
              live open or closed status, and day-specific checks in one page.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <section className="ui-panel" style={{ padding: 24 }}>
                <h2 className="font-heading font-bold text-text" style={{ fontSize: 19, marginBottom: 12 }}>
                  What we publish
                </h2>
                <ul className="legal-content text-muted2" style={{ fontSize: 14, lineHeight: 1.7 }}>
                  <li>Current open or closed status</li>
                  <li>Weekly opening hours by day</li>
                  <li>Holiday and special-day checks</li>
                  <li>User-reported issues used for quality review</li>
                </ul>
              </section>

              <section className="ui-panel" style={{ padding: 24 }}>
                <h2 className="font-heading font-bold text-text" style={{ fontSize: 19, marginBottom: 12 }}>
                  How quality is handled
                </h2>
                <p className="text-muted2" style={{ fontSize: 14, lineHeight: 1.75 }}>
                  We combine schedule data, timezone-aware calculations, and report moderation to reduce errors.
                  Opening hours can still vary by specific location, temporary closures, or seasonal changes. For
                  critical visits, always confirm directly with the location.
                </p>
              </section>

              <section className="ui-panel" style={{ padding: 24 }}>
                <h2 className="font-heading font-bold text-text" style={{ fontSize: 19, marginBottom: 12 }}>
                  Contact and policies
                </h2>
                <p className="text-muted2" style={{ fontSize: 14, lineHeight: 1.75 }}>
                  You can reach us for data corrections or partnership requests on the <Link href="/contact" className="text-green no-underline hover:underline">contact page</Link>.
                  Please also review our <Link href="/privacy" className="text-green no-underline hover:underline">privacy policy</Link> and <Link href="/terms" className="text-green no-underline hover:underline">terms of service</Link>.
                </p>
              </section>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}