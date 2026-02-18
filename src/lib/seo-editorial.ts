import type { BrandData, HoursData, OpenStatus } from "@/lib/types";

type EditorialSection = {
  title: string;
  body: string;
};

export interface EditorialContent {
  kicker: string;
  intro: string;
  sections: EditorialSection[];
  bullets: string[];
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(values: T[], seed: number, offset = 0): T {
  return values[(seed + offset) % values.length];
}

function toMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function dayName(dayOfWeek: number): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek];
}

function weeklySignals(hours: HoursData[]) {
  const openDays = hours.filter((day) => !day.isClosed && day.openTime && day.closeTime);
  const closedDays = hours.filter((day) => day.isClosed).map((day) => dayName(day.dayOfWeek));
  const earliest = openDays.reduce<string | null>((acc, day) => {
    if (!day.openTime) return acc;
    if (!acc) return day.openTime;
    return toMinutes(day.openTime) < toMinutes(acc) ? day.openTime : acc;
  }, null);
  const latest = openDays.reduce<string | null>((acc, day) => {
    if (!day.closeTime) return acc;
    if (!acc) return day.closeTime;
    return toMinutes(day.closeTime) > toMinutes(acc) ? day.closeTime : acc;
  }, null);
  const weekendOpen = openDays.filter((day) => day.dayOfWeek === 0 || day.dayOfWeek === 6).length;

  return {
    openDays: openDays.length,
    closedDays,
    earliest,
    latest,
    weekendOpen,
  };
}

export function buildBrandEditorial(
  brand: BrandData,
  hours: HoursData[],
  status: OpenStatus
): EditorialContent {
  const seed = hashSeed(brand.slug);
  const signals = weeklySignals(hours);
  const pacing = pick(
    ["Commuter-friendly checks", "Errand-hour checks", "Late-window checks", "Weekend planning"],
    seed
  );
  const introAngle = pick(
    [
      "Most users check this page before commuting, ordering, or making a quick stop.",
      "This page is updated for fast yes/no decisions before you leave.",
      "Use this view as a fast pre-visit filter before calling a specific location.",
      "These schedule signals help avoid wasted trips during peak hours.",
    ],
    seed,
    1
  );
  const holidayAngle = pick(
    [
      "Holiday hours are the biggest source of schedule surprises for national chains.",
      "Holiday windows can differ even when regular weekly hours are stable.",
      "Local branches often adjust staffing during holiday periods.",
      "Seasonal events can shift closing time even when daily patterns look normal.",
    ],
    seed,
    2
  );

  const closedDaysLine =
    signals.closedDays.length > 0
      ? `${brand.name} is usually closed on ${signals.closedDays.join(", ")}.`
      : `${brand.name} typically has availability all week.`;

  const earliestLine = signals.earliest
    ? `Earliest typical opening: ${formatTime(signals.earliest)}.`
    : "Opening time can vary by location.";
  const latestLine = signals.latest
    ? `Latest typical closing: ${formatTime(signals.latest)}.`
    : "Closing time can vary by location.";

  return {
    kicker: pacing,
    intro: `${introAngle} Right now, the status is ${status.isOpen ? "open" : "closed"} for your current timezone.`,
    sections: [
      {
        title: `Best Time Windows for ${brand.name}`,
        body: `${earliestLine} ${latestLine} ${closedDaysLine}`,
      },
      {
        title: `How to Avoid Bad Timing`,
        body: `Check today hours first, then compare with your travel time. If the page shows "closes in", treat that as a soft window and confirm branch-level details when timing is tight.`,
      },
      {
        title: `${brand.name} and Holiday Hours`,
        body: `${holidayAngle} For high-stakes visits, verify the nearest branch directly and use this page as the baseline reference.`,
      },
    ],
    bullets: [
      `${signals.openDays} typical open days each week`,
      signals.weekendOpen > 0 ? "Weekend service available in many locations" : "Weekend availability is limited",
      brand.is24h ? "Some locations may operate 24/7" : "Many locations follow fixed daily windows",
    ],
  };
}

export function buildCategoryEditorial(
  category: string,
  brands: BrandData[]
): EditorialContent {
  const seed = hashSeed(category.toLowerCase());
  const topBrands = brands.slice(0, 3).map((brand) => brand.name).join(", ");
  const angle = pick(
    [
      "High-intent searches in this category often happen right before a visit.",
      "This category has strong daypart behavior, so timing matters more than average.",
      "Users in this category are typically looking for immediate open/closed certainty.",
      "This category frequently sees schedule differences between weekdays and weekends.",
    ],
    seed
  );
  const qualityAngle = pick(
    [
      "Always treat local branch exceptions as possible, especially near holidays.",
      "National patterns help, but branch-level staffing can still change late in the day.",
      "Location-level schedule overrides are common around local events.",
      "Category-wide trends are useful, but last-mile accuracy still depends on branch policy.",
    ],
    seed,
    2
  );

  return {
    kicker: "Category intent map",
    intro: `${angle} This page tracks major ${category.toLowerCase()} brands in one place for faster decisions.`,
    sections: [
      {
        title: `How to Use This ${category} Page`,
        body: `Start with the current status badge, then open the brand detail page for day-by-day hours and countdown logic.`,
      },
      {
        title: `Most Checked ${category} Brands`,
        body: topBrands
          ? `Users frequently compare ${topBrands} before deciding where to go.`
          : `Users typically compare several brands before deciding where to go.`,
      },
      {
        title: `Quality Notes`,
        body: qualityAngle,
      },
    ],
    bullets: [
      `${brands.length} major brands tracked`,
      "Live open/closed checks",
      "Day-specific and holiday-specific pages linked",
    ],
  };
}

export function buildBrandCityEditorial(
  brandName: string,
  cityName: string,
  state: string,
  timezone: string,
  category: string,
  isOpen: boolean,
  todayHours: string | null
): EditorialContent {
  const seed = hashSeed(`${brandName}-${cityName}-${state}`);
  const angle = pick(
    [
      `Looking for ${brandName} in ${cityName}? This page provides real-time opening status using ${timezone}.`,
      `Before heading to ${brandName} in ${cityName}, ${state}, confirm the current status here.`,
      `${brandName} operates on ${timezone} time in ${cityName}. Check the live status below before visiting.`,
      `Planning a visit to ${brandName} in the ${cityName} area? We track live hours and status for quick decisions.`,
    ],
    seed
  );
  const localAngle = pick(
    [
      `${cityName} has multiple ${brandName} locations. Hours shown are the most common brand-level schedule.`,
      `Branch hours can differ across ${cityName}, especially in suburban vs. downtown areas.`,
      `Most ${brandName} in ${cityName}, ${state} follow the national schedule, with minor local variations possible.`,
      `If you need exact branch hours in ${cityName}, confirm with the nearest location after checking here.`,
    ],
    seed,
    1
  );

  return {
    kicker: `${brandName} in ${cityName} — Live Check`,
    intro: angle,
    sections: [
      {
        title: `Is ${brandName} Open Now in ${cityName}?`,
        body: isOpen
          ? `Yes, ${brandName} is currently open in the ${cityName} area. Today's typical hours: ${todayHours || "check below"}.`
          : `${brandName} is currently closed in ${cityName}. Check below for the next opening time.`,
      },
      {
        title: `${brandName} Hours in ${cityName}, ${state}`,
        body: localAngle,
      },
      {
        title: `Other ${category} Options in ${cityName}`,
        body: `If ${brandName} doesn't fit your schedule, explore other ${category.toLowerCase()} brands open now in ${cityName} using our city page.`,
      },
    ],
    bullets: [
      `Real-time status for ${cityName}, ${state}`,
      `Timezone: ${timezone}`,
      isOpen ? "Currently open" : "Currently closed",
    ],
  };
}

export function buildCityEditorial(
  cityName: string,
  state: string,
  timezone: string,
  openCount: number,
  totalCount: number
): EditorialContent {
  const seed = hashSeed(`${cityName}-${state}`);
  const angle = pick(
    [
      "City-level intent is usually immediate: users want open now, not generic hours.",
      "Urban schedule checks are often done from mobile just before arrival.",
      "Local timing differences make timezone-aware status essential for accuracy.",
      "Dense metro areas have more branch variation, so quick verification matters.",
    ],
    seed
  );

  return {
    kicker: "Local demand snapshot",
    intro: `${angle} This page focuses on ${cityName}, ${state} using ${timezone} as the reference timezone.`,
    sections: [
      {
        title: `What Is Open in ${cityName} Right Now`,
        body: `${openCount} out of ${totalCount} tracked brands are currently open based on their typical weekly schedule.`,
      },
      {
        title: "How to Use City Pages",
        body: "Use city pages for fast local discovery, then open brand pages to confirm countdown, holiday notes, and branch-level caveats.",
      },
      {
        title: "Coverage Limits",
        body: "Schedules shown here reflect brand-level patterns. Specific branch hours can vary due to local operations, staffing, and events.",
      },
    ],
    bullets: [
      `${totalCount} priority brands monitored`,
      "Timezone-aware live checks",
      "Internal links to brand and category detail pages",
    ],
  };
}

export function buildCityCategoryEditorial(
  cityName: string,
  state: string,
  category: string,
  openCount: number,
  totalCount: number
): EditorialContent {
  const seed = hashSeed(`${cityName}-${state}-${category}`);
  const angle = pick(
    [
      `Searches like "${category.toLowerCase()} open now in ${cityName}" are highly time-sensitive and usually happen before a physical visit.`,
      `This page targets urgent local intent for ${category.toLowerCase()} checks in ${cityName}, ${state}.`,
      `Users often compare several ${category.toLowerCase()} options within minutes before deciding where to go.`,
      `City + category pages help reduce wasted trips when schedules change during evenings and weekends.`,
    ],
    seed
  );
  const qualityNote = pick(
    [
      "Use this page for quick decisions, then confirm the nearest branch when timing is tight.",
      "Brand-level schedules are strong baselines, but local branch exceptions can still happen.",
      "Holiday periods and local events can affect availability even when weekly patterns are stable.",
      "For high-stakes visits, always verify address-level details before departure.",
    ],
    seed,
    1
  );

  return {
    kicker: "City + category intent",
    intro: `${angle} Right now, ${openCount} of ${totalCount} tracked ${category.toLowerCase()} brands appear open in ${cityName}.`,
    sections: [
      {
        title: `${category} Open Now in ${cityName}, ${state}`,
        body: `This page groups top ${category.toLowerCase()} brands relevant to ${cityName} so users can compare open/closed status instantly.`,
      },
      {
        title: `How to Use This ${cityName} ${category} Page`,
        body: "Start with open status badges, then open a brand page for countdown, weekly schedule, and holiday notes.",
      },
      {
        title: "Accuracy and Freshness Notes",
        body: qualityNote,
      },
    ],
    bullets: [
      `${totalCount} tracked ${category.toLowerCase()} brands`,
      `${openCount} currently open now`,
      "Direct links to brand + city detail pages",
    ],
  };
}
