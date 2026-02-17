import { getUpcomingHolidays } from "@/data/holidays";

interface Props {
  country?: string;
  brandName: string;
}

export default function HolidayAlert({ country = "US", brandName }: Props) {
  const upcoming = getUpcomingHolidays(country, 1);
  if (upcoming.length === 0) return null;

  const holiday = upcoming[0];
  const holidayDate = new Date(holiday.date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil(
    (holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntil > 14 || daysUntil < 0) return null;

  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;

  return (
    <div className="border border-orange/20 border-l-[3px] border-l-orange rounded-lg px-4 py-3 text-[13px] text-orange font-medium flex items-center gap-2.5" style={{ background: "var(--color-orange-dim)" }}>
      <span>⚠️</span>
      <span>
        {isToday
          ? `Today is ${holiday.name}!`
          : isTomorrow
            ? `Tomorrow is ${holiday.name}!`
            : `${holiday.name} is in ${daysUntil} days.`}{" "}
        {holiday.affectsAll
          ? `${brandName} may be closed or have reduced hours.`
          : `Some ${brandName} locations may have reduced hours.`}
      </span>
    </div>
  );
}
