"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [clock, setClock] = useState("");
  const [query, setQuery] = useState("");

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

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const city = timezone.split("/").pop()?.replace(/_/g, " ") || "";

  return (
    <nav className="bg-ink text-bg sticky top-0 z-50 h-[52px] flex items-center justify-between px-4 md:px-8">
      <Link href="/" className="font-extrabold text-lg tracking-tight flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-green animate-breathe" />
        isitopen
      </Link>

      <div className="hidden sm:flex items-center bg-white/[0.08] border border-white/[0.12] rounded-lg overflow-hidden w-[340px]">
        <input
          type="text"
          placeholder="Is McDonald's open right now?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-bg text-sm px-3.5 py-2 flex-1 min-w-0 placeholder:text-bg/40"
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              const slug = query
                .toLowerCase()
                .replace(/is\s+/i, "")
                .replace(/\s+open.*$/i, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              if (slug) window.location.href = `/is-${slug}-open`;
            }
          }}
        />
        <button
          className="bg-green text-white px-4 h-9 font-semibold text-[13px] cursor-pointer whitespace-nowrap hover:bg-green/90"
          onClick={() => {
            const slug = query
              .toLowerCase()
              .replace(/is\s+/i, "")
              .replace(/\s+open.*$/i, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");
            if (slug) window.location.href = `/is-${slug}-open`;
          }}
        >
          Check &rarr;
        </button>
      </div>

      <div className="flex items-center gap-5 text-[13px] text-bg/60">
        <span className="font-mono text-[13px] text-bg/50">{clock}</span>
        <span className="hidden md:inline">{city}</span>
      </div>
    </nav>
  );
}
