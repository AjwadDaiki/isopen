import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="page-pad" style={{ paddingTop: 64, paddingBottom: 72 }}>
          <section className="ui-panel text-center" style={{ padding: "52px 24px", maxWidth: 680, margin: "0 auto" }}>
            <h1 className="font-heading font-extrabold text-text" style={{ fontSize: 40, letterSpacing: "-0.04em", marginBottom: 14 }}>
              Page not found
            </h1>
            <p className="text-muted2" style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 24 }}>
              The page you requested does not exist or may have moved.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-green text-black rounded-lg px-6 py-3 font-semibold text-sm no-underline hover:brightness-95 transition-[filter]"
            >
              Back to homepage
            </Link>
          </section>
        </div>
        <Footer />
      </div>
    </>
  );
}
