"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { LOCALES } from "@/lib/i18n/translations";
import { trackPageView } from "@/lib/track";

function normalizePathname(pathname: string): { path: string; hasLocalePrefix: boolean } {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return { path: "/", hasLocalePrefix: false };

  const maybeLocale = parts[0];
  if (!LOCALES.includes(maybeLocale as (typeof LOCALES)[number])) {
    return { path: pathname || "/", hasLocalePrefix: false };
  }

  const stripped = `/${parts.slice(1).join("/")}`;
  return { path: stripped === "/" ? "/" : stripped.replace(/\/+$/, ""), hasLocalePrefix: true };
}

function inferTemplate(pathname: string): string {
  const { path, hasLocalePrefix } = normalizePathname(pathname);
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) return hasLocalePrefix ? "locale_home" : "home";
  if (segments[0] === "about" || segments[0] === "contact" || segments[0] === "privacy" || segments[0] === "terms") {
    return "legal";
  }
  if (segments[0] === "search") return "search";
  if (segments[0] === "category") return "category";
  if (segments[0] === "city") {
    if (segments.length === 1) return "city_index";
    if (segments.length === 2) return "city_page";
    if (segments[2] === "category") return hasLocalePrefix ? "locale_city_category" : "city_category";
    return "city_brand";
  }
  if (segments[0] === "state") {
    if (segments.length === 1) return "state_index";
    if (segments[2] === "category") return "state_category";
    return "state_page";
  }
  if (segments[0] === "near-me") {
    return segments.length === 1 ? "near_me_index" : "near_me_category";
  }

  if (segments[0] === "brand") {
    return segments.length >= 3 ? "brand_day" : "brand";
  }
  if (/^is-.+-open(?:-on-.+)?$/.test(segments[0])) {
    return segments[0].includes("-open-on-") ? "brand_day" : "brand";
  }

  return "other";
}

export default function AnalyticsRouterTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    lastPath.current = pathname;
    trackPageView(inferTemplate(pathname));
  }, [pathname]);

  return null;
}
