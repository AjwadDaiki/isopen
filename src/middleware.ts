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

export function middleware(request: NextRequest) {
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
