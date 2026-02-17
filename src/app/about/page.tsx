import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — IsItOpen",
  description: "About IsItOpen: instantly check if any store, restaurant, or service is open right now.",
};

export default function AboutPage() {
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
              About IsItOpen
            </h1>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "var(--color-bg1)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 24 }}>
                <h2 className="font-heading font-bold text-text" style={{ fontSize: 18, marginBottom: 12 }}>
                  The simplest answer to a simple question
                </h2>
                <p className="text-muted2" style={{ fontSize: 14, lineHeight: 1.7 }}>
                  &quot;Is McDonald&apos;s open right now?&quot; &mdash; You&apos;ve searched this before. Everyone has.
                  IsItOpen gives you the answer in under a second: a big green <strong className="text-green">OPEN</strong> or
                  red <strong className="text-red">CLOSED</strong>, plus the exact hours, countdown to closing, and holiday schedules.
                </p>
              </div>

              <div style={{ background: "var(--color-bg1)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 24 }}>
                <h2 className="font-heading font-bold text-text" style={{ fontSize: 18, marginBottom: 12 }}>
                  How it works
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    "We maintain a database of standard opening hours for major brands across the US.",
                    "Your browser tells us your timezone, and we check the current time against the schedule.",
                    "We factor in holidays, special hours, and community reports to give you the most accurate answer.",
                  ].map((text, i) => (
                    <div key={i} className="flex text-muted2" style={{ gap: 12, fontSize: 14, lineHeight: 1.7 }}>
                      <span className="text-text font-heading font-bold" style={{ fontSize: 18 }}>{i + 1}.</span>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "var(--color-bg1)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 24 }}>
                <h2 className="font-heading font-bold text-text" style={{ fontSize: 18, marginBottom: 12 }}>Built with</h2>
                <div className="flex flex-wrap" style={{ gap: 8 }}>
                  {["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Vercel", "date-fns"].map((tech) => (
                    <span key={tech} className="font-mono text-muted2" style={{ fontSize: 12, background: "var(--color-bg2)", border: "1px solid var(--color-border)", borderRadius: 8, padding: "6px 12px" }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: "center", paddingTop: 16 }}>
                <Link
                  href="/"
                  className="no-underline inline-flex items-center font-bold hover:opacity-90 transition-opacity"
                  style={{ gap: 8, background: "var(--color-green)", color: "#000", fontSize: 14, padding: "12px 24px", borderRadius: 8 }}
                >
                  Check a store now
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
