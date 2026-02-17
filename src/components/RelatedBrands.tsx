import Link from "next/link";
import type { BrandData } from "@/lib/types";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { getBrandBySlug } from "@/data/brands";

interface Props {
  brands: BrandData[];
}

export default function RelatedBrands({ brands }: Props) {
  if (brands.length === 0) return null;

  return (
    <section className="ui-panel overflow-hidden">
      <div className="card-title-row">
        <h3 className="font-heading font-bold text-[15px] tracking-[-0.01em] flex items-center gap-2 text-text">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted2">Also</span>
          People also checked
        </h3>
      </div>

      <div className="panel-body grid grid-cols-2 gap-3">
        {brands.map((b) => {
          const data = getBrandBySlug(b.slug);
          let isOpen = false;
          if (data) {
            const status = computeOpenStatus(data.hours, "America/New_York", data.brand.is24h);
            isOpen = status.isOpen;
          }

          return (
            <Link
              key={b.slug}
              href={`/is-${b.slug}-open`}
              className="no-underline rounded-xl border border-border bg-bg2/55 hover:bg-bg2 hover:border-border2 transition-colors p-3.5 flex flex-col items-start gap-2"
            >
              <div className="w-full flex items-center justify-between gap-2">
                <span className="text-[22px] leading-none">{b.emoji || "Store"}</span>
                <span
                  className={`inline-flex rounded-full px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.08em] ${
                    isOpen ? "text-green bg-green-dim border border-green/25" : "text-red bg-red-dim border border-red/25"
                  }`}
                >
                  {isOpen ? "Open" : "Closed"}
                </span>
              </div>

              <span className="text-[13px] leading-snug font-semibold text-text">{b.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
