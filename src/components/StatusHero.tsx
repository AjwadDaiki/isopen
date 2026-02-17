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
      style={{
        borderRadius: 20,
        overflow: "hidden",
        border: `1px solid ${isOpen ? "rgba(0,232,122,0.25)" : "rgba(255,71,87,0.2)"}`,
        boxShadow: isOpen ? "0 0 60px rgba(0,232,122,0.06)" : "none",
        position: "relative",
      }}
    >
      {/* Main hero area */}
      <div
        style={{
          padding: "30px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          background: "var(--color-bg1)",
          position: "relative",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isOpen
              ? "linear-gradient(135deg, rgba(0,232,122,0.04) 0%, transparent 60%)"
              : "linear-gradient(135deg, rgba(255,71,87,0.03) 0%, transparent 60%)",
          }}
        />

        {/* Left: icon + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, position: "relative", zIndex: 1 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "var(--color-bg2)",
              border: "1px solid var(--color-border2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              flexShrink: 0,
            }}
          >
            {brand.emoji || "🏪"}
          </div>
          <div>
            <h1
              className="font-heading font-extrabold text-text"
              style={{ fontSize: 32, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 4 }}
            >
              {brand.name}
            </h1>
            <div className="text-muted2 flex items-center" style={{ fontSize: 13, gap: 8 }}>
              {brand.category}
              {brand.is24h && (
                <>
                  <span style={{ color: "var(--color-border2)" }}>&middot;</span>
                  <span className="text-muted">24/7 locations available</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: status badge + countdown */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 12,
            position: "relative",
            zIndex: 1,
            flexShrink: 0,
          }}
        >
          <div
            className="font-heading font-extrabold flex items-center"
            style={{
              gap: 10,
              padding: "12px 24px",
              borderRadius: 100,
              fontSize: 20,
              letterSpacing: "0.04em",
              background: isOpen ? "rgba(0,232,122,0.12)" : "rgba(255,71,87,0.1)",
              border: `2px solid ${isOpen ? "rgba(0,232,122,0.35)" : "rgba(255,71,87,0.3)"}`,
              color: isOpen ? "var(--color-green)" : "var(--color-red)",
            }}
          >
            <span
              className={`rounded-full shrink-0 ${isOpen ? "bg-green animate-pulse-dot" : "bg-red"}`}
              style={{
                width: 10,
                height: 10,
                ...(isOpen ? { boxShadow: "0 0 12px var(--color-green-glow)" } : {}),
              }}
            />
            {isOpen ? "OPEN" : "CLOSED"}
          </div>
          <div className="font-mono text-muted2" style={{ fontSize: 13, textAlign: "right" }}>
            {isOpen && status.closesIn && (
              <>
                Closes in{" "}
                <strong className="text-text" style={{ fontSize: 15 }}>{status.closesIn}</strong>
              </>
            )}
            {!isOpen && status.opensAt && (
              <>
                Opens at{" "}
                <strong className="text-text" style={{ fontSize: 15 }}>{status.opensAt}</strong>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 border-t border-border bg-bg2"
      >
        <StatCell label="Today's Hours" value={status.todayHours || "—"} />
        <StatCell label="Local Time" value={localTime} />
        <StatCell
          label="Holiday Today?"
          value={status.holidayName || "No"}
          color={status.holidayName ? "var(--color-orange)" : "var(--color-green)"}
        />
        <StatCell label="Updated" value="Feb 2026" muted />
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "14px 24px",
          background: "var(--color-bg1)",
          borderTop: "1px solid var(--color-border)",
          flexWrap: "wrap",
        }}
      >
        <a
          href={brand.website || canonicalPath}
          target={brand.website ? "_blank" : undefined}
          rel={brand.website ? "noopener noreferrer" : undefined}
          className="no-underline"
          style={{
            background: "var(--color-green)",
            color: "#000",
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Official website
        </a>
        <a
          href="#user-reports"
          className="no-underline text-muted2 hover:text-text transition-all"
          style={{
            background: "transparent",
            border: "1px solid var(--color-border2)",
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Report hours issue
        </a>
        <button
          type="button"
          onClick={handleShare}
          className="text-muted2 hover:text-text transition-all"
          style={{
            background: "transparent",
            border: "1px solid var(--color-border2)",
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 500,
            fontSize: 14,
            cursor: "pointer",
          }}
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
    <div className="px-4 py-4 md:px-6 md:py-[18px] border-r border-border last:border-r-0">
      <div
        className="font-mono uppercase text-muted"
        style={{ fontSize: 10, letterSpacing: "0.12em", marginBottom: 4 }}
      >
        {label}
      </div>
      <div
        className="font-heading font-bold"
        style={{
          letterSpacing: "-0.02em",
          fontSize: muted ? 14 : 17,
          color: muted ? "var(--color-muted2)" : (color || "var(--color-text)"),
        }}
      >
        {value}
      </div>
    </div>
  );
}
