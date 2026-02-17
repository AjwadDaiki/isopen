import { getUpcomingHolidays } from "@/data/holidays";

interface Props {
  country?: string;
  brandName: string;
}

export default function HolidayAlert({ country = "US", brandName }: Props) {
  const upcoming = getUpcomingHolidays(country, 1);
  if (upcoming.length === 0) return null;

  const holiday = upcoming[0];
  const holidayDate = new Date(`${holiday.date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysUntil = Math.ceil(
    (holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntil > 14 || daysUntil < 0) return null;

  const isToday = daysUntil === 0;
  const isTomorrow = daysUntil === 1;

  return (
    <section className="ui-panel border-orange/25 overflow-hidden">
      <div className="px-5 py-3.5 md:px-6 md:py-4 border-l-[3px] border-l-orange bg-orange-dim/60 flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-orange mt-2 shrink-0" />
        <p className="text-[13px] md:text-[13.5px] leading-relaxed text-orange font-medium">
          {isToday
            ? `Today is ${holiday.name}.`
            : isTomorrow
              ? `Tomorrow is ${holiday.name}.`
              : `${holiday.name} is in ${daysUntil} days.`}{" "}
          {holiday.affectsAll
            ? `${brandName} may be closed or have reduced hours.`
            : `Some ${brandName} locations may have reduced hours.`}
        </p>
      </div>
    </section>
  );
}
