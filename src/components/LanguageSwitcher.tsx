"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n/translations";
import { buildBrandUrl, buildDayUrl, parseLocalizedPath } from "@/lib/i18n/url-patterns";

function buildLocaleHref(locale: Locale, pathname: string): string {
  const parsed = parseLocalizedPath(pathname);

  if (parsed.kind === "home") {
    return locale === "en" ? "/" : `/${locale}`;
  }

  if (parsed.kind === "category") {
    const parts = pathname.split("/").filter(Boolean);
    const categorySlug = parts[parts[0] === "category" ? 1 : 2];
    if (!categorySlug) return locale === "en" ? "/" : `/${locale}`;
    return locale === "en" ? `/category/${categorySlug}` : `/${locale}/category/${categorySlug}`;
  }

  if (parsed.kind === "brand" && parsed.slug) {
    return buildBrandUrl(locale, parsed.slug);
  }

  if (parsed.kind === "day" && parsed.slug && parsed.day) {
    return buildDayUrl(locale, parsed.slug, parsed.day);
  }

  return locale === "en" ? pathname : `/${locale}`;
}

export default function LanguageSwitcher() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-muted">
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={buildLocaleHref(locale, pathname)}
          className="no-underline px-2 py-1 rounded border border-border hover:border-border2 hover:text-text transition-colors"
        >
          {LOCALE_NAMES[locale]}
        </Link>
      ))}
    </div>
  );
}
