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
    <section className="ui-panel overflow-hidden">
      <div className="card-title-row">
        <h3 className="font-heading font-bold text-[15px] tracking-[-0.01em] flex items-center gap-2 text-text">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-orange">Hot</span>
          Trending right now
        </h3>
      </div>

      <div className="panel-body flex flex-col gap-3">
        {TRENDING_SLUGS.map((slug, i) => {
          const data = brandsData.find((b) => b.brand.slug === slug);
          if (!data) return null;
          const status = computeOpenStatus(data.hours, "America/New_York", data.brand.is24h);

          return (
            <Link
              key={slug}
              href={`/is-${slug}-open`}
              className="no-underline rounded-xl border border-border ui-bg-2-55 hover:bg-bg2 hover:border-border2 transition-colors px-4 py-3.5 grid grid-cols-[auto_1fr_auto] items-center gap-3"
            >
              <span className="font-mono text-[11px] text-muted w-6 text-right shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <span className="text-[14px] leading-tight font-semibold block truncate text-text">{data.brand.name}</span>
                <span className={`text-[11px] font-medium ${status.isOpen ? "text-green" : "text-red"}`}>
                  {status.isOpen ? "Open now" : "Closed now"}
                </span>
              </div>

              <span
                className={`w-2 h-2 rounded-full shrink-0 ${status.isOpen ? "bg-green" : "bg-red"}`}
                style={status.isOpen ? { boxShadow: "0 0 8px var(--color-green-glow)" } : undefined}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
