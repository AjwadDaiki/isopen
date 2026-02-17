"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { brandsData } from "@/data/brands";

export default function Navbar() {
  const router = useRouter();
  const [clock, setClock] = useState("");
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function tick() {
      const now = new Date();
      setClock(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = query.trim().length > 0
    ? brandsData.filter((b) =>
        b.brand.name.toLowerCase().includes(query.toLowerCase()) ||
        b.brand.slug.includes(query.toLowerCase()) ||
        b.brand.category?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  function navigate(slug: string) {
    setQuery("");
    setShowDropdown(false);
    router.push(`/is-${slug}-open`);
  }

  function handleSearch() {
    if (filtered.length > 0) {
      navigate(filtered[0].brand.slug);
    } else if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <nav className="sticky top-0 z-50 h-[56px] border-b border-border" style={{ background: "rgba(12,12,15,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 h-full flex items-center gap-6">
        <Link href="/" className="font-heading font-extrabold text-xl tracking-[-0.04em] flex items-center gap-2.5 no-underline text-text shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-green animate-pulse-dot" style={{ boxShadow: "0 0 12px var(--color-green-glow)" }} />
          isopenow
        </Link>

        {/* Search */}
        <div className="hidden sm:block relative flex-1 max-w-[400px]" ref={dropdownRef}>
          <div className="flex items-center bg-bg2 border border-border2 rounded-[10px] overflow-hidden focus-within:border-green/50 transition-all">
            <input
              type="text"
              placeholder="Search any store..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(e.target.value.trim().length > 0);
              }}
              onFocus={() => query.trim().length > 0 && setShowDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
                if (e.key === "Escape") setShowDropdown(false);
              }}
              className="bg-transparent border-none outline-none text-text text-sm px-3.5 py-2 flex-1 min-w-0 placeholder:text-muted"
            />
            <button
              onClick={handleSearch}
              className="bg-green text-black px-3.5 py-2 font-semibold text-[13px] cursor-pointer whitespace-nowrap hover:opacity-90 border-none transition-colors"
            >
              Check
            </button>
          </div>

          {showDropdown && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-bg1 rounded-xl border border-border2 overflow-hidden z-50" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
              {filtered.map((b) => (
                <button
                  key={b.brand.slug}
                  onClick={() => navigate(b.brand.slug)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg2 transition-colors cursor-pointer border-none bg-transparent text-left"
                >
                  <span className="text-lg">{b.brand.emoji || "🏪"}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-text">{b.brand.name}</div>
                    <div className="text-[11px] text-muted2">{b.brand.category}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        <Link
          href="/search"
          className="sm:hidden text-muted2 no-underline text-sm font-medium"
        >
          Search
        </Link>

        <span className="font-mono text-sm text-muted2 tracking-[0.05em] shrink-0">{clock}</span>
      </div>
    </nav>
  );
}
