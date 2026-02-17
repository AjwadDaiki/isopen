"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { brandsData } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { buildBrandUrl } from "@/lib/i18n/url-patterns";

export default function SearchPageClient() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return brandsData;
    const q = query.toLowerCase();
    return brandsData.filter(
      (b) =>
        b.brand.name.toLowerCase().includes(q) ||
        b.brand.slug.includes(q) ||
        b.brand.category?.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <>
      <div className="relative mb-7">
        <input
          type="text"
          placeholder="Search by name or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full bg-bg2 border border-border2 rounded-xl px-5 py-4 text-sm text-text outline-none focus:border-green transition-all placeholder:text-muted"
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted text-sm">
          {results.length} result{results.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {results.map(({ brand, hours }) => {
          const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
          const isOpen = status.isOpen;

          return (
            <Link
              key={brand.slug}
              href={buildBrandUrl("en", brand.slug)}
              className={`brand-card-link brand-card-premium p-5 no-underline flex items-center gap-3.5 ${isOpen ? "brand-card-open" : "brand-card-closed"}`}
            >
              <span className="text-2xl">{brand.emoji || "Store"}</span>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-text truncate">{brand.name}</div>
                <div className="text-xs text-muted2">{brand.category}</div>
              </div>

              <span className={`brand-status-pill ${isOpen ? "brand-status-pill-open" : "brand-status-pill-closed"}`}>
                <span className="status-led" />
                {isOpen ? "Open" : "Closed"}
              </span>
            </Link>
          );
        })}
      </div>

      {results.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted2 text-sm">No stores found matching &quot;{query}&quot;</p>
          <p className="text-muted text-xs mt-2">Try a different search term</p>
        </div>
      )}
    </>
  );
}
