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
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-12">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight mb-8 text-text">About IsItOpen</h1>

          <div className="space-y-4">
            <div className="bg-bg1 border border-border rounded-2xl p-6">
              <h2 className="font-heading text-lg font-bold mb-3 text-text">The simplest answer to a simple question</h2>
              <p className="text-sm text-muted2 leading-relaxed">
                &quot;Is McDonald&apos;s open right now?&quot; &mdash; You&apos;ve searched this before. Everyone has.
                IsItOpen gives you the answer in under a second: a big green <strong className="text-green">OPEN</strong> or
                red <strong className="text-red">CLOSED</strong>, plus the exact hours, countdown to closing, and holiday schedules.
              </p>
            </div>

            <div className="bg-bg1 border border-border rounded-2xl p-6">
              <h2 className="font-heading text-lg font-bold mb-3 text-text">How it works</h2>
              <div className="space-y-3 text-sm text-muted2">
                <div className="flex gap-3">
                  <span className="text-lg text-text">1.</span>
                  <p>We maintain a database of standard opening hours for major brands across the US.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg text-text">2.</span>
                  <p>Your browser tells us your timezone, and we check the current time against the schedule.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg text-text">3.</span>
                  <p>We factor in holidays, special hours, and community reports to give you the most accurate answer.</p>
                </div>
              </div>
            </div>

            <div className="bg-bg1 border border-border rounded-2xl p-6">
              <h2 className="font-heading text-lg font-bold mb-3 text-text">Built with</h2>
              <div className="flex flex-wrap gap-2">
                {["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Vercel", "date-fns"].map((tech) => (
                  <span key={tech} className="font-mono text-xs bg-bg2 border border-border rounded-lg px-3 py-1.5 text-muted2">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-green text-black font-bold text-sm px-6 py-3 rounded-lg no-underline hover:opacity-90 transition-colors"
              >
                Check a store now
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
