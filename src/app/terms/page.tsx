import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service - IsItOpen",
  description: "Terms of service for using IsItOpen.",
  alternates: {
    canonical: "https://isopenow.com/terms",
  },
  openGraph: {
    title: "Terms of Service - IsItOpen",
    description: "Terms of service for using IsItOpen.",
    url: "https://isopenow.com/terms",
    type: "website",
  },
};

export default function TermsPage() {
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
              Terms of Service
            </h1>

            <p className="font-mono text-muted" style={{ fontSize: 12, marginBottom: 24 }}>
              Last updated: February 17, 2026
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Section title="1. Service Description">
                <p>
                  IsItOpen provides opening-hours information for reference purposes. Hours may vary by location,
                  season, and special events.
                </p>
              </Section>

              <Section title="2. Accuracy Disclaimer">
                <p>
                  We work to keep information accurate, but no uptime or accuracy guarantee is provided. For critical
                  visits, verify directly with the business.
                </p>
              </Section>

              <Section title="3. User Reports">
                <ul>
                  <li>Reports must be truthful and non-spam</li>
                  <li>Submitted reports may be displayed for quality and moderation purposes</li>
                  <li>Abuse may lead to report filtering or blocking</li>
                </ul>
              </Section>

              <Section title="4. Intellectual Property">
                <p>
                  IsItOpen branding and site content are protected. Third-party brand names and trademarks belong to
                  their respective owners.
                </p>
              </Section>

              <Section title="5. Limitation of Liability">
                <p>
                  The service is provided as is without warranties. We are not liable for damages caused by reliance on
                  opening-hours information.
                </p>
              </Section>

              <Section title="6. Advertising">
                <p>
                  The site displays third-party ads. We are not responsible for external advertiser claims or offers.
                </p>
              </Section>

              <Section title="7. Changes to Terms">
                <p>We may update these terms at any time. Continued use implies acceptance of the updated terms.</p>
              </Section>

              <Section title="8. Contact">
                <p>
                  For legal questions: <strong className="text-text">legal@isopenow.com</strong>
                </p>
              </Section>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-heading font-bold text-text" style={{ fontSize: 18, marginBottom: 12 }}>
        {title}
      </h2>
      <div className="text-muted2 legal-content" style={{ fontSize: 14, lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </section>
  );
}