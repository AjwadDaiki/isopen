"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { brandsData } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";

export default function SearchPage() {
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
      <Navbar />
      <div className="min-h-screen">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight mb-2 text-text">Search stores</h1>
          <p className="text-sm text-muted2 mb-8">
            Find any store, restaurant, or service and check if it&apos;s open right now.
          </p>

          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Search by name or category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-bg2 border border-border2 rounded-xl px-4 py-3.5 text-sm text-text outline-none focus:border-green transition-all placeholder:text-muted"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map(({ brand, hours }) => {
              const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
              return (
                <Link
                  key={brand.slug}
                  href={`/is-${brand.slug}-open`}
                  className="bg-bg1 border border-border rounded-[14px] p-4 hover:border-border2 hover:-translate-y-0.5 transition-all no-underline flex items-center gap-3"
                >
                  <span className="text-2xl">{brand.emoji || "🏪"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-text truncate">{brand.name}</div>
                    <div className="text-xs text-muted2">{brand.category}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${status.isOpen ? "bg-green" : "bg-red"}`} />
                    <span className={`text-xs font-semibold ${status.isOpen ? "text-green" : "text-red"}`}>
                      {status.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {results.length === 0 && (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-muted2 text-sm">No stores found matching &quot;{query}&quot;</p>
              <p className="text-muted text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
