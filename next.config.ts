import type { NextConfig } from "next";
import {
  CANONICAL_DAYS,
  DAY_SLUGS,
  getLocaleBrandTemplate,
  getLocaleDayConnector,
} from "./src/lib/i18n/url-patterns";
import { LOCALES } from "./src/lib/i18n/translations";

const NON_EN_LOCALES = LOCALES.filter((locale) => locale !== "en");

const nextConfig: NextConfig = {
  async rewrites() {
    const englishDayRewrites = CANONICAL_DAYS.map((day) => ({
      source: `/is-:slug-open-on-${DAY_SLUGS.en[day]}`,
      destination: `/brand/:slug/${day}`,
    }));

    const localizedBrandRewrites = NON_EN_LOCALES.map((locale) => {
      const template = getLocaleBrandTemplate(locale).replace("{slug}", ":slug");
      return {
        source: `/${locale}/${template}`,
        destination: `/${locale}/brand/:slug`,
      };
    });

    const localizedDayRewrites = NON_EN_LOCALES.flatMap((locale) => {
      const template = getLocaleBrandTemplate(locale).replace("{slug}", ":slug");
      const connector = getLocaleDayConnector(locale);
      return CANONICAL_DAYS.map((day) => ({
        source: `/${locale}/${template}-${connector}-${DAY_SLUGS[locale][day]}`,
        destination: `/${locale}/brand/:slug/${day}`,
      }));
    });

    return [
      ...englishDayRewrites,
      ...localizedDayRewrites,
      ...localizedBrandRewrites,
      {
        source: "/is-:slug-open",
        destination: "/brand/:slug",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-DNS-Prefetch-Control", value: "on" }],
      },
    ];
  },
};

export default nextConfig;
