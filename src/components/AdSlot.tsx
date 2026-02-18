"use client";

import { useEffect, useRef } from "react";
import { trackAdSlotView } from "@/lib/track";

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
  const containerRef = useRef<HTMLElement | null>(null);
  const trackedView = useRef(false);

  useEffect(() => {
    if (!slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore failed ad push in preview/local builds.
    }
  }, [slot]);

  useEffect(() => {
    if (!slot || !containerRef.current) return;

    const node = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (trackedView.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            trackedView.current = true;
            trackAdSlotView(slot, label);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: [0.5] }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [label, slot]);

  if (!slot && !showPlaceholder) return null;

  if (!slot) {
    return (
      <section className={`ui-panel overflow-hidden ${className}`}>
        <div className="px-5 py-3 border-b border-border ui-bg-1-60">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            {label}
          </p>
        </div>
        <div
          className="px-5 py-7 text-sm text-muted2 flex items-center justify-center"
          style={{ minHeight }}
        >
          Ad space reserved
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className={`ui-panel overflow-hidden ${className}`}>
      <div className="px-4 py-2.5 border-b border-border ui-bg-1-60">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          {label}
        </p>
      </div>
      <div className="px-4 py-4" style={{ minHeight }}>
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
