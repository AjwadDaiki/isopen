"use client";

import { useEffect, useState } from "react";
import type { OpenStatus, BrandData } from "@/lib/types";

interface Props {
  brand: BrandData;
  initialStatus: OpenStatus;
}

export default function StatusHero({ brand, initialStatus }: Props) {
  const [status] = useState(initialStatus);

  const isOpen = status.isOpen;
  const borderColor = isOpen ? "border-green" : "border-red";
  const bgColor = isOpen ? "bg-green-bg" : "bg-red-bg";
  const statusTextColor = isOpen ? "text-green" : "text-red";

  return (
    <div
      className={`rounded-2xl p-6 sm:p-9 mb-6 relative overflow-hidden border-2 ${borderColor} ${bgColor}`}
    >
      {/* Decorative circle */}
      <div className="absolute -top-15 -right-15 w-[200px] h-[200px] rounded-full opacity-[0.04] bg-current" />

      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-[28px] shadow-md shrink-0">
            {brand.emoji || "🏪"}
          </div>
          <div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight leading-tight">
              {brand.name}
            </h1>
            <p className="text-[13px] text-ink3">
              {brand.category}
              {brand.is24h && " · 24/7 locations available"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isOpen ? "bg-green animate-breathe" : "bg-red"
            }`}
          />
          <div
            className={`font-extrabold text-3xl sm:text-[42px] tracking-tighter leading-none ${statusTextColor}`}
          >
            {isOpen ? "OPEN" : "CLOSED"}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex gap-6 sm:gap-8 flex-wrap">
        {isOpen && status.closesIn && (
          <Detail label="Closes in" value={status.closesIn} accent />
        )}
        {!isOpen && status.opensAt && (
          <Detail label="Opens at" value={status.opensAt} accent />
        )}
        {status.todayHours && (
          <Detail label="Today's hours" value={status.todayHours} />
        )}
        <Detail label="Local time" value={status.localTime} />
        {status.holidayName && (
          <Detail label="Holiday" value={status.holidayName} />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 mt-6 flex-wrap">
        <button className="bg-ink text-bg border-none rounded-lg px-5 py-2.5 font-semibold text-sm cursor-pointer flex items-center gap-2 hover:bg-ink/80 transition-all">
          📍 Get Directions
        </button>
        <button className="bg-transparent text-ink2 border border-ink/20 rounded-lg px-5 py-2.5 font-medium text-sm cursor-pointer flex items-center gap-2 hover:bg-bg2 transition-all">
          📋 Share hours
        </button>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-ink3 font-mono">
        {label}
      </span>
      <span
        className={`text-lg font-bold tracking-tight ${
          accent ? "text-green" : "text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
