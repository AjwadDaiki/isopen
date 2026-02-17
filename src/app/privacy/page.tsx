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
        <div className="page-pad pt-12 pb-14">
          <div className="max-w-[760px] content-stack">
            <section className="ui-panel overflow-hidden">
              <div className="panel-body-lg">
                <h1 className="font-heading font-extrabold text-[34px] tracking-[-0.04em] text-text">
                  Privacy Policy
                </h1>
                <p className="font-mono text-muted text-[12px] mt-4">
                  Last updated: February 17, 2026
                </p>
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="panel-body flex flex-col gap-6">
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
            </section>
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
      <h2 className="font-heading font-bold text-text text-[18px] mb-3">
        {title}
      </h2>
      <div className="text-muted2 legal-content text-[14px] leading-relaxed flex flex-col gap-2">
        {children}
      </div>
    </section>
  );
}
