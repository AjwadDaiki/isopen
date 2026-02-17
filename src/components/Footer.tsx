import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-8 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <Link href="/" className="font-heading font-extrabold text-lg text-green tracking-tight no-underline">
            isopenow
          </Link>
          <div className="flex items-center gap-4 font-mono text-[11px] text-muted">
            <Link href="/about" className="no-underline text-muted hover:text-text transition-colors">About</Link>
            <Link href="/privacy" className="no-underline text-muted hover:text-text transition-colors">Privacy</Link>
            <Link href="/terms" className="no-underline text-muted hover:text-text transition-colors">Terms</Link>
          </div>
        </div>
        <div className="text-center font-mono text-[11px] text-muted/60">
          Real-time opening hours for any store &middot; {year}
        </div>
      </div>
    </footer>
  );
}
