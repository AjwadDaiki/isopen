import Link from "next/link";
import { brandsData } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";

const TRENDING_SLUGS = [
  "walmart",
  "post-office",
  "costco",
  "stock-market",
  "cvs",
];

export default function TrendingSidebar() {
  return (
    <div className="bg-white border border-ink/10 rounded-xl overflow-hidden shadow-sm mb-4">
      <div className="px-4 py-3.5 border-b border-ink/10 text-[13px] font-bold flex items-center gap-2">
        🔥 Trending right now
      </div>
      <div className="py-2">
        {TRENDING_SLUGS.map((slug, i) => {
          const data = brandsData.find((b) => b.brand.slug === slug);
          if (!data) return null;
          const status = computeOpenStatus(
            data.hours,
            "America/New_York",
            data.brand.is24h
          );

          return (
            <Link
              key={slug}
              href={`/is-${slug}-open`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg transition-colors border-b border-ink/10 last:border-b-0 no-underline"
            >
              <span className="font-mono text-[11px] text-ink3 w-[18px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[13px] font-semibold flex-1 text-ink">
                {data.brand.name}
              </span>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  status.isOpen ? "bg-green" : "bg-red"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
