import Navbar from "@/components/Navbar";
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
      <div className="bg-bg min-h-screen">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-3xl font-black tracking-tight mb-8">About IsItOpen</h1>

          <div className="space-y-8">
            <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-3">The simplest answer to a simple question</h2>
              <p className="text-sm text-ink2 leading-relaxed">
                &quot;Is McDonald&apos;s open right now?&quot; &mdash; You&apos;ve searched this before. Everyone has.
                IsItOpen gives you the answer in under a second: a big green <strong>OPEN</strong> or
                red <strong>CLOSED</strong>, plus the exact hours, countdown to closing, and holiday schedules.
              </p>
            </div>

            <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-3">How it works</h2>
              <div className="space-y-3 text-sm text-ink2">
                <div className="flex gap-3">
                  <span className="text-lg">1.</span>
                  <p>We maintain a database of standard opening hours for major brands across the US.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">2.</span>
                  <p>Your browser tells us your timezone, and we check the current time against the schedule.</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-lg">3.</span>
                  <p>We factor in holidays, special hours, and community reports to give you the most accurate answer.</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-3">Community-powered accuracy</h2>
              <p className="text-sm text-ink2 leading-relaxed">
                Hours can vary by location and season. That&apos;s why every brand page has a
                report button &mdash; if a store&apos;s hours are wrong, tell us and we&apos;ll fix it.
                Together, we keep the data accurate.
              </p>
            </div>

            <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-3">Built with</h2>
              <div className="flex flex-wrap gap-2">
                {["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Vercel", "date-fns"].map((tech) => (
                  <span key={tech} className="font-mono text-xs bg-bg border border-ink/10 rounded-lg px-3 py-1.5 text-ink2">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-green text-white font-bold text-sm px-6 py-3 rounded-lg no-underline hover:bg-green/90 transition-colors"
              >
                Check a store now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
