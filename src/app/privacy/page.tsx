import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - IsItOpen",
  description: "Privacy policy for IsItOpen. Learn what data is collected and how it is used.",
  alternates: {
    canonical: "https://isopenow.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy - IsItOpen",
    description: "Privacy policy for IsItOpen.",
    url: "https://isopenow.com/privacy",
    type: "website",
  },
};

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>

            <p className="font-mono text-muted" style={{ fontSize: 12, marginBottom: 24 }}>
              Last updated: February 17, 2026
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Section title="1. Information We Collect">
                <p>We collect only data needed to operate the service:</p>
                <ul>
                  <li><strong className="text-text">Automatic data:</strong> timezone, browser type, and approximate region derived from IP.</li>
                  <li><strong className="text-text">User reports:</strong> report type, optional message, and timestamp for quality checks.</li>
                  <li><strong className="text-text">Cookies:</strong> essential cookies and analytics or advertising cookies where applicable.</li>
                </ul>
              </Section>

              <Section title="2. How We Use Data">
                <ul>
                  <li>Display opening status based on local timezone logic</li>
                  <li>Improve accuracy through user reports and monitoring</li>
                  <li>Measure usage and improve site performance</li>
                  <li>Serve advertisements through Google AdSense</li>
                </ul>
              </Section>

              <Section title="3. Third-Party Services">
                <ul>
                  <li><strong className="text-text">Google Analytics:</strong> traffic and usage analytics</li>
                  <li><strong className="text-text">Google AdSense:</strong> ad delivery and monetization</li>
                  <li><strong className="text-text">Vercel:</strong> hosting infrastructure</li>
                  <li><strong className="text-text">Supabase:</strong> database and backend services</li>
                </ul>
              </Section>

              <Section title="4. Data Retention">
                <p>
                  Reports are retained to maintain historical quality checks. Analytics retention depends on the
                  corresponding provider settings.
                </p>
              </Section>

              <Section title="5. Your Rights">
                <ul>
                  <li>You can disable cookies in your browser settings</li>
                  <li>You can request data deletion for submitted report content</li>
                  <li>You can contact us for privacy questions or requests</li>
                </ul>
              </Section>

              <Section title="6. Contact">
                <p>
                  For privacy questions, contact: <strong className="text-text">privacy@isopenow.com</strong>
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