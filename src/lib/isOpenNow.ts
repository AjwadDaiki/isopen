import { formatDistanceStrict, format, isWithinInterval, addDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { OpenStatus, HoursData } from "./types";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function parseTime(timeStr: string, referenceDate: Date): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date(referenceDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function formatHoursRange(hours: HoursData): string | null {
  if (hours.isClosed || !hours.openTime || !hours.closeTime) return null;
  return `${hours.openTime} – ${hours.closeTime}`;
}

export function computeOpenStatus(
  weeklyHours: HoursData[],
  timezone: string,
  is24h: boolean,
  holiday?: { name: string; affectsAll: boolean } | null,
  specialHours?: HoursData | null,
  now: Date = new Date()
): OpenStatus {
  const localNow = toZonedTime(now, timezone);
  const dayOfWeek = localNow.getDay(); // 0 = Sunday
  const localTimeStr = format(localNow, "h:mm a");

  // 24h brand
  if (is24h) {
    return {
      isOpen: true,
      reason: "24h",
      localTime: localTimeStr,
      timezone,
      closesAt: null,
      closesIn: null,
      opensAt: null,
      opensIn: null,
      todayHours: "Open 24 hours",
    };
  }

  // Special hours override
  if (specialHours) {
    return evaluateHours(specialHours, localNow, weeklyHours, timezone);
  }

  // Holiday check
  if (holiday && holiday.affectsAll) {
    const nextOpen = getNextOpeningTime(weeklyHours, localNow);
    return {
      isOpen: false,
      reason: "holiday",
      holidayName: holiday.name,
      localTime: localTimeStr,
      timezone,
      closesAt: null,
      closesIn: null,
      opensAt: nextOpen,
      opensIn: null,
      todayHours: `Closed – ${holiday.name}`,
    };
  }

  // Standard hours
  const todayHours = weeklyHours.find((h) => h.dayOfWeek === dayOfWeek);
  if (!todayHours) {
    return {
      isOpen: false,
      reason: "closed_today",
      localTime: localTimeStr,
      timezone,
      closesAt: null,
      closesIn: null,
      opensAt: getNextOpeningTime(weeklyHours, localNow),
      opensIn: null,
      todayHours: "Closed today",
    };
  }

  return evaluateHours(todayHours, localNow, weeklyHours, timezone);
}

function evaluateHours(
  hours: HoursData,
  localNow: Date,
  weeklyHours: HoursData[],
  timezone: string
): OpenStatus {
  const localTimeStr = format(localNow, "h:mm a");

  if (hours.isClosed || !hours.openTime || !hours.closeTime) {
    return {
      isOpen: false,
      reason: "closed_today",
      localTime: localTimeStr,
      timezone,
      closesAt: null,
      closesIn: null,
      opensAt: getNextOpeningTime(weeklyHours, localNow),
      opensIn: null,
      todayHours: "Closed today",
    };
  }

  const open = parseTime(hours.openTime, localNow);
  const close = hours.spansMidnight
    ? addDays(parseTime(hours.closeTime, localNow), 1)
    : parseTime(hours.closeTime, localNow);

  // Also check if we're in the previous day's spanning-midnight window
  const dayOfWeek = localNow.getDay();
  const yesterdayDow = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const yesterdayHours = weeklyHours.find((h) => h.dayOfWeek === yesterdayDow);

  if (
    yesterdayHours &&
    yesterdayHours.spansMidnight &&
    yesterdayHours.openTime &&
    yesterdayHours.closeTime
  ) {
    const yesterdayClose = parseTime(yesterdayHours.closeTime, localNow);
    // If current time is before yesterday's closing time (past midnight)
    if (localNow < yesterdayClose) {
      const closesIn = formatDistanceStrict(yesterdayClose, localNow);
      return {
        isOpen: true,
        reason: "open",
        localTime: localTimeStr,
        timezone,
        closesAt: hours.closeTime,
        closesIn,
        opensAt: null,
        opensIn: null,
        todayHours: formatHoursRange(hours),
      };
    }
  }

  const isOpen = isWithinInterval(localNow, { start: open, end: close });

  if (isOpen) {
    const closesIn = formatDistanceStrict(close, localNow);
    return {
      isOpen: true,
      reason: "open",
      localTime: localTimeStr,
      timezone,
      closesAt: hours.closeTime,
      closesIn,
      opensAt: null,
      opensIn: null,
      todayHours: formatHoursRange(hours),
    };
  }

  // Currently closed
  const nextOpen = localNow < open ? hours.openTime : getNextOpeningTime(weeklyHours, localNow);
  const opensIn = localNow < open ? formatDistanceStrict(open, localNow) : null;

  return {
    isOpen: false,
    reason: "closed_hours",
    localTime: localTimeStr,
    timezone,
    closesAt: null,
    closesIn: null,
    opensAt: nextOpen,
    opensIn,
    todayHours: formatHoursRange(hours),
  };
}

function getNextOpeningTime(weeklyHours: HoursData[], localNow: Date): string | null {
  const currentDay = localNow.getDay();

  // Check remaining days this week then wrap around
  for (let offset = 1; offset <= 7; offset++) {
    const checkDay = (currentDay + offset) % 7;
    const dayHours = weeklyHours.find((h) => h.dayOfWeek === checkDay);
    if (dayHours && !dayHours.isClosed && dayHours.openTime) {
      return `${DAY_NAMES[checkDay]} ${dayHours.openTime}`;
    }
  }

  return null;
}
