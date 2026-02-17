import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="bg-bg min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-3xl font-black tracking-tight mb-3">
            Brand not found
          </h1>
          <p className="text-ink3 mb-8 leading-relaxed">
            We couldn&apos;t find hours for this place. It might not be in our
            database yet. Try searching for another brand.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-ink text-bg rounded-lg px-6 py-3 font-semibold text-sm no-underline hover:bg-ink/80 transition-colors"
          >
            ← Back to homepage
          </Link>
        </div>
      </div>
    </>
  );
}
