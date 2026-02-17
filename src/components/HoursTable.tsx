import type { HoursData } from "@/lib/types";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface Props {
  hours: HoursData[];
  timezone: string;
}

export default function HoursTable({ hours, timezone }: Props) {
  const today = new Date().getDay();

  // Sort hours by day: Monday first
  const sortedHours = [1, 2, 3, 4, 5, 6, 0].map((day) => {
    const h = hours.find((h) => h.dayOfWeek === day);
    return { day, hours: h };
  });

  return (
    <div className="bg-white border border-ink/10 rounded-xl mb-4 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between">
        <h2 className="text-[15px] font-bold tracking-tight flex items-center gap-2">
          <span>🕐</span> Opening hours
        </h2>
        <span className="text-xs text-ink3 font-mono">
          Timezone: {timezone}
        </span>
      </div>

      <div className="py-2">
        {sortedHours.map(({ day, hours: h }) => {
          const isToday = day === today;
          const timeStr =
            h && !h.isClosed && h.openTime && h.closeTime
              ? `${h.openTime} – ${h.closeTime}`
              : "Closed";

          // Calculate bar width (percentage of 24h that's open)
          let barWidth = 0;
          let barOffset = 0;
          if (h && !h.isClosed && h.openTime && h.closeTime) {
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
              className={`flex items-center justify-between px-6 py-2.5 transition-colors hover:bg-bg ${
                isToday
                  ? "bg-gradient-to-r from-green-bg to-transparent font-bold"
                  : ""
              }`}
            >
              <span
                className={`text-sm w-[100px] ${
                  isToday ? "text-green" : "text-ink2"
                }`}
              >
                {DAY_NAMES[day]}
                {isToday && " ←"}
              </span>

              <div className="flex-1 mx-6 h-1.5 bg-bg2 rounded-full overflow-hidden">
                {barWidth > 0 && (
                  <div
                    className={`h-full rounded-full ${
                      isToday ? "bg-green" : "bg-ink/20"
                    }`}
                    style={{
                      width: `${Math.min(barWidth, 100)}%`,
                      marginLeft: `${barOffset}%`,
                    }}
                  />
                )}
              </div>

              <span className="font-mono text-sm text-ink">{timeStr}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
