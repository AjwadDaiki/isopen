import type { Metadata } from "next";
import Script from "next/script";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "IsItOpen — Check if any store is open right now",
    template: "%s | IsItOpen",
  },
  description:
    "Real-time opening hours for any store, restaurant, or service. Check if it's open right now, today's hours, holiday schedules, and closing time countdown.",
  metadataBase: new URL("https://isopenow.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "IsItOpen",
    title: "IsItOpen — Check if any store is open right now",
    description: "Real-time opening hours for any store, restaurant, or service.",
  },
  twitter: {
    card: "summary_large_image",
    title: "IsItOpen — Check if any store is open right now",
    description: "Real-time opening hours for any store, restaurant, or service.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-P7FP826D');
        `}</Script>
      </head>
      <body className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P7FP826D"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
