import type { BrandData, HoursData } from "./types";

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
