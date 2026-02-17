import { LOCALES, type Locale } from "./translations";

export const CANONICAL_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "christmas",
  "thanksgiving",
  "new-years",
  "easter",
] as const;

export type CanonicalDay = (typeof CANONICAL_DAYS)[number];

export const DAY_SLUGS: Record<Locale, Record<CanonicalDay, string>> = {
  en: {
    sunday: "sunday",
    monday: "monday",
    tuesday: "tuesday",
    wednesday: "wednesday",
    thursday: "thursday",
    friday: "friday",
    saturday: "saturday",
    christmas: "christmas",
    thanksgiving: "thanksgiving",
    "new-years": "new-years",
    easter: "easter",
  },
  fr: {
    sunday: "dimanche",
    monday: "lundi",
    tuesday: "mardi",
    wednesday: "mercredi",
    thursday: "jeudi",
    friday: "vendredi",
    saturday: "samedi",
    christmas: "noel",
    thanksgiving: "thanksgiving",
    "new-years": "nouvel-an",
    easter: "paques",
  },
  es: {
    sunday: "domingo",
    monday: "lunes",
    tuesday: "martes",
    wednesday: "miercoles",
    thursday: "jueves",
    friday: "viernes",
    saturday: "sabado",
    christmas: "navidad",
    thanksgiving: "accion-de-gracias",
    "new-years": "ano-nuevo",
    easter: "pascua",
  },
  de: {
    sunday: "sonntag",
    monday: "montag",
    tuesday: "dienstag",
    wednesday: "mittwoch",
    thursday: "donnerstag",
    friday: "freitag",
    saturday: "samstag",
    christmas: "weihnachten",
    thanksgiving: "thanksgiving",
    "new-years": "neujahr",
    easter: "ostern",
  },
  pt: {
    sunday: "domingo",
    monday: "segunda",
    tuesday: "terca",
    wednesday: "quarta",
    thursday: "quinta",
    friday: "sexta",
    saturday: "sabado",
    christmas: "natal",
    thanksgiving: "acao-de-gracas",
    "new-years": "ano-novo",
    easter: "pascoa",
  },
  it: {
    sunday: "domenica",
    monday: "lunedi",
    tuesday: "martedi",
    wednesday: "mercoledi",
    thursday: "giovedi",
    friday: "venerdi",
    saturday: "sabato",
    christmas: "natale",
    thanksgiving: "thanksgiving",
    "new-years": "capodanno",
    easter: "pasqua",
  },
  ja: {
    sunday: "nichiyobi",
    monday: "getsuyobi",
    tuesday: "kayobi",
    wednesday: "suiyobi",
    thursday: "mokuyobi",
    friday: "kinyobi",
    saturday: "doyobi",
    christmas: "kurisumasu",
    thanksgiving: "sankusugibingu",
    "new-years": "shinnen",
    easter: "iisutaa",
  },
  ko: {
    sunday: "il-yoil",
    monday: "wol-yoil",
    tuesday: "hwa-yoil",
    wednesday: "su-yoil",
    thursday: "mog-yoil",
    friday: "geum-yoil",
    saturday: "to-yoil",
    christmas: "keuriseumaseu",
    thanksgiving: "chuseok",
    "new-years": "saehae",
    easter: "buhwaljeol",
  },
  nl: {
    sunday: "zondag",
    monday: "maandag",
    tuesday: "dinsdag",
    wednesday: "woensdag",
    thursday: "donderdag",
    friday: "vrijdag",
    saturday: "zaterdag",
    christmas: "kerstmis",
    thanksgiving: "thanksgiving",
    "new-years": "nieuwjaar",
    easter: "pasen",
  },
  pl: {
    sunday: "niedziela",
    monday: "poniedzialek",
    tuesday: "wtorek",
    wednesday: "sroda",
    thursday: "czwartek",
    friday: "piatek",
    saturday: "sobota",
    christmas: "boze-narodzenie",
    thanksgiving: "thanksgiving",
    "new-years": "nowy-rok",
    easter: "wielkanoc",
  },
  sv: {
    sunday: "sondag",
    monday: "mandag",
    tuesday: "tisdag",
    wednesday: "onsdag",
    thursday: "torsdag",
    friday: "fredag",
    saturday: "lordag",
    christmas: "jul",
    thanksgiving: "thanksgiving",
    "new-years": "nyar",
    easter: "pask",
  },
  ar: {
    sunday: "al-ahad",
    monday: "al-ithnayn",
    tuesday: "ath-thulatha",
    wednesday: "al-arbia",
    thursday: "al-khamis",
    friday: "al-jumaa",
    saturday: "as-sabt",
    christmas: "eid-al-milad",
    thanksgiving: "thanksgiving",
    "new-years": "ras-as-sana",
    easter: "al-fisah",
  },
  hi: {
    sunday: "ravivar",
    monday: "somvar",
    tuesday: "mangalvar",
    wednesday: "budhvar",
    thursday: "guruvar",
    friday: "shukrvar",
    saturday: "shanivar",
    christmas: "krismas",
    thanksgiving: "thanksgiving",
    "new-years": "naya-saal",
    easter: "easter",
  },
  zh: {
    sunday: "zhou-ri",
    monday: "zhou-yi",
    tuesday: "zhou-er",
    wednesday: "zhou-san",
    thursday: "zhou-si",
    friday: "zhou-wu",
    saturday: "zhou-liu",
    christmas: "shengdanjie",
    thanksgiving: "ganyienjie",
    "new-years": "xinnian",
    easter: "fuhuojie",
  },
  tr: {
    sunday: "pazar",
    monday: "pazartesi",
    tuesday: "sali",
    wednesday: "carsamba",
    thursday: "persembe",
    friday: "cuma",
    saturday: "cumartesi",
    christmas: "noel",
    thanksgiving: "thanksgiving",
    "new-years": "yilbasi",
    easter: "paskalya",
  },
};

const BRAND_TEMPLATE: Record<Locale, string> = {
  en: "is-{slug}-open",
  fr: "est-ouvert-{slug}",
  es: "esta-abierto-{slug}",
  de: "ist-{slug}-geoeffnet",
  pt: "esta-aberto-{slug}",
  it: "e-aperto-{slug}",
  ja: "{slug}-eigyou-jikan",
  ko: "{slug}-yeong-eob-jungan",
  nl: "is-{slug}-open",
  pl: "czy-{slug}-jest-otwarte",
  sv: "ar-{slug}-oppet",
  ar: "hal-{slug}-maftuh-alan",
  hi: "kya-{slug}-khula-hai",
  zh: "{slug}-yingye-shijian",
  tr: "{slug}-acik-mi",
};

const DAY_CONNECTOR: Record<Locale, string> = {
  en: "on",
  fr: "le",
  es: "el",
  de: "am",
  pt: "no",
  it: "il",
  ja: "on",
  ko: "on",
  nl: "op",
  pl: "w",
  sv: "pa",
  ar: "fi",
  hi: "ko",
  zh: "on",
  tr: "gunu",
};

export function buildBrandUrl(locale: Locale, slug: string): string {
  const built = BRAND_TEMPLATE[locale].replace("{slug}", slug);
  if (locale === "en") return `/${built}`;
  return `/${locale}/${built}`;
}

export function buildDayUrl(locale: Locale, slug: string, day: CanonicalDay): string {
  const daySlug = DAY_SLUGS[locale][day];
  if (locale === "en") {
    return `/is-${slug}-open-on-${daySlug}`;
  }
  const brandSlug = BRAND_TEMPLATE[locale].replace("{slug}", slug);
  return `/${locale}/${brandSlug}-${DAY_CONNECTOR[locale]}-${daySlug}`;
}

export function getDayFromLocalizedSlug(locale: Locale, localizedDay: string): CanonicalDay | null {
  const entries = Object.entries(DAY_SLUGS[locale]) as [CanonicalDay, string][];
  const found = entries.find(([, value]) => value === localizedDay);
  return found?.[0] || null;
}

export function getAllLocaleBrandPatterns(): Array<{ locale: Locale; pattern: string }> {
  return LOCALES.filter((locale) => locale !== "en").map((locale) => ({
    locale,
    pattern: BRAND_TEMPLATE[locale],
  }));
}

export function getLocaleDayConnector(locale: Locale): string {
  return DAY_CONNECTOR[locale];
}

export function getLocaleBrandTemplate(locale: Locale): string {
  return BRAND_TEMPLATE[locale];
}

export function parseLocalizedPath(pathname: string): {
  slug?: string;
  day?: CanonicalDay;
  kind: "home" | "brand" | "day" | "category" | "other";
} {
  if (pathname === "/") return { kind: "home" };

  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];

  if (first === "category" && parts[1]) return { kind: "category" };

  const enBrand = pathname.match(/^\/is-([a-z0-9-]+)-open$/);
  if (enBrand) return { kind: "brand", slug: enBrand[1] };

  const enDay = pathname.match(/^\/is-([a-z0-9-]+)-open-on-([a-z0-9-]+)$/);
  if (enDay) {
    const day = getDayFromLocalizedSlug("en", enDay[2]);
    return { kind: "day", slug: enDay[1], day: day || undefined };
  }

  if (!LOCALES.includes(first as Locale) || first === "en") return { kind: "other" };

  const locale = first as Locale;
  if (parts.length === 1) return { kind: "home" };

  if (parts[1] === "category") return { kind: "category" };

  const template = BRAND_TEMPLATE[locale];
  const escaped = template.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("\\{slug\\}", "([a-z0-9-]+)");
  const brandRegex = new RegExp(`^\/${locale}\/${escaped}$`);
  const brandMatch = pathname.match(brandRegex);
  if (brandMatch) return { kind: "brand", slug: brandMatch[1] };

  const connector = DAY_CONNECTOR[locale];
  const dayRegex = new RegExp(`^\/${locale}\/${escaped}-${connector}-([a-z0-9-]+)$`);
  const dayMatch = pathname.match(dayRegex);
  if (dayMatch) {
    const day = getDayFromLocalizedSlug(locale, dayMatch[2]);
    return { kind: "day", slug: dayMatch[1], day: day || undefined };
  }

  return { kind: "other" };
}
