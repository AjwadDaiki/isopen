export interface HolidayData {
  date: string; // YYYY-MM-DD
  name: string;
  nameEs: string;
  nameFr: string;
  country: string;
  affectsAll: boolean; // true = most businesses closed
}

export const holidays2026: HolidayData[] = [
  // US Holidays 2026
  { date: "2026-01-01", name: "New Year's Day", nameEs: "Año Nuevo", nameFr: "Jour de l'An", country: "US", affectsAll: true },
  { date: "2026-01-19", name: "Martin Luther King Jr. Day", nameEs: "Día de Martin Luther King Jr.", nameFr: "Jour de Martin Luther King Jr.", country: "US", affectsAll: false },
  { date: "2026-02-16", name: "Presidents' Day", nameEs: "Día de los Presidentes", nameFr: "Jour des Présidents", country: "US", affectsAll: false },
  { date: "2026-04-05", name: "Easter Sunday", nameEs: "Domingo de Pascua", nameFr: "Dimanche de Pâques", country: "US", affectsAll: false },
  { date: "2026-05-25", name: "Memorial Day", nameEs: "Día de los Caídos", nameFr: "Memorial Day", country: "US", affectsAll: false },
  { date: "2026-07-04", name: "Independence Day", nameEs: "Día de la Independencia", nameFr: "Fête de l'Indépendance", country: "US", affectsAll: true },
  { date: "2026-09-07", name: "Labor Day", nameEs: "Día del Trabajo", nameFr: "Fête du Travail", country: "US", affectsAll: false },
  { date: "2026-10-12", name: "Columbus Day", nameEs: "Día de la Raza", nameFr: "Jour de Christophe Colomb", country: "US", affectsAll: false },
  { date: "2026-11-11", name: "Veterans Day", nameEs: "Día de los Veteranos", nameFr: "Jour des Anciens Combattants", country: "US", affectsAll: false },
  { date: "2026-11-26", name: "Thanksgiving", nameEs: "Día de Acción de Gracias", nameFr: "Thanksgiving", country: "US", affectsAll: true },
  { date: "2026-11-27", name: "Black Friday", nameEs: "Viernes Negro", nameFr: "Vendredi Noir", country: "US", affectsAll: false },
  { date: "2026-12-24", name: "Christmas Eve", nameEs: "Nochebuena", nameFr: "Réveillon de Noël", country: "US", affectsAll: false },
  { date: "2026-12-25", name: "Christmas Day", nameEs: "Navidad", nameFr: "Noël", country: "US", affectsAll: true },
  { date: "2026-12-31", name: "New Year's Eve", nameEs: "Nochevieja", nameFr: "Réveillon du Nouvel An", country: "US", affectsAll: false },

  // FR Holidays 2026
  { date: "2026-01-01", name: "New Year's Day", nameEs: "Año Nuevo", nameFr: "Jour de l'An", country: "FR", affectsAll: true },
  { date: "2026-04-06", name: "Easter Monday", nameEs: "Lunes de Pascua", nameFr: "Lundi de Pâques", country: "FR", affectsAll: true },
  { date: "2026-05-01", name: "Labour Day", nameEs: "Día del Trabajo", nameFr: "Fête du Travail", country: "FR", affectsAll: true },
  { date: "2026-05-08", name: "Victory Day", nameEs: "Día de la Victoria", nameFr: "Victoire 1945", country: "FR", affectsAll: true },
  { date: "2026-05-14", name: "Ascension Day", nameEs: "Día de la Ascensión", nameFr: "Ascension", country: "FR", affectsAll: true },
  { date: "2026-05-25", name: "Whit Monday", nameEs: "Lunes de Pentecostés", nameFr: "Lundi de Pentecôte", country: "FR", affectsAll: false },
  { date: "2026-07-14", name: "Bastille Day", nameEs: "Día de la Bastilla", nameFr: "Fête Nationale", country: "FR", affectsAll: true },
  { date: "2026-08-15", name: "Assumption of Mary", nameEs: "Asunción de la Virgen", nameFr: "Assomption", country: "FR", affectsAll: true },
  { date: "2026-11-01", name: "All Saints' Day", nameEs: "Día de Todos los Santos", nameFr: "Toussaint", country: "FR", affectsAll: true },
  { date: "2026-11-11", name: "Armistice Day", nameEs: "Día del Armisticio", nameFr: "Armistice", country: "FR", affectsAll: true },
  { date: "2026-12-25", name: "Christmas Day", nameEs: "Navidad", nameFr: "Noël", country: "FR", affectsAll: true },
];

export function getHolidayForDate(
  dateStr: string,
  country: string
): HolidayData | undefined {
  return holidays2026.find(
    (h) => h.date === dateStr && h.country === country
  );
}

export function getUpcomingHolidays(
  country: string,
  limit = 3
): HolidayData[] {
  const today = new Date().toISOString().split("T")[0];
  return holidays2026
    .filter((h) => h.country === country && h.date >= today)
    .slice(0, limit);
}

export function getHolidaysForBrandPage(country: string = "US"): HolidayData[] {
  return holidays2026.filter((h) => h.country === country);
}
