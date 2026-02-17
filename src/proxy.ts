import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { LOCALES, type Locale } from "@/lib/i18n/translations";

function detectLocaleFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && LOCALES.includes(first as Locale)) {
    return first as Locale;
  }
  return "en";
}

function detectPreferredLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") || "";
  const tokens = header
    .split(",")
    .map((x) => x.trim().split(";")[0].toLowerCase())
    .filter(Boolean);

  for (const token of tokens) {
    const base = token.split("-")[0] as Locale;
    if (LOCALES.includes(base)) return base;
  }

  return "en";
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const preferred = detectPreferredLocale(request);
    if (preferred !== "en") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${preferred}`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  const requestHeaders = new Headers(request.headers);
  const locale = detectLocaleFromPath(request.nextUrl.pathname);
  requestHeaders.set("x-locale", locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|ads.txt).*)"],
};
