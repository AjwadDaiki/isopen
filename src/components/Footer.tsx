import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/10 py-8 px-4 sm:px-6 bg-bg">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <Link href="/" className="font-extrabold text-lg text-green tracking-tight no-underline">
            isitopen
          </Link>
          <div className="flex items-center gap-4 font-mono text-[11px] text-ink3">
            <Link href="/about" className="no-underline text-ink3 hover:text-ink">About</Link>
            <Link href="/privacy" className="no-underline text-ink3 hover:text-ink">Privacy</Link>
            <Link href="/terms" className="no-underline text-ink3 hover:text-ink">Terms</Link>
          </div>
        </div>
        <div className="text-center font-mono text-[11px] text-ink3/60">
          Real-time opening hours for any store &middot; {year}
        </div>
      </div>
    </footer>
  );
}
