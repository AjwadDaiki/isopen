import { LOCALES, type Locale } from "./translations";

export function buildLocaleAlternates(pathByLocale: Partial<Record<Locale, string>>) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    const path = pathByLocale[locale];
    if (path) {
      languages[locale === "en" ? "en" : locale] = path;
    }
  }
  if (pathByLocale.en) {
    languages["x-default"] = pathByLocale.en;
  }
  return languages;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `https://isopenow.com${path}`;
}
