import type { Metadata } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
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
      <body className={`${bricolage.variable} ${jetbrains.variable} antialiased`}>
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
