import type { Metadata } from "next";
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
      <body className={`${bricolage.variable} ${jetbrains.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
