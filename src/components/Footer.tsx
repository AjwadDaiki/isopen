import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";

/**
 * Footer with authority silo structure.
 * Links only to indexable, high-value pages.
 * Avoids linking to noindex pages (embed, search, blocked locales).
 *
 * Silo architecture:
 *  - Hours Hub: brand pages, category, near-me
 *  - Late Night / 24h: late-night and always-open intent
 *  - Holidays: holiday intent cluster
 *  - Geo: city + state coverage
 *  - Blog: authority content
 */

const SILOS = [
  {
    title: "Hours Hub",
    links: [
      { href: "/brand/mcdonalds", label: "McDonald's Hours" },
      { href: "/brand/walmart", label: "Walmart Hours" },
      { href: "/brand/starbucks", label: "Starbucks Hours" },
      { href: "/brand/cvs", label: "CVS Hours" },
      { href: "/brand/walgreens", label: "Walgreens Hours" },
      { href: "/brand/target", label: "Target Hours" },
      { href: "/category/fast-food", label: "Fast Food Hours" },
      { href: "/near-me", label: "Open Near Me" },
    ],
  },
  {
    title: "Late Night & 24h",
    links: [
      { href: "/open-late", label: "Stores Open Late" },
      { href: "/open-late/fast-food", label: "Fast Food Open Late" },
      { href: "/open-late/pharmacy", label: "Pharmacy Open Late" },
      { href: "/open-24h", label: "24 Hour Stores" },
      { href: "/near-me/pharmacy", label: "Pharmacy Near Me" },
      { href: "/near-me/grocery", label: "Grocery Near Me" },
    ],
  },
  {
    title: "Holiday Hours",
    links: [
      { href: "/holiday", label: "All Holiday Hours" },
      { href: "/holiday/christmas", label: "Christmas Day Hours" },
      { href: "/holiday/thanksgiving", label: "Thanksgiving Hours" },
      { href: "/holiday/new-years", label: "New Year's Hours" },
      { href: "/holiday/black-friday", label: "Black Friday Hours" },
      { href: "/holiday/easter", label: "Easter Hours" },
    ],
  },
  {
    title: "By Location",
    links: [
      { href: "/city", label: "Browse by City" },
      { href: "/state", label: "Browse by State" },
      { href: "/city/new-york", label: "New York" },
      { href: "/city/los-angeles", label: "Los Angeles" },
      { href: "/city/chicago", label: "Chicago" },
      { href: "/city/houston", label: "Houston" },
    ],
  },
  {
    title: "Guides & Blog",
    links: [
      { href: "/blog", label: "Store Hours Blog" },
      { href: "/blog/top-10-stores-open-late", label: "Top 10 Late Night Stores" },
      { href: "/blog/24h-stores-near-you", label: "24h Stores Guide" },
      { href: "/blog/holiday-opening-hours", label: "Holiday Hours Guide" },
    ],
  },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border page-pad" style={{ paddingTop: 52, paddingBottom: 48 }}>
      <div className="ui-panel" style={{ padding: "32px 30px" }}>

        {/* Silo link grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
          {SILOS.map((silo) => (
            <div key={silo.title}>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-3">
                {silo.title}
              </p>
              <ul className="flex flex-col gap-2">
                {silo.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[12px] text-muted2 no-underline hover:text-text transition-colors leading-tight block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-start">
            <div>
              <Link href="/" className="font-heading font-extrabold text-xl text-green tracking-tight no-underline inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green animate-pulse-dot" style={{ boxShadow: "0 0 10px var(--color-green-glow)" }} />
                isopenow
              </Link>
              <p className="mt-3 text-[13px] leading-relaxed text-muted2 max-w-[45ch]">
                Real-time opening hours for every major US store. Live status, holiday schedules, and local checks.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-muted">
                <Link href="/about" className="no-underline text-muted hover:text-text transition-colors">About</Link>
                <Link href="/contact" className="no-underline text-muted hover:text-text transition-colors">Contact</Link>
                <Link href="/privacy" className="no-underline text-muted hover:text-text transition-colors">Privacy</Link>
                <Link href="/terms" className="no-underline text-muted hover:text-text transition-colors">Terms</Link>
              </div>
            </div>

            <div className="lg:justify-self-end w-full max-w-[420px]">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-3">Language</p>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-border text-center font-mono text-[11px] ui-text-muted-soft">
          Real-time opening hours for any store · {year}
        </div>
      </div>
    </footer>
  );
}
