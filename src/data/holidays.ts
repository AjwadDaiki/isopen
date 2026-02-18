export interface HolidayData {
  date: string; // YYYY-MM-DD
  name: string;
  nameEs: string;
  nameFr: string;
  country: string;
  affectsAll: boolean; // true = most businesses closed
}

// ── Helper: compute Nth weekday of a month ──
function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month - 1, 1);
  let diff = (weekday - first.getDay() + 7) % 7;
  const day = 1 + diff + (n - 1) * 7;
  return new Date(year, month - 1, day);
}

// ── Helper: last Monday of a month ──
function lastMonday(year: number, month: number): Date {
  const last = new Date(year, month, 0); // last day of month
  const diff = (last.getDay() - 1 + 7) % 7;
  return new Date(year, month - 1, last.getDate() - diff);
}

// ── Easter computation (Anonymous Gregorian algorithm) ──
function computeEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Generate all holidays for a given year (US + FR) */
function generateHolidays(year: number): HolidayData[] {
  const easter = computeEaster(year);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 39);
  const whitMonday = new Date(easter);
  whitMonday.setDate(easter.getDate() + 50);

  return [
    // ── US Holidays ──
    { date: `${year}-01-01`, name: "New Year's Day", nameEs: "Año Nuevo", nameFr: "Jour de l'An", country: "US", affectsAll: true },
    { date: fmt(nthWeekday(year, 1, 1, 3)), name: "Martin Luther King Jr. Day", nameEs: "Día de Martin Luther King Jr.", nameFr: "Jour de Martin Luther King Jr.", country: "US", affectsAll: false },
    { date: fmt(nthWeekday(year, 2, 1, 3)), name: "Presidents' Day", nameEs: "Día de los Presidentes", nameFr: "Jour des Présidents", country: "US", affectsAll: false },
    { date: fmt(easter), name: "Easter Sunday", nameEs: "Domingo de Pascua", nameFr: "Dimanche de Pâques", country: "US", affectsAll: false },
    { date: fmt(lastMonday(year, 5)), name: "Memorial Day", nameEs: "Día de los Caídos", nameFr: "Memorial Day", country: "US", affectsAll: false },
    { date: `${year}-07-04`, name: "Independence Day", nameEs: "Día de la Independencia", nameFr: "Fête de l'Indépendance", country: "US", affectsAll: true },
    { date: fmt(nthWeekday(year, 9, 1, 1)), name: "Labor Day", nameEs: "Día del Trabajo", nameFr: "Fête du Travail", country: "US", affectsAll: false },
    { date: fmt(nthWeekday(year, 10, 1, 2)), name: "Columbus Day", nameEs: "Día de la Raza", nameFr: "Jour de Christophe Colomb", country: "US", affectsAll: false },
    { date: `${year}-11-11`, name: "Veterans Day", nameEs: "Día de los Veteranos", nameFr: "Jour des Anciens Combattants", country: "US", affectsAll: false },
    { date: fmt(nthWeekday(year, 11, 4, 4)), name: "Thanksgiving", nameEs: "Día de Acción de Gracias", nameFr: "Thanksgiving", country: "US", affectsAll: true },
    (() => {
      const thx = nthWeekday(year, 11, 4, 4);
      const bf = new Date(thx);
      bf.setDate(thx.getDate() + 1);
      return { date: fmt(bf), name: "Black Friday", nameEs: "Viernes Negro", nameFr: "Vendredi Noir", country: "US", affectsAll: false };
    })(),
    { date: `${year}-12-24`, name: "Christmas Eve", nameEs: "Nochebuena", nameFr: "Réveillon de Noël", country: "US", affectsAll: false },
    { date: `${year}-12-25`, name: "Christmas Day", nameEs: "Navidad", nameFr: "Noël", country: "US", affectsAll: true },
    { date: `${year}-12-31`, name: "New Year's Eve", nameEs: "Nochevieja", nameFr: "Réveillon du Nouvel An", country: "US", affectsAll: false },

    // ── FR Holidays ──
    { date: `${year}-01-01`, name: "New Year's Day", nameEs: "Año Nuevo", nameFr: "Jour de l'An", country: "FR", affectsAll: true },
    { date: fmt(easterMonday), name: "Easter Monday", nameEs: "Lunes de Pascua", nameFr: "Lundi de Pâques", country: "FR", affectsAll: true },
    { date: `${year}-05-01`, name: "Labour Day", nameEs: "Día del Trabajo", nameFr: "Fête du Travail", country: "FR", affectsAll: true },
    { date: `${year}-05-08`, name: "Victory Day", nameEs: "Día de la Victoria", nameFr: "Victoire 1945", country: "FR", affectsAll: true },
    { date: fmt(ascension), name: "Ascension Day", nameEs: "Día de la Ascensión", nameFr: "Ascension", country: "FR", affectsAll: true },
    { date: fmt(whitMonday), name: "Whit Monday", nameEs: "Lunes de Pentecostés", nameFr: "Lundi de Pentecôte", country: "FR", affectsAll: false },
    { date: `${year}-07-14`, name: "Bastille Day", nameEs: "Día de la Bastilla", nameFr: "Fête Nationale", country: "FR", affectsAll: true },
    { date: `${year}-08-15`, name: "Assumption of Mary", nameEs: "Asunción de la Virgen", nameFr: "Assomption", country: "FR", affectsAll: true },
    { date: `${year}-11-01`, name: "All Saints' Day", nameEs: "Día de Todos los Santos", nameFr: "Toussaint", country: "FR", affectsAll: true },
    { date: `${year}-11-11`, name: "Armistice Day", nameEs: "Día del Armisticio", nameFr: "Armistice", country: "FR", affectsAll: true },
    { date: `${year}-12-25`, name: "Christmas Day", nameEs: "Navidad", nameFr: "Noël", country: "FR", affectsAll: true },
  ];
}

// Cache generated holidays per year
const cache = new Map<number, HolidayData[]>();
function getHolidaysForYear(year: number): HolidayData[] {
  if (!cache.has(year)) cache.set(year, generateHolidays(year));
  return cache.get(year)!;
}

/** @deprecated – kept for backward compatibility. Use getHolidaysForYear() instead. */
export const holidays2026 = getHolidaysForYear(2026);

export function getHolidayForDate(
  dateStr: string,
  country: string
): HolidayData | undefined {
  const year = parseInt(dateStr.slice(0, 4), 10);
  return getHolidaysForYear(year).find(
    (h) => h.date === dateStr && h.country === country
  );
}

export function getUpcomingHolidays(
  country: string,
  limit = 3
): HolidayData[] {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const year = today.getFullYear();
  // Check current year + next year to always have upcoming holidays
  const allHolidays = [...getHolidaysForYear(year), ...getHolidaysForYear(year + 1)];
  return allHolidays
    .filter((h) => h.country === country && h.date >= todayStr)
    .slice(0, limit);
}

export function getHolidaysForBrandPage(country: string = "US"): HolidayData[] {
  const year = new Date().getFullYear();
  return getHolidaysForYear(year).filter((h) => h.country === country);
}
