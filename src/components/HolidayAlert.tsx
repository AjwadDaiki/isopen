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

  // Only show if within 14 days
  if (daysUntil > 14 || daysUntil < 0) return null;

  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;

  return (
    <div className="bg-amber-bg border border-amber/20 border-l-[3px] border-l-amber rounded-lg px-4 py-3 mb-4 text-[13px] text-amber font-medium flex items-center gap-2.5">
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
