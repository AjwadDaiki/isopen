import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border page-pad" style={{ paddingTop: 44, paddingBottom: 42 }}>
      <div className="ui-panel" style={{ padding: "28px 24px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-7 lg:gap-10 items-start">
          <div>
            <Link href="/" className="font-heading font-extrabold text-xl text-green tracking-tight no-underline inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse-dot" style={{ boxShadow: "0 0 10px var(--color-green-glow)" }} />
              isopenow
            </Link>
            <p className="mt-3 text-[13px] leading-relaxed text-muted2 max-w-[45ch]">
              Live opening hours by brand, localized pages, and weekly schedules designed for fast checks.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-muted">
              <Link href="/about" className="no-underline text-muted hover:text-text transition-colors">About</Link>
              <Link href="/contact" className="no-underline text-muted hover:text-text transition-colors">Contact</Link>
              <Link href="/privacy" className="no-underline text-muted hover:text-text transition-colors">Privacy</Link>
              <Link href="/terms" className="no-underline text-muted hover:text-text transition-colors">Terms</Link>
            </div>
          </div>

          <div className="lg:justify-self-end w-full max-w-[420px]">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-2">Language</p>
            <LanguageSwitcher />
          </div>
        </div>

        <div className="mt-7 pt-4 border-t border-border text-center font-mono text-[11px] ui-text-muted-soft">
          Real-time opening hours for any store - {year}
        </div>
      </div>
    </footer>
  );
}