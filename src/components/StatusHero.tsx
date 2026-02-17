"use client";

import { useEffect, useState } from "react";
import type { OpenStatus, BrandData } from "@/lib/types";

interface Props {
  brand: BrandData;
  initialStatus: OpenStatus;
}

export default function StatusHero({ brand, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);

  // Poll every 30s for real-time updates with user's actual timezone
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
        // Silent — keep showing last known status
      }
    }

    // Refresh immediately with user's real timezone, then every 30s
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [brand.slug]);

  const isOpen = status.isOpen;

  return (
    <div
      className={`rounded-2xl p-8 sm:p-10 mb-6 relative overflow-hidden border-2 transition-colors ${
        isOpen ? "border-green bg-green-bg" : "border-red bg-red-bg"
      }`}
    >
      {/* Decorative circle */}
      <div
        className={`absolute -top-[60px] -right-[60px] w-[200px] h-[200px] rounded-full opacity-[0.04] ${
          isOpen ? "bg-green" : "bg-red"
        }`}
      />

      {/* Header: brand info + status */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-[28px] shadow-[0_2px_16px_rgba(26,22,18,0.08)] shrink-0">
            {brand.emoji || "🏪"}
          </div>
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em] leading-[1.1]">
              {brand.name}
            </h1>
            <p className="text-[13px] text-ink3 mt-0.5">
              {brand.category}
              {brand.is24h && " · 24/7 locations available"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isOpen ? "bg-green animate-breathe" : "bg-red"
            }`}
          />
          <div
            className={`font-extrabold text-[42px] tracking-[-0.04em] leading-none ${
              isOpen ? "text-green" : "text-red"
            }`}
          >
            {isOpen ? "OPEN" : "CLOSED"}
          </div>
        </div>
      </div>

      {/* Detail row */}
      <div className="flex gap-8 flex-wrap relative z-10">
        {isOpen && status.closesIn && (
          <DetailItem label="Closes in" value={status.closesIn} color={isOpen ? "text-green" : "text-red"} />
        )}
        {!isOpen && status.opensAt && (
          <DetailItem label="Opens at" value={status.opensAt} color="text-red" />
        )}
        {status.todayHours && (
          <DetailItem label="Today's hours" value={status.todayHours} />
        )}
        <DetailItem label="Local time" value={status.localTime} />
        {status.holidayName ? (
          <DetailItem label="Holiday today?" value={status.holidayName} color="text-amber" />
        ) : (
          <DetailItem label="Holiday today?" value="No" color="text-green" />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5 mt-6 flex-wrap relative z-10">
        <button className="bg-ink text-bg border-none rounded-lg px-5 py-2.5 font-semibold text-sm cursor-pointer flex items-center gap-2 hover:opacity-90 transition-all hover:-translate-y-px">
          📍 Get Directions
        </button>
        <button className="bg-transparent text-ink2 border border-ink/20 rounded-lg px-5 py-2.5 font-medium text-sm cursor-pointer flex items-center gap-2 hover:bg-white/50 transition-all">
          🔔 Notify before closing
        </button>
        <button className="bg-transparent text-ink2 border border-ink/20 rounded-lg px-5 py-2.5 font-medium text-sm cursor-pointer flex items-center gap-2 hover:bg-white/50 transition-all">
          📋 Share hours
        </button>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink3 font-mono">
        {label}
      </span>
      <span className={`text-lg font-bold tracking-[-0.02em] ${color || "text-ink"}`}>
        {value}
      </span>
    </div>
  );
}
