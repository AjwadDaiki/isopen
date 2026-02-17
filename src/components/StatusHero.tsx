"use client";

import { useEffect, useState } from "react";
import type { OpenStatus, BrandData } from "@/lib/types";

interface Props {
  brand: BrandData;
  initialStatus: OpenStatus;
}

export default function StatusHero({ brand, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [localTime, setLocalTime] = useState(initialStatus.localTime);
  const [shareState, setShareState] = useState<"idle" | "done">("idle");

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let cancelled = false;

    async function refresh() {
      try {
        const res = await fetch(
          `/api/open-status?brand=${brand.slug}&timezone=${encodeURIComponent(tz)}`
        );
        if (res.ok && !cancelled) {
          const data = await res.json();
          setStatus(data.status);
        }
      } catch {
        // Keep showing the last known status.
      }
    }

    refresh();
    const id = setInterval(refresh, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [brand.slug]);

  // Update local time every second
  useEffect(() => {
    function tick() {
      setLocalTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const isOpen = status.isOpen;
  const canonicalPath = `/is-${brand.slug}-open`;

  async function handleShare() {
    const shareUrl = `${window.location.origin}${canonicalPath}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Is ${brand.name} open right now?`,
          text: `Check real-time ${brand.name} opening status.`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
      setShareState("done");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {
      // User canceled
    }
  }

  return (
    <div
      className={`rounded-[20px] overflow-hidden border relative ${
        isOpen ? "border-green/25" : "border-red/20"
      }`}
      style={{
        boxShadow: isOpen ? "0 0 60px rgba(0,232,122,0.06)" : "none",
      }}
    >
      {/* Main hero area */}
      <div className="bg-bg1 relative p-8 sm:p-9 flex flex-wrap items-center justify-between gap-6">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isOpen
              ? "linear-gradient(135deg, rgba(0,232,122,0.04) 0%, transparent 60%)"
              : "linear-gradient(135deg, rgba(255,71,87,0.03) 0%, transparent 60%)",
          }}
        />

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-[72px] h-[72px] rounded-2xl bg-bg2 border border-border2 flex items-center justify-center text-4xl shrink-0">
            {brand.emoji || "🏪"}
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-[32px] tracking-[-0.04em] leading-[1.1] text-text">
              {brand.name}
            </h1>
            <p className="text-[13px] text-muted2 flex items-center gap-2">
              {brand.category}
              {brand.is24h && (
                <>
                  <span className="text-border2">&middot;</span>
                  <span className="text-muted">24/7 locations available</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 relative z-10 shrink-0">
          <div
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-heading font-extrabold text-xl tracking-[0.04em] border-2 ${
              isOpen
                ? "text-green border-green/35"
                : "text-red border-red/30"
            }`}
            style={{
              background: isOpen
                ? "rgba(0,232,122,0.12)"
                : "rgba(255,71,87,0.1)",
            }}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isOpen ? "bg-green animate-pulse-dot" : "bg-red"
              }`}
              style={isOpen ? { boxShadow: "0 0 12px var(--color-green-glow)" } : {}}
            />
            {isOpen ? "OPEN" : "CLOSED"}
          </div>
          <div className="font-mono text-[13px] text-muted2 text-right">
            {isOpen && status.closesIn && (
              <>
                Closes in{" "}
                <strong className="text-text text-[15px]">{status.closesIn}</strong>
              </>
            )}
            {!isOpen && status.opensAt && (
              <>
                Opens at{" "}
                <strong className="text-text text-[15px]">{status.opensAt}</strong>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-border bg-bg2">
        <StatCell label="Today's Hours" value={status.todayHours || "—"} />
        <StatCell label="Local Time" value={localTime} />
        <StatCell
          label="Holiday Today?"
          value={status.holidayName || "No"}
          color={status.holidayName ? "text-orange" : "text-green"}
        />
        <StatCell label="Updated" value="Feb 2026" muted />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5 px-8 py-4 bg-bg1 border-t border-border flex-wrap">
        <a
          href={brand.website || canonicalPath}
          target={brand.website ? "_blank" : undefined}
          rel={brand.website ? "noopener noreferrer" : undefined}
          className="bg-green text-black rounded-lg px-5 py-2.5 font-semibold text-sm cursor-pointer hover:opacity-90 transition-all no-underline"
        >
          Official website
        </a>
        <a
          href="#user-reports"
          className="bg-transparent text-muted2 border border-border2 rounded-lg px-5 py-2.5 font-medium text-sm cursor-pointer hover:bg-bg2 hover:text-text transition-all no-underline"
        >
          Report hours issue
        </a>
        <button
          type="button"
          onClick={handleShare}
          className="bg-transparent text-muted2 border border-border2 rounded-lg px-5 py-2.5 font-medium text-sm cursor-pointer hover:bg-bg2 hover:text-text transition-all"
        >
          {shareState === "done" ? "Link copied" : "Share"}
        </button>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  color,
  muted,
}: {
  label: string;
  value: string;
  color?: string;
  muted?: boolean;
}) {
  return (
    <div className="px-6 py-[18px] border-r border-border last:border-r-0">
      <div className="font-mono text-[10px] text-muted uppercase tracking-[0.12em] mb-1">
        {label}
      </div>
      <div
        className={`font-heading font-bold tracking-[-0.02em] ${
          muted ? "text-sm text-muted2" : `text-[17px] ${color || "text-text"}`
        }`}
      >
        {value}
      </div>
    </div>
  );
}
