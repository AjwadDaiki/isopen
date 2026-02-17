import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — IsItOpen",
  description: "Terms of service for IsItOpen.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="page-pad" style={{ paddingTop: 48, paddingBottom: 64 }}>
          <div style={{ maxWidth: 680 }}>
            <h1
              className="font-heading font-extrabold text-text"
              style={{ fontSize: 32, letterSpacing: "-0.04em", marginBottom: 32 }}
            >
              Terms of Service
            </h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <p className="font-mono text-muted" style={{ fontSize: 12 }}>Last updated: February 2026</p>

              <Section title="1. Service Description">
                <p>IsItOpen (&quot;the Service&quot;) provides real-time information about store and business opening hours. The information is provided for general reference purposes only.</p>
              </Section>

              <Section title="2. Accuracy of Information">
                <p>While we strive to provide accurate opening hours, we cannot guarantee that all information is correct at all times. Opening hours may vary by location, season, or special circumstances. Always verify with the business directly for critical visits.</p>
              </Section>

              <Section title="3. User Reports">
                <p>Users can submit reports about store status. By submitting a report, you:</p>
                <ul>
                  <li>Confirm the information is truthful to the best of your knowledge</li>
                  <li>Grant us the right to use, display, and share the report</li>
                  <li>Agree not to submit false, misleading, or spam reports</li>
                </ul>
              </Section>

              <Section title="4. Intellectual Property">
                <p>The IsItOpen name, logo, and website design are our property. Brand names, logos, and trademarks mentioned on this site belong to their respective owners. We are not affiliated with any of the brands listed.</p>
              </Section>

              <Section title="5. Limitation of Liability">
                <p>The Service is provided &quot;as is&quot; without warranties of any kind. We are not liable for any losses or damages arising from use of the Service, including but not limited to reliance on opening hours information.</p>
              </Section>

              <Section title="6. Advertisements">
                <p>The Service displays third-party advertisements. We are not responsible for the content of these advertisements or the products/services they promote.</p>
              </Section>

              <Section title="7. Changes to Terms">
                <p>We may update these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
              </Section>

              <Section title="8. Contact">
                <p>For questions about these terms, contact: <strong className="text-text">legal@isopenow.com</strong></p>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-heading font-bold text-text" style={{ fontSize: 18, marginBottom: 12 }}>{title}</h2>
      <div className="text-muted2 legal-content" style={{ fontSize: 14, lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </section>
  );
}
