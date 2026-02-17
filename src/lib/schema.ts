import type { BrandData, HoursData, OpenStatus } from "./types";

const DAY_NAMES_SCHEMA = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function generateJsonLd(
  brand: BrandData,
  weeklyHours: HoursData[],
  currentUrl: string
) {
  const openingHours = weeklyHours
    .filter((h) => !h.isClosed && h.openTime && h.closeTime)
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_NAMES_SCHEMA[h.dayOfWeek],
      opens: h.openTime,
      closes: h.closeTime,
    }));

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: brand.name,
    url: brand.website || currentUrl,
    ...(brand.logoUrl ? { logo: brand.logoUrl } : {}),
    openingHoursSpecification: openingHours,
    isAccessibleForFree: true,
  };
}

/** Generate FAQ JSON-LD for Google rich results */
export function generateFaqJsonLd(
  brand: BrandData,
  hours: HoursData[],
  status: OpenStatus
) {
  const sundayHours = hours.find((h) => h.dayOfWeek === 0);
  const sundayAnswer = sundayHours && !sundayHours.isClosed
    ? `Yes, ${brand.name} is typically open on Sundays from ${sundayHours.openTime} to ${sundayHours.closeTime}.`
    : `${brand.name} is typically closed on Sundays.`;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is ${brand.name} open right now?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: status.isOpen
            ? `Yes, ${brand.name} is currently open.${status.todayHours ? ` Today's hours are ${status.todayHours}.` : ""}${status.closesIn ? ` It closes in ${status.closesIn}.` : ""}`
            : `No, ${brand.name} is currently closed.${status.opensAt ? ` It opens at ${status.opensAt}.` : ""}`,
        },
      },
      {
        "@type": "Question",
        name: `What are ${brand.name} hours today?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: status.todayHours
            ? `${brand.name} is open from ${status.todayHours} today.`
            : `${brand.name} is closed today.`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${brand.name} open on Sunday?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: sundayAnswer,
        },
      },
    ],
  };
}
