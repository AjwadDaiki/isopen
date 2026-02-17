"use client";

import { useState, useEffect } from "react";
import type { HoursData } from "@/lib/types";

interface Props {
  hours: HoursData[];
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function HoursTable({ hours }: Props) {
  const [today, setToday] = useState(-1);

  useEffect(() => {
    setToday(new Date().getDay());
  }, []);

  // Sort: Mon(1)..Sat(6),Sun(0)
  const sorted = [...hours].sort((a, b) => {
    const oa = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const ob = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return oa - ob;
  });

  return (
    <div className="bg-bg1 border border-border rounded-2xl overflow-hidden">
      <div className="card-title-row">
        <h3 className="font-heading font-bold text-sm tracking-[-0.01em] flex items-center gap-2 text-text">
          <span>🕐</span> Opening hours
        </h3>
        <span className="font-mono text-[10px] text-muted tracking-[0.06em]">
          Updated Feb 2026
        </span>
      </div>

      <div className="py-2">
        {sorted.map((day) => {
          const isToday = day.dayOfWeek === today;
          const isClosed = day.isClosed || !day.openTime || !day.closeTime;

          // Calculate bar position (proportional to 24h)
          let barLeft = 0;
          let barWidth = 0;
          if (!isClosed && day.openTime && day.closeTime) {
            const open = timeToMinutes(day.openTime);
            let close = timeToMinutes(day.closeTime);
            if (day.spansMidnight || close <= open) close += 1440;
            barLeft = (open / 1440) * 100;
            barWidth = ((close - open) / 1440) * 100;
          }

          return (
            <div
              key={day.dayOfWeek}
              className={`flex items-center py-2.5 px-6 gap-4 transition-colors ${
                isToday
                  ? "bg-green-dim border-l-[3px] border-l-green"
                  : "hover:bg-bg2"
              }`}
            >
              <div
                className={`text-[13px] w-[90px] shrink-0 ${
                  isToday
                    ? "text-green font-bold"
                    : "text-muted2 font-medium"
                }`}
              >
                {DAY_NAMES[day.dayOfWeek]}
                {isToday && " ←"}
              </div>

              {/* Proportional bar */}
              <div className="flex-1 h-1 bg-bg3 rounded-sm relative overflow-hidden hidden sm:block">
                {!isClosed && (
                  <div
                    className={`absolute top-0 h-full rounded-sm ${
                      isToday ? "bg-green opacity-50" : "bg-border2"
                    }`}
                    style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                  />
                )}
              </div>

              {/* Time */}
              <div
                className={`font-mono text-[13px] font-medium whitespace-nowrap text-right w-[140px] shrink-0 ${
                  isToday ? "text-green" : isClosed ? "text-red" : "text-text"
                }`}
              >
                {isClosed ? (
                  "Closed"
                ) : (
                  <>
                    {formatTime(day.openTime!)} – {formatTime(day.closeTime!)}
                    {day.spansMidnight && (
                      <span className="ml-1.5 text-[11px] text-orange bg-orange-dim rounded px-1.5 py-px font-mono">
                        +1
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
