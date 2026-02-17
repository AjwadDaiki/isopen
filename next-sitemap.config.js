const LOCALES = ["en", "fr", "es", "de", "pt", "it", "ja", "ko", "nl", "pl", "sv", "ar", "hi", "zh", "tr"];
const BRAND_TEMPLATE = {
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

const DAY_CONNECTOR = {
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

const DAY_SLUGS = {
  en: { sunday: "sunday", monday: "monday", tuesday: "tuesday", wednesday: "wednesday", thursday: "thursday", friday: "friday", saturday: "saturday", christmas: "christmas", thanksgiving: "thanksgiving", "new-years": "new-years", easter: "easter" },
  fr: { sunday: "dimanche", monday: "lundi", tuesday: "mardi", wednesday: "mercredi", thursday: "jeudi", friday: "vendredi", saturday: "samedi", christmas: "noel", thanksgiving: "thanksgiving", "new-years": "nouvel-an", easter: "paques" },
  es: { sunday: "domingo", monday: "lunes", tuesday: "martes", wednesday: "miercoles", thursday: "jueves", friday: "viernes", saturday: "sabado", christmas: "navidad", thanksgiving: "accion-de-gracias", "new-years": "ano-nuevo", easter: "pascua" },
  de: { sunday: "sonntag", monday: "montag", tuesday: "dienstag", wednesday: "mittwoch", thursday: "donnerstag", friday: "freitag", saturday: "samstag", christmas: "weihnachten", thanksgiving: "thanksgiving", "new-years": "neujahr", easter: "ostern" },
  pt: { sunday: "domingo", monday: "segunda", tuesday: "terca", wednesday: "quarta", thursday: "quinta", friday: "sexta", saturday: "sabado", christmas: "natal", thanksgiving: "acao-de-gracas", "new-years": "ano-novo", easter: "pascoa" },
  it: { sunday: "domenica", monday: "lunedi", tuesday: "martedi", wednesday: "mercoledi", thursday: "giovedi", friday: "venerdi", saturday: "sabato", christmas: "natale", thanksgiving: "thanksgiving", "new-years": "capodanno", easter: "pasqua" },
  ja: { sunday: "nichiyobi", monday: "getsuyobi", tuesday: "kayobi", wednesday: "suiyobi", thursday: "mokuyobi", friday: "kinyobi", saturday: "doyobi", christmas: "kurisumasu", thanksgiving: "sankusugibingu", "new-years": "shinnen", easter: "iisutaa" },
  ko: { sunday: "il-yoil", monday: "wol-yoil", tuesday: "hwa-yoil", wednesday: "su-yoil", thursday: "mog-yoil", friday: "geum-yoil", saturday: "to-yoil", christmas: "keuriseumaseu", thanksgiving: "chuseok", "new-years": "saehae", easter: "buhwaljeol" },
  nl: { sunday: "zondag", monday: "maandag", tuesday: "dinsdag", wednesday: "woensdag", thursday: "donderdag", friday: "vrijdag", saturday: "zaterdag", christmas: "kerstmis", thanksgiving: "thanksgiving", "new-years": "nieuwjaar", easter: "pasen" },
  pl: { sunday: "niedziela", monday: "poniedzialek", tuesday: "wtorek", wednesday: "sroda", thursday: "czwartek", friday: "piatek", saturday: "sobota", christmas: "boze-narodzenie", thanksgiving: "thanksgiving", "new-years": "nowy-rok", easter: "wielkanoc" },
  sv: { sunday: "sondag", monday: "mandag", tuesday: "tisdag", wednesday: "onsdag", thursday: "torsdag", friday: "fredag", saturday: "lordag", christmas: "jul", thanksgiving: "thanksgiving", "new-years": "nyar", easter: "pask" },
  ar: { sunday: "al-ahad", monday: "al-ithnayn", tuesday: "ath-thulatha", wednesday: "al-arbia", thursday: "al-khamis", friday: "al-jumaa", saturday: "as-sabt", christmas: "eid-al-milad", thanksgiving: "thanksgiving", "new-years": "ras-as-sana", easter: "al-fisah" },
  hi: { sunday: "ravivar", monday: "somvar", tuesday: "mangalvar", wednesday: "budhvar", thursday: "guruvar", friday: "shukrvar", saturday: "shanivar", christmas: "krismas", thanksgiving: "thanksgiving", "new-years": "naya-saal", easter: "easter" },
  zh: { sunday: "zhou-ri", monday: "zhou-yi", tuesday: "zhou-er", wednesday: "zhou-san", thursday: "zhou-si", friday: "zhou-wu", saturday: "zhou-liu", christmas: "shengdanjie", thanksgiving: "ganyienjie", "new-years": "xinnian", easter: "fuhuojie" },
  tr: { sunday: "pazar", monday: "pazartesi", tuesday: "sali", wednesday: "carsamba", thursday: "persembe", friday: "cuma", saturday: "cumartesi", christmas: "noel", thanksgiving: "thanksgiving", "new-years": "yilbasi", easter: "paskalya" },
};

const reverseDayMap = Object.fromEntries(Object.entries(DAY_SLUGS.en).map(([key, value]) => [value, key]));

function buildBrandUrl(locale, slug) {
  const built = BRAND_TEMPLATE[locale].replace("{slug}", slug);
  return locale === "en" ? `/${built}` : `/${locale}/${built}`;
}

function buildDayUrl(locale, slug, day) {
  const daySlug = DAY_SLUGS[locale][day];
  if (locale === "en") return `/is-${slug}-open-on-${daySlug}`;
  const built = BRAND_TEMPLATE[locale].replace("{slug}", slug);
  return `/${locale}/${built}-${DAY_CONNECTOR[locale]}-${daySlug}`;
}

function alternateRefsForPath(path) {
  const refs = [];

  const addAllLocales = (builder) => {
    LOCALES.forEach((locale) => {
      refs.push({ href: `https://isopenow.com${builder(locale)}`, hreflang: locale });
    });
    refs.push({ href: `https://isopenow.com${builder("en")}`, hreflang: "x-default" });
  };

  if (path === "/") {
    addAllLocales((locale) => (locale === "en" ? "/" : `/${locale}`));
    return refs;
  }

  const brandMatch = path.match(/^\/brand\/([^/]+)$/);
  if (brandMatch) {
    const slug = brandMatch[1];
    addAllLocales((locale) => buildBrandUrl(locale, slug));
    return refs;
  }

  const dayMatch = path.match(/^\/brand\/([^/]+)\/([^/]+)$/);
  if (dayMatch) {
    const slug = dayMatch[1];
    const day = dayMatch[2];
    if (reverseDayMap[day]) {
      addAllLocales((locale) => buildDayUrl(locale, slug, reverseDayMap[day]));
    }
    return refs;
  }

  const localeBrandMatch = path.match(/^\/(fr|es|de|pt|it|ja|ko|nl|pl|sv|ar|hi|zh|tr)\/brand\/([^/]+)$/);
  if (localeBrandMatch) {
    const slug = localeBrandMatch[2];
    addAllLocales((locale) => buildBrandUrl(locale, slug));
    return refs;
  }

  const localeDayMatch = path.match(/^\/(fr|es|de|pt|it|ja|ko|nl|pl|sv|ar|hi|zh|tr)\/brand\/([^/]+)\/([^/]+)$/);
  if (localeDayMatch && reverseDayMap[localeDayMatch[3]]) {
    const slug = localeDayMatch[2];
    const day = reverseDayMap[localeDayMatch[3]];
    addAllLocales((locale) => buildDayUrl(locale, slug, day));
    return refs;
  }

  const categoryMatch = path.match(/^\/category\/([^/]+)$/);
  if (categoryMatch) {
    const slug = categoryMatch[1];
    addAllLocales((locale) => (locale === "en" ? `/category/${slug}` : `/${locale}/category/${slug}`));
    return refs;
  }

  const localeCategoryMatch = path.match(/^\/(fr|es|de|pt|it|ja|ko|nl|pl|sv|ar|hi|zh|tr)\/category\/([^/]+)$/);
  if (localeCategoryMatch) {
    const slug = localeCategoryMatch[2];
    addAllLocales((locale) => (locale === "en" ? `/category/${slug}` : `/${locale}/category/${slug}`));
    return refs;
  }

  const localeHomeMatch = path.match(/^\/(fr|es|de|pt|it|ja|ko|nl|pl|sv|ar|hi|zh|tr)$/);
  if (localeHomeMatch) {
    addAllLocales((locale) => (locale === "en" ? "/" : `/${locale}`));
    return refs;
  }

  return refs;
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://isopenow.com",
  generateRobotsTxt: true,
  changefreq: "daily",
  priority: 0.8,
  sitemapSize: 5000,
  exclude: ["/api/*"],
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
  transform: async (config, path) => {
    const isBrandPage = /^\/brand\/[^/]+$/.test(path) || /^\/(fr|es|de|pt|it|ja|ko|nl|pl|sv|ar|hi|zh|tr)\/brand\/[^/]+$/.test(path);
    const isHome = path === "/" || /^\/(fr|es|de|pt|it|ja|ko|nl|pl|sv|ar|hi|zh|tr)$/.test(path);
    const isCategory = /\/category\//.test(path);

    let priority = 0.6;
    let changefreq = "weekly";

    if (isHome) {
      priority = 1.0;
      changefreq = "daily";
    } else if (isBrandPage) {
      priority = 0.9;
      changefreq = "daily";
    } else if (isCategory) {
      priority = 0.8;
      changefreq = "daily";
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
      alternateRefs: alternateRefsForPath(path),
    };
  },
};
