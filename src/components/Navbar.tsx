"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { brandsData } from "@/data/brands";
import { buildBrandUrl } from "@/lib/i18n/url-patterns";
import { getLocaleFromPath, t, type Locale } from "@/lib/i18n/translations";

const TOP_CLICKED = [
  "mcdonalds",
  "walmart",
  "starbucks",
  "costco",
  "target",
  "chick-fil-a",
  "post-office",
  "stock-market",
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname || "/") as Locale;

  const [clock, setClock] = useState("");
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const homeHref = locale === "en" ? "/" : `/${locale}`;

  const topBrands = useMemo(
    () =>
      TOP_CLICKED.map((slug) => brandsData.find((b) => b.brand.slug === slug))
        .filter(Boolean)
        .map((b) => b!),
    []
  );

  const categories = useMemo(() => {
    const grouped = new Map<string, typeof brandsData>();
    for (const item of brandsData) {
      const key = item.brand.category || "Other";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(item);
    }
    return [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered =
    query.trim().length > 0
      ? brandsData
          .filter(
            (b) =>
              b.brand.name.toLowerCase().includes(query.toLowerCase()) ||
              b.brand.slug.includes(query.toLowerCase()) ||
              b.brand.category?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 8)
      : [];

  function brandHref(slug: string) {
    return buildBrandUrl(locale, slug);
  }

  function navigate(slug: string) {
    setQuery("");
    setShowDropdown(false);
    setShowMenu(false);
    router.push(brandHref(slug));
  }

  function handleSearch() {
    if (filtered.length > 0) {
      navigate(filtered[0].brand.slug);
    } else if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <nav className="sticky top-0 z-50 page-pad navbar-shell">
      <Link
        href={homeHref}
        className="font-heading font-extrabold no-underline text-text flex items-center shrink-0 text-[21px] tracking-[-0.04em] gap-2"
      >
        <span
          className="rounded-full bg-green animate-pulse-dot"
          style={{ width: 8, height: 8, boxShadow: "0 0 10px var(--color-green-glow)" }}
        />
        Is<span className="text-green">Open</span>Now
      </Link>

      <div className="hidden lg:flex items-center gap-3 min-w-0">
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            className="nav-chip cursor-pointer"
          >
            {t(locale, "brandsMenu")}
          </button>

          {showMenu && (
            <div className="absolute top-full left-0 mt-2.5 w-[700px] dropdown-panel rounded-2xl p-4 z-50">
              <div className="grid grid-cols-[220px_1fr] gap-4">
                <div className="pr-3 border-r border-border">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-2.5">
                    {t(locale, "topBrands")}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {topBrands.map(({ brand }) => (
                      <button
                        key={brand.slug}
                        type="button"
                        onClick={() => navigate(brand.slug)}
                        className="text-left text-sm text-text bg-bg2 border border-border rounded-lg px-3 py-2 hover:border-border2 hover:bg-bg3 cursor-pointer transition-colors"
                      >
                        {brand.emoji || "Store"} {brand.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-2.5">
                    {t(locale, "byCategory")}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-[320px] overflow-auto pr-1">
                    {categories.map(([cat, list]) => (
                      <div key={cat} className="min-w-0">
                        <p className="text-[11px] text-muted2 mb-1.5 uppercase tracking-[0.08em]">{cat}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {list.slice(0, 4).map(({ brand }) => (
                            <button
                              key={brand.slug}
                              type="button"
                              onClick={() => navigate(brand.slug)}
                              className="text-[12px] text-text bg-bg2 border border-border rounded-md px-2.5 py-1 hover:border-border2 hover:bg-bg3 cursor-pointer transition-colors"
                            >
                              {brand.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative min-w-0 flex-1" ref={dropdownRef}>
          <div className="search-wrap nav-search flex items-center overflow-hidden">
            <input
              type="text"
              placeholder={t(locale, "searchPlaceholder")}
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
              className="nav-search-input bg-transparent border-none outline-none text-text placeholder:text-muted flex-1 min-w-0"
            />
            <button onClick={handleSearch} className="nav-search-cta whitespace-nowrap">
              {t(locale, "checkCta")}
            </button>
          </div>

          {showDropdown && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 overflow-hidden z-50 dropdown-panel rounded-xl">
              {filtered.map((b) => (
                <button
                  key={b.brand.slug}
                  onClick={() => navigate(b.brand.slug)}
                  className="w-full flex items-center cursor-pointer border-none bg-transparent text-left transition-colors hover:bg-bg2"
                  style={{ padding: "11px 16px", gap: 12 }}
                >
                  <span style={{ fontSize: 18 }}>{b.brand.emoji || "Store"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text truncate">{b.brand.name}</div>
                    <div className="text-[11px] text-muted2 truncate">{b.brand.category}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Link href="/search" className="lg:hidden text-muted2 no-underline text-sm font-medium hover:text-text transition-colors">
        {t(locale, "searchNav")}
      </Link>

      <div className="hidden md:flex items-center justify-end shrink-0">
        <span className="font-mono text-muted2 text-[13px] tracking-[0.05em]">{clock}</span>
      </div>
    </nav>
  );
}
