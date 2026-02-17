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
    <div className="bg-white border border-ink/10 rounded-xl mb-4 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-ink/10">
        <h2 className="text-[15px] font-bold tracking-tight flex items-center gap-2">
          <span>🔍</span> People also checked
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-4">
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
              className="bg-bg border border-ink/10 rounded-lg p-3 hover:bg-bg2 hover:-translate-y-0.5 hover:shadow-md transition-all flex flex-col items-center gap-1.5 no-underline"
            >
              <span className="text-xl">{b.emoji || "🏪"}</span>
              <span className="text-xs font-bold text-ink text-center">
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
