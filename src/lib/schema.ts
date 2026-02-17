import type { BrandData, HoursData, OpenStatus } from "./types";
import { t, type Locale } from "./i18n/translations";

const DAY_NAMES_SCHEMA = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function generateWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "IsItOpen",
    url: "https://isopenow.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://isopenow.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "IsItOpen",
    url: "https://isopenow.com",
    logo: "https://isopenow.com/favicon.ico",
  };
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

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

export function generateFaqJsonLd(
  brand: BrandData,
  hours: HoursData[],
  status: OpenStatus,
  locale: Locale = "en"
) {
  const sundayHours = hours.find((h) => h.dayOfWeek === 0);
  const sundayAnswer = sundayHours && !sundayHours.isClosed
    ? `${t(locale, "yes")}, ${brand.name} ${t(locale, "isOpenOn", { brand: brand.name, day: t(locale, "sunday") }).toLowerCase()} ${sundayHours.openTime}-${sundayHours.closeTime}.`
    : `${brand.name} ${t(locale, "closedToday")}.`;

  const todayAnswer = status.todayHours
    ? `${brand.name}: ${status.todayHours}.`
    : `${brand.name}: ${t(locale, "closedToday")}.`;

  const closesAnswer = status.isOpen
    ? `${brand.name} ${t(locale, "closesIn").toLowerCase()} ${status.closesIn || "soon"}.`
    : `${brand.name} ${t(locale, "opensAt").toLowerCase()} ${status.opensAt || "unknown"}.`;

  const holidayAnswer = `${brand.name} ${t(locale, "holiday").toLowerCase()} ${status.holidayName ? status.holidayName : t(locale, "no")}.`;
  const open24hAnswer = brand.is24h ? `${t(locale, "yes")}, ${brand.name} ${t(locale, "open24h").toLowerCase()}.` : `${t(locale, "no")}, ${brand.name} ${t(locale, "open24h").toLowerCase()}.`;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: t(locale, "title", { brand: brand.name }),
        acceptedAnswer: {
          "@type": "Answer",
          text: status.isOpen
            ? `${t(locale, "yes")}, ${brand.name} ${t(locale, "open").toLowerCase()}. ${todayAnswer}`
            : `${t(locale, "no")}, ${brand.name} ${t(locale, "closed").toLowerCase()}. ${closesAnswer}`,
        },
      },
      {
        "@type": "Question",
        name: t(locale, "whatTimeCloseQ", { brand: brand.name }),
        acceptedAnswer: {
          "@type": "Answer",
          text: closesAnswer,
        },
      },
      {
        "@type": "Question",
        name: t(locale, "openHolidaysQ", { brand: brand.name }),
        acceptedAnswer: {
          "@type": "Answer",
          text: holidayAnswer,
        },
      },
      {
        "@type": "Question",
        name: t(locale, "open24HoursQ", { brand: brand.name }),
        acceptedAnswer: {
          "@type": "Answer",
          text: open24hAnswer,
        },
      },
      {
        "@type": "Question",
        name: t(locale, "isOpenOn", { brand: brand.name, day: t(locale, "sunday") }),
        acceptedAnswer: {
          "@type": "Answer",
          text: sundayAnswer,
        },
      },
    ],
  };
}
