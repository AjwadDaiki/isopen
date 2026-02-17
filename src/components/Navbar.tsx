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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const city = timezone.split("/").pop()?.replace(/_/g, " ") || "";

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
    <nav className="bg-ink text-bg sticky top-0 z-50 h-[52px] flex items-center justify-between px-4 md:px-8">
      <Link href="/" className="font-extrabold text-lg tracking-[-0.03em] flex items-center gap-2 no-underline text-bg">
        <span className="w-2.5 h-2.5 rounded-full bg-green animate-breathe" />
        isitopen
      </Link>

      {/* Search with autocomplete */}
      <div className="hidden sm:block relative" ref={dropdownRef}>
        <div className="flex items-center bg-white/[0.08] border border-white/[0.12] rounded-lg overflow-hidden w-[340px]">
          <input
            type="text"
            placeholder="Is McDonald's open right now?"
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
            className="bg-transparent border-none outline-none text-bg text-sm px-3.5 py-2 flex-1 min-w-0 placeholder:text-bg/40"
          />
          <button
            onClick={handleSearch}
            className="bg-green text-white px-4 h-9 font-semibold text-[13px] cursor-pointer whitespace-nowrap hover:bg-green/90 border-none"
          >
            Check &rarr;
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {showDropdown && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-[0_8px_40px_rgba(26,22,18,0.12)] border border-ink/10 overflow-hidden z-50">
            {filtered.map((b) => (
              <button
                key={b.brand.slug}
                onClick={() => navigate(b.brand.slug)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg transition-colors cursor-pointer border-none bg-transparent text-left"
              >
                <span className="text-lg">{b.brand.emoji || "🏪"}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink">{b.brand.name}</div>
                  <div className="text-[11px] text-ink3">{b.brand.category}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/search"
        className="sm:hidden text-bg/80 no-underline text-sm font-medium"
      >
        Search
      </Link>

      <div className="flex items-center gap-5 text-[13px] text-bg/60">
        <span className="font-mono text-[13px] text-bg/50">{clock}</span>
        <span className="hidden md:inline">🇺🇸 {city}</span>
      </div>
    </nav>
  );
}
