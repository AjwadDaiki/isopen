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
    <nav
      className="sticky top-0 z-50 page-pad"
      style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(12,12,15,0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <Link
        href="/"
        className="font-heading font-extrabold no-underline text-text flex items-center shrink-0"
        style={{ fontSize: 18, letterSpacing: "-0.04em", gap: 8 }}
      >
        <span
          className="rounded-full bg-green animate-pulse-dot"
          style={{ width: 8, height: 8, boxShadow: "0 0 12px var(--color-green-glow)" }}
        />
        isopenow
      </Link>

      {/* Search */}
      <div className="hidden md:block relative" ref={dropdownRef}>
        <div
          className="search-wrap flex items-center overflow-hidden"
          style={{
            width: 360,
            background: "rgba(24,24,31,0.85)",
            border: "1px solid var(--color-border2)",
            borderRadius: 12,
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        >
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
            className="bg-transparent border-none outline-none text-text placeholder:text-muted"
            style={{ fontSize: 14, padding: "10px 14px", flex: 1, minWidth: 0 }}
          />
          <button
            onClick={handleSearch}
            className="border-none cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity"
            style={{
              background: "var(--color-green)",
              color: "#000",
              padding: "10px 18px",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Check &rarr;
          </button>
        </div>

        {showDropdown && filtered.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1 overflow-hidden z-50"
            style={{
              background: "var(--color-bg1)",
              borderRadius: 12,
              border: "1px solid var(--color-border2)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
            }}
          >
            {filtered.map((b) => (
              <button
                key={b.brand.slug}
                onClick={() => navigate(b.brand.slug)}
                className="w-full flex items-center cursor-pointer border-none bg-transparent text-left transition-colors hover:bg-bg2"
                style={{ padding: "10px 16px", gap: 12 }}
              >
                <span style={{ fontSize: 18 }}>{b.brand.emoji || "🏪"}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-text">{b.brand.name}</div>
                  <div style={{ fontSize: 11 }} className="text-muted2">{b.brand.category}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/search"
        className="md:hidden text-muted2 no-underline text-sm font-medium"
      >
        Search
      </Link>

      <div className="hidden sm:flex items-center shrink-0" style={{ gap: 16 }}>
        <span className="font-mono text-muted2" style={{ fontSize: 13, letterSpacing: "0.05em" }}>
          {clock}
        </span>
      </div>
    </nav>
  );
}
