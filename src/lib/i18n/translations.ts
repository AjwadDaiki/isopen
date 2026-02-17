export const LOCALES = ["en", "fr", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
};

const translations = {
  en: {
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
    confirmedOpen: "Confirmed open",
    confirmedClosed: "Confirmed closed",
    wrongHours: "Wrong hours reported",
    submitReport: "Submit report",
    categoryTitle: "{{category}} — What's Open Now?",
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
    // Days
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
  },
  fr: {
    title: "{{brand}} est-il ouvert maintenant ?",
    titleWithYear: "{{brand}} est-il ouvert ? [Horaires {{year}}]",
    description:
      "Vérifiez si {{brand}} est ouvert maintenant. Statut en temps réel, horaires du jour, jours fériés et compte à rebours de fermeture.",
    open: "OUVERT",
    closed: "FERMÉ",
    closesIn: "Ferme dans",
    opensAt: "Ouvre à",
    todayHours: "Horaires du jour",
    localTime: "Heure locale",
    holiday: "Jour férié",
    openingHours: "Horaires d'ouverture",
    timezone: "Fuseau horaire",
    peopleAlsoChecked: "Les gens ont aussi vérifié",
    trendingNow: "Tendances du moment",
    getDirections: "Itinéraire",
    shareHours: "Partager les horaires",
    home: "Accueil",
    closedToday: "Fermé aujourd'hui",
    open24h: "Ouvert 24h/24",
    heroTitle: "Est-ce <green>ouvert</green> maintenant ?",
    heroSub:
      "Vérifiez instantanément si un magasin, restaurant ou service est ouvert. Statut en temps réel, horaires, jours fériés.",
    realTimeStatus: "STATUT EN TEMPS RÉEL",
    reportIssue: "Signaler une erreur",
    liveReports: "Signalements récents",
    confirmedOpen: "Confirmé ouvert",
    confirmedClosed: "Confirmé fermé",
    wrongHours: "Horaires incorrects signalés",
    submitReport: "Envoyer le signalement",
    categoryTitle: "{{category}} — Qu'est-ce qui est ouvert ?",
    categoryDesc:
      "Vérifiez quels {{category}} sont ouverts maintenant. Statut en temps réel pour toutes les grandes marques.",
    onDay: "{{brand}} est-il ouvert le {{day}} ?",
    onDayDesc:
      "Consultez les horaires de {{brand}} le {{day}}. Heure d'ouverture, de fermeture, et s'il est habituellement ouvert.",
    footer: "Horaires d'ouverture en temps réel",
    notFound: "Marque introuvable",
    notFoundDesc: "Nous n'avons pas trouvé les horaires de ce lieu. Essayez une autre recherche.",
    backHome: "Retour à l'accueil",
    yes: "Oui",
    no: "Non",
    isOpenOn: "{{brand}} est-il ouvert le {{day}} ?",
    typicalHours: "Horaires habituels le {{day}}",
    allWeekHours: "Horaires de la semaine",
    sunday: "Dimanche",
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
  },
  es: {
    title: "¿Está {{brand}} abierto ahora?",
    titleWithYear: "¿Está {{brand}} abierto? [Horarios {{year}}]",
    description:
      "Comprueba si {{brand}} está abierto ahora. Estado en tiempo real, horarios de hoy, festivos y cuenta atrás de cierre.",
    open: "ABIERTO",
    closed: "CERRADO",
    closesIn: "Cierra en",
    opensAt: "Abre a las",
    todayHours: "Horario de hoy",
    localTime: "Hora local",
    holiday: "Festivo",
    openingHours: "Horarios de apertura",
    timezone: "Zona horaria",
    peopleAlsoChecked: "La gente también comprobó",
    trendingNow: "Tendencias ahora",
    getDirections: "Cómo llegar",
    shareHours: "Compartir horarios",
    home: "Inicio",
    closedToday: "Cerrado hoy",
    open24h: "Abierto 24 horas",
    heroTitle: "¿Está <green>abierto</green> ahora?",
    heroSub:
      "Comprueba al instante si cualquier tienda, restaurante o servicio está abierto. Estado en tiempo real, horarios semanales, festivos.",
    realTimeStatus: "ESTADO EN TIEMPO REAL",
    reportIssue: "Reportar error de horario",
    liveReports: "Reportes recientes",
    confirmedOpen: "Confirmado abierto",
    confirmedClosed: "Confirmado cerrado",
    wrongHours: "Horarios incorrectos reportados",
    submitReport: "Enviar reporte",
    categoryTitle: "{{category}} — ¿Qué está abierto?",
    categoryDesc:
      "Comprueba qué {{category}} están abiertos ahora. Estado en tiempo real de todas las grandes marcas.",
    onDay: "¿Está {{brand}} abierto el {{day}}?",
    onDayDesc:
      "Consulta los horarios de {{brand}} el {{day}}. Hora de apertura, cierre y si normalmente está abierto.",
    footer: "Horarios de apertura en tiempo real",
    notFound: "Marca no encontrada",
    notFoundDesc: "No encontramos los horarios de este lugar. Intenta buscar otra marca.",
    backHome: "Volver al inicio",
    yes: "Sí",
    no: "No",
    isOpenOn: "¿Está {{brand}} abierto el {{day}}?",
    typicalHours: "Horarios habituales el {{day}}",
    allWeekHours: "Horarios de la semana",
    sunday: "Domingo",
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export function t(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string>
): string {
  let text = (translations[locale]?.[key] || translations.en[key]) as string;
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
