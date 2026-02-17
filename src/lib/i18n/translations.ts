export const LOCALES = [
  "en",
  "fr",
  "es",
  "de",
  "pt",
  "it",
  "ja",
  "ko",
  "nl",
  "pl",
  "sv",
  "ar",
  "hi",
  "zh",
  "tr",
] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Francais",
  es: "Espanol",
  de: "Deutsch",
  pt: "Portugues",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
  nl: "Nederlands",
  pl: "Polski",
  sv: "Svenska",
  ar: "العربية",
  hi: "हिन्दी",
  zh: "中文",
  tr: "Turkce",
};

const en = {
  title: "Is {{brand}} Open Right Now?",
  titleWithYear: "Is {{brand}} Open Right Now? [{{year}} Hours]",
  description:
    "Check if {{brand}} is open right now. Real-time status, today's hours, holiday schedule and closing time countdown.",
  open: "OPEN",
  closed: "CLOSED",
  closesIn: "Closes in",
  opensAt: "Opens at",
  todayHours: "Today's hours",
  localTime: "Local time",
  holiday: "Holiday",
  openingHours: "Opening hours",
  timezone: "Timezone",
  peopleAlsoChecked: "People also checked",
  trendingNow: "Trending right now",
  getDirections: "Get Directions",
  shareHours: "Share hours",
  home: "Home",
  closedToday: "Closed today",
  open24h: "Open 24 hours",
  heroTitle: "Is it <green>open</green> right now?",
  heroSub:
    "Instantly check if any store, restaurant, or service is open. Real-time status, weekly hours, holiday schedules.",
  realTimeStatus: "REAL-TIME STATUS",
  reportIssue: "Report hours issue",
  liveReports: "Live user reports",
  viewAll: "View all",
  confirmedOpen: "Confirmed open",
  confirmedClosed: "Confirmed closed",
  wrongHours: "Wrong hours reported",
  submitReport: "Submit report",
  categoryTitle: "{{category}} - What's Open Now?",
  categoryDesc:
    "Check which {{category}} places are open right now. Real-time status for all major brands.",
  onDay: "Is {{brand}} Open on {{day}}?",
  onDayDesc:
    "Check {{brand}} hours on {{day}}. Opening time, closing time, and whether it's typically open.",
  footer: "Real-time opening hours for any store",
  notFound: "Brand not found",
  notFoundDesc: "We couldn't find hours for this place. Try searching for another brand.",
  backHome: "Back to homepage",
  yes: "Yes",
  no: "No",
  isOpenOn: "Is {{brand}} open on {{day}}?",
  typicalHours: "Typical hours on {{day}}",
  allWeekHours: "Full week hours",
  whatTimeCloseQ: "What time does {{brand}} close today?",
  openHolidaysQ: "Is {{brand}} open on holidays?",
  open24HoursQ: "Is {{brand}} open 24 hours?",
  nearestOpen: "The nearest {{brand}} to you is open now",
  nearestClosed: "The nearest {{brand}} to you is closed right now",
  openNowLabel: "OPEN NOW",
  closedNowLabel: "CLOSED NOW",
  officialWebsite: "Official website",
  sharePage: "Share page",
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
} as const;

export type TranslationKey = keyof typeof en;
type TranslationDict = Record<TranslationKey, string>;

const translations: Record<Locale, TranslationDict> = {
  en,
  fr: {
    ...en,
    title: "{{brand}} est-il ouvert maintenant ?",
    titleWithYear: "{{brand}} est-il ouvert ? [Horaires {{year}}]",
    description:
      "Verifiez si {{brand}} est ouvert maintenant. Statut en temps reel, horaires du jour, jours feries et compte a rebours de fermeture.",
    open: "OUVERT",
    closed: "FERME",
    nearestOpen: "Le {{brand}} le plus proche de chez vous est ouvert maintenant",
    nearestClosed: "Le {{brand}} le plus proche de chez vous est ferme pour le moment",
    openNowLabel: "OUVERT",
    closedNowLabel: "FERME",
    officialWebsite: "Site officiel",
    sharePage: "Partager la page",
  },
  es: {
    ...en,
    title: "¿Esta {{brand}} abierto ahora?",
    titleWithYear: "¿Esta {{brand}} abierto? [Horarios {{year}}]",
    description:
      "Comprueba si {{brand}} esta abierto ahora. Estado en tiempo real, horarios de hoy, festivos y cuenta atras de cierre.",
    open: "ABIERTO",
    closed: "CERRADO",
    nearestOpen: "El {{brand}} mas cercano a ti esta abierto ahora",
    nearestClosed: "El {{brand}} mas cercano a ti esta cerrado ahora",
  },
  de: {
    ...en,
    title: "Hat {{brand}} jetzt geoffnet?",
    titleWithYear: "Hat {{brand}} jetzt geoffnet? [Offnungszeiten {{year}}]",
    description:
      "Prufen Sie, ob {{brand}} jetzt geoffnet ist. Echtzeitstatus, heutige Offnungszeiten und Feiertagszeiten.",
    open: "GEOFFNET",
    closed: "GESCHLOSSEN",
    nearestOpen: "Der nachste {{brand}} in Ihrer Nahe ist jetzt geoffnet",
    nearestClosed: "Der nachste {{brand}} in Ihrer Nahe ist derzeit geschlossen",
  },
  pt: {
    ...en,
    title: "O {{brand}} esta aberto agora?",
    titleWithYear: "O {{brand}} esta aberto agora? [Horario {{year}}]",
    description:
      "Veja se {{brand}} esta aberto agora. Status em tempo real, horario de hoje e feriados.",
    open: "ABERTO",
    closed: "FECHADO",
  },
  it: {
    ...en,
    title: "{{brand}} e aperto adesso?",
    titleWithYear: "{{brand}} e aperto adesso? [Orari {{year}}]",
    description:
      "Controlla se {{brand}} e aperto ora. Stato in tempo reale, orari di oggi e festivi.",
    open: "APERTO",
    closed: "CHIUSO",
  },
  ja: {
    ...en,
    title: "{{brand}}は今営業中？",
    titleWithYear: "{{brand}}は今営業中？【{{year}}年 営業時間】",
    description:
      "{{brand}}が今営業中か確認。リアルタイムの営業状況、本日の営業時間、祝日情報を表示。",
    open: "営業中",
    closed: "営業時間外",
  },
  ko: {
    ...en,
    title: "{{brand}} 지금 영업중인가요?",
    titleWithYear: "{{brand}} 지금 영업중인가요? [{{year}} 영업시간]",
    description:
      "{{brand}}의 현재 영업 여부를 확인하세요. 실시간 상태, 오늘 영업시간, 공휴일 정보를 제공합니다.",
    open: "영업중",
    closed: "영업종료",
  },
  nl: {
    ...en,
    title: "Is {{brand}} nu open?",
    titleWithYear: "Is {{brand}} nu open? [Openingstijden {{year}}]",
    description:
      "Controleer of {{brand}} nu open is. Real-time status, openingstijden van vandaag en feestdagen.",
    open: "OPEN",
    closed: "GESLOTEN",
  },
  pl: {
    ...en,
    title: "Czy {{brand}} jest teraz otwarte?",
    titleWithYear: "Czy {{brand}} jest teraz otwarte? [Godziny {{year}}]",
    description:
      "Sprawdz, czy {{brand}} jest teraz otwarte. Status na zywo, godziny na dzis i swieta.",
    open: "OTWARTE",
    closed: "ZAMKNIETE",
  },
  sv: {
    ...en,
    title: "Ar {{brand}} oppet nu?",
    titleWithYear: "Ar {{brand}} oppet nu? [Oppettider {{year}}]",
    description:
      "Kontrollera om {{brand}} ar oppet nu. Realtidsstatus, dagens oppettider och helgdagar.",
    open: "OPPET",
    closed: "STANGT",
  },
  ar: {
    ...en,
    title: "هل {{brand}} مفتوح الآن؟",
    titleWithYear: "هل {{brand}} مفتوح الآن؟ [ساعات {{year}}]",
    description:
      "تحقق مما إذا كان {{brand}} مفتوحا الآن. حالة فورية وساعات اليوم والعطلات.",
    open: "مفتوح",
    closed: "مغلق",
  },
  hi: {
    ...en,
    title: "क्या {{brand}} अभी खुला है?",
    titleWithYear: "क्या {{brand}} अभी खुला है? [समय {{year}}]",
    description:
      "देखें {{brand}} अभी खुला है या नहीं। रियल-टाइम स्टेटस, आज का समय और छुट्टियां।",
    open: "खुला",
    closed: "बंद",
  },
  zh: {
    ...en,
    title: "{{brand}} 现在营业吗？",
    titleWithYear: "{{brand}} 现在营业吗？[{{year}} 营业时间]",
    description:
      "查看 {{brand}} 现在是否营业。提供实时状态、今日营业时间和节假日信息。",
    open: "营业中",
    closed: "已关闭",
  },
  tr: {
    ...en,
    title: "{{brand}} simdi acik mi?",
    titleWithYear: "{{brand}} simdi acik mi? [Calisma saatleri {{year}}]",
    description:
      "{{brand}} su an acik mi kontrol edin. Gercek zamanli durum, bugunku saatler ve tatiller.",
    open: "ACIK",
    closed: "KAPALI",
  },
};

export function t(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string>
): string {
  let text = translations[locale]?.[key] || translations.en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
    }
  }
  return text;
}

export function getLocaleFromPath(path: string): Locale {
  const seg = path.split("/")[1];
  if (LOCALES.includes(seg as Locale) && seg !== "en") return seg as Locale;
  return "en";
}

export function getNonEnglishLocales(): Locale[] {
  return LOCALES.filter((l) => l !== "en") as Locale[];
}
