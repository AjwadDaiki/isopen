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
      <div className="bg-bg min-h-screen">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-3xl font-black tracking-tight mb-8">Terms of Service</h1>
          <div className="prose prose-sm text-ink2 space-y-6">
            <p className="text-ink3 font-mono text-xs">Last updated: February 2026</p>

            <section>
              <h2 className="text-lg font-bold text-ink mt-8 mb-3">1. Service Description</h2>
              <p className="text-sm">IsItOpen (&quot;the Service&quot;) provides real-time information about store and business opening hours. The information is provided for general reference purposes only.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink mt-8 mb-3">2. Accuracy of Information</h2>
              <p className="text-sm">While we strive to provide accurate opening hours, we cannot guarantee that all information is correct at all times. Opening hours may vary by location, season, or special circumstances. Always verify with the business directly for critical visits.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink mt-8 mb-3">3. User Reports</h2>
              <p className="text-sm">Users can submit reports about store status. By submitting a report, you:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Confirm the information is truthful to the best of your knowledge</li>
                <li>Grant us the right to use, display, and share the report</li>
                <li>Agree not to submit false, misleading, or spam reports</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink mt-8 mb-3">4. Intellectual Property</h2>
              <p className="text-sm">The IsItOpen name, logo, and website design are our property. Brand names, logos, and trademarks mentioned on this site belong to their respective owners. We are not affiliated with any of the brands listed.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink mt-8 mb-3">5. Limitation of Liability</h2>
              <p className="text-sm">The Service is provided &quot;as is&quot; without warranties of any kind. We are not liable for any losses or damages arising from use of the Service, including but not limited to reliance on opening hours information.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink mt-8 mb-3">6. Advertisements</h2>
              <p className="text-sm">The Service displays third-party advertisements. We are not responsible for the content of these advertisements or the products/services they promote.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink mt-8 mb-3">7. Changes to Terms</h2>
              <p className="text-sm">We may update these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-ink mt-8 mb-3">8. Contact</h2>
              <p className="text-sm">For questions about these terms, contact: <strong>legal@isopenow.com</strong></p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
