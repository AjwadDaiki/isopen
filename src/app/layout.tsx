import type { Metadata } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import { Inter, Manrope, DM_Mono } from "next/font/google";
import { LOCALES, type Locale } from "@/lib/i18n/translations";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

const languageAlternates = Object.fromEntries(
  LOCALES.map((locale) => [locale === "en" ? "en" : locale, locale === "en" ? "/" : `/${locale}`])
);

export const metadata: Metadata = {
  title: {
    default: "IsItOpen - Check if any store is open right now",
    template: "%s | IsItOpen",
  },
  applicationName: "IsItOpen",
  description:
    "Real-time opening hours for any store, restaurant, or service. Check if it's open right now, today's hours, holiday schedules, and closing time countdown.",
  keywords: [
    "is it open",
    "store hours",
    "opening hours",
    "open now",
    "business hours today",
    "holiday hours",
    "restaurant hours",
  ],
  creator: "IsItOpen",
  publisher: "IsItOpen",
  authors: [{ name: "IsItOpen" }],
  metadataBase: new URL("https://isopenow.com"),
  alternates: {
    canonical: "/",
    languages: {
      ...languageAlternates,
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "IsItOpen",
    url: "https://isopenow.com",
    title: "IsItOpen - Check if any store is open right now",
    description: "Real-time opening hours for any store, restaurant, or service.",
  },
  category: "business",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  twitter: {
    card: "summary_large_image",
    title: "IsItOpen - Check if any store is open right now",
    description: "Real-time opening hours for any store, restaurant, or service.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = await headers();
  const localeHeader = hdrs.get("x-locale");
  const htmlLang =
    localeHeader && LOCALES.includes(localeHeader as Locale)
      ? localeHeader
      : "en";

  const adsClient =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-9657496359488658";

  return (
    <html lang={htmlLang}>
      <head>
        <meta name="google-adsense-account" content={adsClient} />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsClient}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} ${dmMono.variable}`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8MWJB8TTNY"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-8MWJB8TTNY');
        `}</Script>
        {children}
      </body>
    </html>
  );
}

