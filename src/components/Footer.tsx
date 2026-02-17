import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border page-pad" style={{ paddingTop: 32, paddingBottom: 32 }}>
      <div>
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

        <div className="mb-4">
          <LanguageSwitcher />
        </div>

        <div className="text-center font-mono text-[11px] text-muted/60">
          Real-time opening hours for any store &middot; {year}
        </div>
      </div>
    </footer>
  );
}
