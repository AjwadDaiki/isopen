"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface Props {
  slot?: string;
  label?: string;
  className?: string;
  minHeight?: number;
  showPlaceholder?: boolean;
}

const ADS_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-9657496359488658";

export default function AdSlot({
  slot,
  label = "Sponsored",
  className = "",
  minHeight = 120,
  showPlaceholder = false,
}: Props) {
  useEffect(() => {
    if (!slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore failed ad push in preview/local builds.
    }
  }, [slot]);

  if (!slot && !showPlaceholder) return null;

  if (!slot) {
    return (
      <section className={`ui-panel overflow-hidden ${className}`}>
        <div className="px-4 py-2.5 border-b border-border ui-bg-1-60">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            {label}
          </p>
        </div>
        <div
          className="px-4 py-6 text-sm text-muted2 flex items-center justify-center"
          style={{ minHeight }}
        >
          Ad space reserved
        </div>
      </section>
    );
  }

  return (
    <section className={`ui-panel overflow-hidden ${className}`}>
      <div className="px-4 py-2.5 border-b border-border ui-bg-1-60">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          {label}
        </p>
      </div>
      <div className="px-3 py-3" style={{ minHeight }}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight }}
          data-ad-client={ADS_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </section>
  );
}
