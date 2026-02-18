import Link from "next/link";
import type { BrandData } from "@/lib/types";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { getBrandBySlug } from "@/data/brands";

interface Props {
  currentSlug: string;
  category: string;
  brands: BrandData[];
}

/**
 * Shows alternative brands that are currently OPEN in the same category.
 * Critical for retention: when a brand is closed, guide users to open alternatives
 * instead of them bouncing back to Google.
 */
export default function AlternativesOpen({ currentSlug, category, brands }: Props) {
  const openAlternatives = brands
    .filter((b) => b.slug !== currentSlug)
    .map((b) => {
      const data = getBrandBySlug(b.slug);
      if (!data) return null;
      const status = computeOpenStatus(data.hours, "America/New_York", data.brand.is24h);
      return status.isOpen ? { brand: b, closesIn: status.closesIn } : null;
    })
    .filter(Boolean) as { brand: BrandData; closesIn: string | null }[];

  if (openAlternatives.length === 0) return null;

  return (
    <section className="ui-panel overflow-hidden">
      <div className="card-title-row">
        <h3 className="font-heading font-bold text-sm tracking-[-0.01em] text-text flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green" />
          Open now in {category}
        </h3>
      </div>

      <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
        {openAlternatives.slice(0, 6).map(({ brand: b, closesIn }) => (
          <Link
            key={b.slug}
            href={`/is-${b.slug}-open`}
            className="no-underline rounded-xl border border-border bg-bg2 hover:border-green/30 hover:bg-bg3 transition-colors p-4 flex items-center gap-3.5"
          >
            <span className="text-[24px] leading-none shrink-0">{b.emoji || "🏪"}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-text truncate">{b.name}</div>
              {closesIn && (
                <div className="text-[11px] text-muted2 font-mono mt-0.5">
                  Closes in {closesIn}
                </div>
              )}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green bg-green-dim border border-green/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green" />
              Open
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
