"use client";

import type { HoursData } from "@/lib/types";

interface Props {
  hours: HoursData[];
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function HoursTable({ hours }: Props) {
  const today = new Date().getDay();

  const sorted = [...hours].sort((a, b) => {
    const oa = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const ob = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return oa - ob;
  });

  return (
    <section className="ui-panel overflow-hidden">
      <div className="card-title-row">
        <h3 className="font-heading font-bold text-sm tracking-[-0.01em] text-text">Opening hours</h3>
        <span className="font-mono text-[10px] text-muted tracking-[0.06em]">Local schedule</span>
      </div>

      <div className="panel-body flex flex-col gap-3.5">
        {sorted.map((day) => {
          const isToday = day.dayOfWeek === today;
          const isClosed = day.isClosed || !day.openTime || !day.closeTime;

          return (
            <article
              key={day.dayOfWeek}
              className={`rounded-xl border px-5 py-4 md:px-6 md:py-4.5 grid grid-cols-1 sm:grid-cols-[1fr_auto] items-start sm:items-center gap-3 sm:gap-4 ${
                isToday
                  ? "ui-border-green-35 bg-green-dim"
                  : "border-border ui-bg-2-65"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-[13px] md:text-[14px] font-semibold ${isToday ? "text-green" : "text-text"}`}>
                    {DAY_NAMES[day.dayOfWeek]}
                  </p>
                  {isToday && (
                    <span className="text-[10px] uppercase tracking-[0.1em] font-mono text-green ui-bg-green-10 border ui-border-green-25 rounded-full px-2 py-[2px]">
                      Today
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted2 mt-1">
                  {isClosed ? "Usually closed" : day.spansMidnight ? "Open late (overnight)" : "Regular hours"}
                </p>
              </div>

              <div
                className={`font-mono text-[12px] md:text-[13px] font-semibold text-left sm:text-right whitespace-nowrap ${
                  isClosed ? "text-red" : isToday ? "text-green" : "text-text"
                }`}
              >
                {isClosed ? "Closed" : `${formatTime(day.openTime!)} - ${formatTime(day.closeTime!)}`}
                {!isClosed && day.spansMidnight && (
                  <span className="ml-1.5 text-[10px] text-orange bg-orange-dim border ui-border-orange-30 rounded px-1.5 py-px">+1</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
