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
    <div className="bg-bg1 border border-border rounded-2xl overflow-hidden">
      <div className="card-title-row">
        <h3 className="font-heading font-bold text-sm tracking-[-0.01em] flex items-center gap-2 text-text">
          <span>👀</span> People also checked
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: "1px", background: "var(--color-border)" }}>
        {brands.map((b) => {
          const data = getBrandBySlug(b.slug);
          let isOpen = false;
          if (data) {
            const status = computeOpenStatus(
              data.hours,
              "America/New_York",
              data.brand.is24h
            );
            isOpen = status.isOpen;
          }

          return (
            <Link
              key={b.slug}
              href={`/is-${b.slug}-open`}
              className="bg-bg1 p-4 flex flex-col items-center gap-1.5 no-underline hover:bg-bg2 transition-colors cursor-pointer"
            >
              <span className="text-[22px]">{b.emoji || "🏪"}</span>
              <span className="text-xs font-heading font-semibold text-text text-center">
                {b.name}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOpen ? "bg-green" : "bg-red"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
