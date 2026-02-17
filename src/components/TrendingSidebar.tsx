import Link from "next/link";
import { brandsData } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";

const TRENDING_SLUGS = [
  "walmart",
  "post-office",
  "costco",
  "stock-market",
  "cvs",
  "starbucks",
];

export default function TrendingSidebar() {
  return (
    <div className="bg-bg1 border border-border rounded-2xl overflow-hidden">
      <div className="card-title-row">
        <h3 className="font-heading font-bold text-sm tracking-[-0.01em] flex items-center gap-2 text-text">
          <span>🔥</span> Trending right now
        </h3>
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
              className="flex items-center gap-3 px-5 py-2.5 hover:bg-bg2 transition-colors no-underline"
            >
              <span className="font-mono text-[11px] text-muted w-4 text-right shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[13px] font-medium flex-1 text-text">
                {data.brand.name}
              </span>
              <span
                className={`w-[7px] h-[7px] rounded-full shrink-0 ${
                  status.isOpen ? "bg-green" : "bg-red"
                }`}
                style={status.isOpen ? { boxShadow: "0 0 6px var(--color-green-glow)" } : {}}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
