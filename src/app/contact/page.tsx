import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact - IsItOpen",
  description:
    "Contact IsItOpen for data corrections, partnership requests, privacy questions, and support.",
  alternates: {
    canonical: "https://isopenow.com/contact",
  },
  openGraph: {
    title: "Contact - IsItOpen",
    description:
      "Contact IsItOpen for data corrections, partnership requests, privacy questions, and support.",
    url: "https://isopenow.com/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="page-pad pt-12 pb-14">
          <div className="max-w-[760px] content-stack">
            <section className="ui-panel overflow-hidden">
              <div className="panel-body-lg">
                <h1 className="font-heading font-extrabold text-[34px] tracking-[-0.04em] text-text">
                  Contact IsItOpen
                </h1>
                <p className="text-muted2 text-[15px] leading-relaxed mt-4">
                  Need to report inaccurate hours, request a brand update, or ask a business question? Reach out and the
                  team will review your request.
                </p>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ContactCard
                title="General support"
                description="Questions about pages, features, and usage."
                value="support@isopenow.com"
                href="mailto:support@isopenow.com"
              />
              <ContactCard
                title="Data corrections"
                description="Opening hours updates and report follow-up."
                value="data@isopenow.com"
                href="mailto:data@isopenow.com"
              />
              <ContactCard
                title="Privacy requests"
                description="Requests related to privacy and data rights."
                value="privacy@isopenow.com"
                href="mailto:privacy@isopenow.com"
              />
              <ContactCard
                title="Legal and policy"
                description="Legal notices and policy questions."
                value="legal@isopenow.com"
                href="mailto:legal@isopenow.com"
              />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

function ContactCard({
  title,
  description,
  value,
  href,
}: {
  title: string;
  description: string;
  value: string;
  href: string;
}) {
  return (
    <article className="ui-panel overflow-hidden">
      <div className="panel-body">
        <h2 className="font-heading font-bold text-text text-[17px] mb-2">
          {title}
        </h2>
        <p className="text-muted2 text-[13px] leading-relaxed mb-3.5">
          {description}
        </p>
        <a href={href} className="text-green font-semibold no-underline hover:underline">
          {value}
        </a>
      </div>
    </article>
  );
}
