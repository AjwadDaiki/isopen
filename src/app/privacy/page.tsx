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
      <div className="bg-bg min-h-screen">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-3xl font-black tracking-tight mb-8">Privacy Policy</h1>
          <div className="prose prose-sm text-ink2 space-y-6">
            <p className="text-ink3 font-mono text-xs">Last updated: February 2026</p>

            <section>
              <h2 className="text-lg font-bold text-ink mt-8 mb-3">1. Information We Collect</h2>
              <p>IsItOpen (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects minimal information to provide our service:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Automatic data:</strong> Timezone, browser type, and general location (country/region) derived from your IP address. We do not store your IP address.</li>
                <li><strong>User reports:</strong> When you submit a report about a store&apos;s status, we store the report type, optional message, and timestamp. No personal identification is collected.</li>
                <li><strong>Cookies:</strong> We use essential cookies for site functionality and analytics cookies (Google Analytics) to understand usage patterns.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink mt-8 mb-3">2. How We Use Information</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Display real-time store opening status based on your timezone</li>
                <li>Improve accuracy of opening hours through community reports</li>
                <li>Analyze site usage to improve the service</li>
                <li>Display relevant advertisements through Google AdSense</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink mt-8 mb-3">3. Third-Party Services</h2>
              <p className="text-sm">We use the following third-party services:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Google Analytics:</strong> For usage analytics. See <a href="https://policies.google.com/privacy" className="text-green underline">Google&apos;s Privacy Policy</a>.</li>
                <li><strong>Google AdSense:</strong> For displaying advertisements. AdSense may use cookies to serve ads based on your interests.</li>
                <li><strong>Vercel:</strong> Our hosting provider. See <a href="https://vercel.com/legal/privacy-policy" className="text-green underline">Vercel&apos;s Privacy Policy</a>.</li>
                <li><strong>Supabase:</strong> Our database provider. See <a href="https://supabase.com/privacy" className="text-green underline">Supabase&apos;s Privacy Policy</a>.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink mt-8 mb-3">4. Data Retention</h2>
              <p className="text-sm">User reports are stored indefinitely to improve service accuracy. Analytics data is retained according to Google Analytics default settings (26 months).</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink mt-8 mb-3">5. Your Rights</h2>
              <p className="text-sm">You can:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Disable cookies in your browser settings</li>
                <li>Opt out of Google Analytics using the <a href="https://tools.google.com/dlpage/gaoptout" className="text-green underline">Google Analytics Opt-out Browser Add-on</a></li>
                <li>Request deletion of any reports you&apos;ve submitted by contacting us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink mt-8 mb-3">6. Contact</h2>
              <p className="text-sm">For privacy-related questions, contact us at: <strong>privacy@isopenow.com</strong></p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
