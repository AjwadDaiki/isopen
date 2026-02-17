import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — IsItOpen",
  description: "Privacy policy for IsItOpen. Learn how we handle your data.",
};

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <p className="font-mono text-muted" style={{ fontSize: 12 }}>Last updated: February 2026</p>

              <Section title="1. Information We Collect">
                <p>IsItOpen (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects minimal information to provide our service:</p>
                <ul>
                  <li><strong className="text-text">Automatic data:</strong> Timezone, browser type, and general location (country/region) derived from your IP address. We do not store your IP address.</li>
                  <li><strong className="text-text">User reports:</strong> When you submit a report about a store&apos;s status, we store the report type, optional message, and timestamp. No personal identification is collected.</li>
                  <li><strong className="text-text">Cookies:</strong> We use essential cookies for site functionality and analytics cookies (Google Analytics) to understand usage patterns.</li>
                </ul>
              </Section>

              <Section title="2. How We Use Information">
                <ul>
                  <li>Display real-time store opening status based on your timezone</li>
                  <li>Improve accuracy of opening hours through community reports</li>
                  <li>Analyze site usage to improve the service</li>
                  <li>Display relevant advertisements through Google AdSense</li>
                </ul>
              </Section>

              <Section title="3. Third-Party Services">
                <p>We use the following third-party services:</p>
                <ul>
                  <li><strong className="text-text">Google Analytics:</strong> For usage analytics. See <a href="https://policies.google.com/privacy" className="text-green underline">Google&apos;s Privacy Policy</a>.</li>
                  <li><strong className="text-text">Google AdSense:</strong> For displaying advertisements. AdSense may use cookies to serve ads based on your interests.</li>
                  <li><strong className="text-text">Vercel:</strong> Our hosting provider. See <a href="https://vercel.com/legal/privacy-policy" className="text-green underline">Vercel&apos;s Privacy Policy</a>.</li>
                  <li><strong className="text-text">Supabase:</strong> Our database provider. See <a href="https://supabase.com/privacy" className="text-green underline">Supabase&apos;s Privacy Policy</a>.</li>
                </ul>
              </Section>

              <Section title="4. Data Retention">
                <p>User reports are stored indefinitely to improve service accuracy. Analytics data is retained according to Google Analytics default settings (26 months).</p>
              </Section>

              <Section title="5. Your Rights">
                <p>You can:</p>
                <ul>
                  <li>Disable cookies in your browser settings</li>
                  <li>Opt out of Google Analytics using the <a href="https://tools.google.com/dlpage/gaoptout" className="text-green underline">Google Analytics Opt-out Browser Add-on</a></li>
                  <li>Request deletion of any reports you&apos;ve submitted by contacting us</li>
                </ul>
              </Section>

              <Section title="6. Contact">
                <p>For privacy-related questions, contact us at: <strong className="text-text">privacy@isopenow.com</strong></p>
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
