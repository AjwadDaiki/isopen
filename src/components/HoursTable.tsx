"use client";

import { useState, useEffect } from "react";
import type { HoursData } from "@/lib/types";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface Props {
  hours: HoursData[];
}

export default function HoursTable({ hours }: Props) {
  const [today, setToday] = useState(-1);

  useEffect(() => {
    setToday(new Date().getDay());
  }, []);

  const sortedHours = [1, 2, 3, 4, 5, 6, 0].map((day) => ({
    day,
    hours: hours.find((h) => h.dayOfWeek === day),
  }));

  return (
    <div className="bg-white border border-ink/10 rounded-2xl mb-5 overflow-hidden card-shadow">
      <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between">
        <h2 className="text-[15px] font-bold tracking-tight flex items-center gap-2">
          🕐 Opening hours
        </h2>
        <span className="text-[11px] text-ink3 font-mono">
          Updated {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </span>
      </div>

      <div className="py-1">
        {sortedHours.map(({ day, hours: h }) => {
          const isToday = day === today;
          const isClosed = !h || h.isClosed || !h.openTime || !h.closeTime;
          const timeStr = isClosed ? "Closed" : `${h!.openTime} – ${h!.closeTime}`;

          let barWidth = 0;
          let barOffset = 0;
          if (!isClosed && h?.openTime && h?.closeTime) {
            const [oh, om] = h.openTime.split(":").map(Number);
            const [ch, cm] = h.closeTime.split(":").map(Number);
            const openMin = oh * 60 + om;
            let closeMin = ch * 60 + cm;
            if (h.spansMidnight) closeMin += 24 * 60;
            barWidth = ((closeMin - openMin) / (24 * 60)) * 100;
            barOffset = (openMin / (24 * 60)) * 100;
          }

          return (
            <div
              key={day}
              className={`flex items-center px-6 py-3 transition-colors ${
                isToday
                  ? "bg-gradient-to-r from-green-bg/80 to-transparent"
                  : "hover:bg-bg/60"
              }`}
            >
              <span className={`text-[14px] w-[110px] shrink-0 ${
                isToday ? "text-green font-bold" : "text-ink2"
              }`}>
                {DAY_NAMES[day]}{isToday && " ←"}
              </span>

              <div className="flex-1 mx-5 h-[6px] bg-bg2 rounded-full overflow-hidden hidden sm:block">
                {barWidth > 0 && (
                  <div
                    className={`h-full rounded-full transition-all ${isToday ? "bg-green" : "bg-ink/20"}`}
                    style={{ width: `${Math.min(barWidth, 100)}%`, marginLeft: `${barOffset}%` }}
                  />
                )}
              </div>

              <span className={`font-mono text-[14px] shrink-0 ${
                isClosed
                  ? "text-red"
                  : isToday ? "text-green font-semibold" : "text-ink"
              }`}>
                {timeStr}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
