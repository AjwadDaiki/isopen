import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import { brandsData } from "@/data/brands";
import { generateBreadcrumbJsonLd } from "@/lib/schema";
import { absoluteUrl } from "@/lib/i18n/alternates";

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ name: string }>;
}

interface HolidayInfo {
  slug: string;
  title: string;
  date: string;
  emoji: string;
  intro: string;
  /** One unique sentence explaining the cultural/economic context of this holiday's store impact */
  context: string;
  openBrands: string[];     // brand slugs typically open
  closedBrands: string[];   // brand slugs typically closed
  reducedBrands: string[];  // brand slugs with reduced hours
  tips: string[];
  faqs: Array<{ q: string; a: string }>;
  /** Unique numeric stats to differentiate this page from other holiday pages */
  stats: Array<{ label: string; value: string; color?: string }>;
  publishedAt: string;
  updatedAt: string;
}

const HOLIDAY_DATA: Record<string, HolidayInfo> = {
  christmas: {
    slug: "christmas",
    title: "Christmas Day",
    date: "December 25, 2026",
    emoji: "🎁",
    intro: "Christmas Day (December 25) is one of the few days where most American businesses close their doors. If you need to shop on Christmas, your options are limited — but not zero.",
    context: "Since 2020, major chains including Walmart, Target, and Best Buy have made Christmas Day closures permanent — a shift driven partly by employee advocacy and partly by the growth of online shopping absorbing last-minute demand.",
    stats: [
      { label: "Stores typically closed", value: "~80%", color: "text-red-400" },
      { label: "24h pharmacies open", value: "Hundreds", color: "text-green" },
      { label: "Fast food locations open", value: "~65%", color: "text-orange-400" },
      { label: "Online shopping", value: "Always open", color: "text-blue-400" },
    ],
    publishedAt: "2026-01-01",
    updatedAt: "2026-02-01",
    openBrands: ["cvs", "walgreens", "mcdonalds", "burger-king", "taco-bell", "waffle-house", "denny"],
    closedBrands: ["walmart", "target", "costco", "home-depot", "lowes", "best-buy", "starbucks"],
    reducedBrands: ["walgreens", "cvs", "kroger", "safeway"],
    tips: [
      "Most major retailers are closed — shop on Christmas Eve instead",
      "24-hour CVS and Walgreens locations remain open",
      "Fast food drive-throughs are your best bet for food",
      "Gas stations and convenience stores typically stay open",
      "Hospital pharmacies are always staffed 24/7",
    ],
    faqs: [
      { q: "Is Walmart open on Christmas Day?", a: "Most Walmart stores are closed on Christmas Day. Check your local store for any exceptions, though rare." },
      { q: "Is CVS open on Christmas Day?", a: "Many CVS locations are open on Christmas Day, including some 24-hour locations. Hours vary by store." },
      { q: "Is McDonald's open on Christmas?", a: "Most McDonald's are open on Christmas Day, often with reduced hours or drive-through only." },
      { q: "What stores are open on Christmas Day?", a: "Pharmacies (CVS, Walgreens), fast food chains, and some gas stations remain open. Most retail stores close." },
    ],
  },
  thanksgiving: {
    slug: "thanksgiving",
    title: "Thanksgiving",
    date: "November 26, 2026",
    emoji: "🦃",
    intro: "Thanksgiving sees some of the largest store closures of the year as most major retailers have shifted to staying closed, reserving the shopping push for Black Friday.",
    context: "The shift away from Thanksgiving retail started in 2011 when major chains began opening on Thanksgiving Day to compete with online retailers — but consumer and employee backlash reversed the trend. By 2021, most Fortune 500 retailers had permanently closed on Thanksgiving.",
    stats: [
      { label: "Major retailers closed", value: "~90%", color: "text-red-400" },
      { label: "Grocery stores open AM only", value: "~60%", color: "text-orange-400" },
      { label: "Fast food locations open", value: "~70%", color: "text-green" },
      { label: "Black Friday doors open next day", value: "5–8 AM", color: "text-blue-400" },
    ],
    publishedAt: "2026-01-01",
    updatedAt: "2026-02-01",
    openBrands: ["cvs", "walgreens", "mcdonalds", "burger-king", "taco-bell", "waffle-house", "denny"],
    closedBrands: ["walmart", "target", "costco", "home-depot", "lowes", "best-buy", "macy"],
    reducedBrands: ["cvs", "walgreens", "kroger"],
    tips: [
      "Stock up on groceries the day before — most supermarkets close early",
      "Thanksgiving is now mostly a closed holiday at major retailers",
      "Convenience stores and pharmacies are typically open",
      "Many restaurants are open — check ahead for reservations",
    ],
    faqs: [
      { q: "Is Walmart open on Thanksgiving?", a: "Walmart stores are closed on Thanksgiving Day since 2020. They reopen for Black Friday." },
      { q: "Is Target open on Thanksgiving?", a: "Target has been closed on Thanksgiving since 2021 to give employees the holiday off." },
      { q: "What grocery stores are open on Thanksgiving?", a: "Many Kroger, Safeway and local grocery stores open for a few morning hours. Hours vary significantly by location." },
      { q: "Are restaurants open on Thanksgiving?", a: "Many restaurants — especially fast food, diners and chains — are open on Thanksgiving, though often with limited menus." },
    ],
  },
  "new-years": {
    slug: "new-years",
    title: "New Year's Day",
    date: "January 1, 2026",
    emoji: "🎆",
    intro: "New Year's Day sees more closures than a typical Sunday, but fewer than Christmas or Thanksgiving. Many retailers are open but with reduced hours.",
    context: "New Year's Day is a federal holiday — banks, post offices and government buildings close. However, unlike Christmas, most retail and food service businesses open because January 1st is a prime recovery shopping day after the holiday gift season.",
    stats: [
      { label: "Retailers open", value: "~70%", color: "text-green" },
      { label: "Banks open", value: "None", color: "text-red-400" },
      { label: "Typical opening delay", value: "1–3 hours", color: "text-orange-400" },
      { label: "Post-holiday sales active", value: "Yes", color: "text-blue-400" },
    ],
    publishedAt: "2025-12-01",
    updatedAt: "2026-02-01",
    openBrands: ["walmart", "target", "cvs", "walgreens", "mcdonalds", "starbucks"],
    closedBrands: ["costco", "best-buy"],
    reducedBrands: ["walmart", "target", "kroger", "home-depot"],
    tips: [
      "Many stores open later than usual on January 1st",
      "Banks and post offices are typically closed",
      "Grocery stores usually open with reduced hours",
      "Starbucks and coffee chains often open late morning",
    ],
    faqs: [
      { q: "Is Walmart open on New Year's Day?", a: "Yes, most Walmart stores are open on New Year's Day, typically 7AM–11PM with some variation." },
      { q: "Is Starbucks open on New Year's Day?", a: "Most Starbucks locations are open on New Year's Day, often with slightly later opening times." },
      { q: "Are banks open on New Year's Day?", a: "No — banks are closed on New Year's Day as it's a federal holiday. ATMs remain accessible." },
      { q: "Is Costco open on New Year's Day?", a: "Costco is typically closed on New Year's Day. They usually resume normal hours on January 2nd." },
    ],
  },
  easter: {
    slug: "easter",
    title: "Easter Sunday",
    date: "April 5, 2026",
    emoji: "🐣",
    intro: "Easter Sunday is not a federal holiday in the US, but many businesses choose to close or operate on reduced Sunday hours.",
    context: "Easter falls on different dates each year (determined by the lunar calendar), making advance planning essential. Unlike Christmas or Thanksgiving, Easter closures are less standardized — each franchise owner typically makes their own decision, creating significant variation.",
    stats: [
      { label: "Chick-fil-A open", value: "Never (Sun)", color: "text-red-400" },
      { label: "Costco open", value: "No", color: "text-red-400" },
      { label: "Walmart/Target open", value: "Yes (Sunday hrs)", color: "text-green" },
      { label: "Brunch restaurants busy", value: "Extremely", color: "text-orange-400" },
    ],
    publishedAt: "2026-01-15",
    updatedAt: "2026-02-01",
    openBrands: ["walmart", "target", "cvs", "walgreens", "mcdonalds", "starbucks", "taco-bell"],
    closedBrands: ["costco", "hobby-lobby", "chick-fil-a"],
    reducedBrands: ["walmart", "target", "home-depot"],
    tips: [
      "Chick-fil-A is closed every Sunday including Easter",
      "Costco is closed on Easter Sunday",
      "Walmart and Target typically operate on Easter with normal to reduced hours",
      "Most restaurants are open — good for brunch",
    ],
    faqs: [
      { q: "Is Walmart open on Easter?", a: "Most Walmart stores are open on Easter Sunday with regular or slightly reduced hours." },
      { q: "Is Chick-fil-A open on Easter?", a: "No — Chick-fil-A is closed every Sunday, including Easter." },
      { q: "Is Costco open on Easter?", a: "No — Costco is closed on Easter Sunday." },
      { q: "Are grocery stores open on Easter?", a: "Most major grocery chains like Kroger, Safeway and Whole Foods are open on Easter, often with Sunday hours." },
    ],
  },
  "black-friday": {
    slug: "black-friday",
    title: "Black Friday",
    date: "November 27, 2026",
    emoji: "🛍️",
    intro: "Black Friday is the biggest shopping day of the year. Nearly all stores are open, many with extended early-morning hours starting as early as 5AM or 6AM.",
    context: "Black Friday became the US's biggest shopping day in 2005. Since 2020, online Black Friday sales have surpassed in-store traffic — but brick-and-mortar stores remain critical for 'doorbuster' deals that drive massive foot traffic and brand loyalty.",
    stats: [
      { label: "Stores open", value: "~99%", color: "text-green" },
      { label: "Average door opening", value: "6–7 AM", color: "text-blue-400" },
      { label: "US consumers shopping", value: "196M+", color: "text-text" },
      { label: "Online vs in-store", value: "52% online", color: "text-orange-400" },
    ],
    publishedAt: "2026-01-01",
    updatedAt: "2026-02-01",
    openBrands: ["walmart", "target", "costco", "home-depot", "lowes", "best-buy", "macy", "mcdonalds", "starbucks"],
    closedBrands: [],
    reducedBrands: [],
    tips: [
      "Most stores open between 5AM and 8AM for Black Friday",
      "Online deals often start Thanksgiving evening",
      "Walmart and Target offer price guarantees on Black Friday deals",
      "Avoid peak hours (8–11AM and 2–5PM) to save time",
    ],
    faqs: [
      { q: "What time do stores open on Black Friday?", a: "Most major retailers open between 5AM and 8AM on Black Friday. Some open as early as midnight or Thanksgiving night." },
      { q: "Is Costco open on Black Friday?", a: "Yes — Costco is open on Black Friday with normal warehouse hours, typically 10AM–8:30PM." },
      { q: "Are Black Friday deals online too?", a: "Yes — most major retailers offer identical or better online Black Friday deals, often starting on Thanksgiving evening." },
    ],
  },
  "christmas-eve": {
    slug: "christmas-eve",
    title: "Christmas Eve",
    date: "December 24, 2026",
    emoji: "🎄",
    intro: "Christmas Eve is one of the busiest shopping days of the year in the morning, but most stores close early — typically between 2PM and 6PM.",
    context: "Christmas Eve is statistically the highest-traffic day in US stores — surpassing even Black Friday in foot traffic density per hour. The morning rush (9AM–noon) sees peak crowds, then stores begin rapid drawdown closures through the afternoon.",
    stats: [
      { label: "Most stores close by", value: "6 PM", color: "text-orange-400" },
      { label: "Grocery traffic peak", value: "8–11 AM", color: "text-red-400" },
      { label: "Typical closing vs normal", value: "4–6 hrs early", color: "text-text" },
      { label: "Online orders still ship", value: "Yes (2-day)", color: "text-green" },
    ],
    publishedAt: "2025-12-01",
    updatedAt: "2026-02-01",
    openBrands: ["walmart", "target", "cvs", "walgreens", "home-depot", "mcdonalds", "starbucks"],
    closedBrands: [],
    reducedBrands: ["walmart", "target", "costco", "home-depot", "kroger", "starbucks"],
    tips: [
      "Shop in the morning — most stores close between 2PM and 6PM",
      "Grocery stores are packed on Christmas Eve — go early",
      "Pharmacy drive-throughs may close at different times than the store",
      "Many restaurants are open for dinner on Christmas Eve",
    ],
    faqs: [
      { q: "What time does Walmart close on Christmas Eve?", a: "Most Walmart stores close at 6PM on Christmas Eve, though some may close earlier at 4PM." },
      { q: "Is Costco open on Christmas Eve?", a: "Yes — Costco is open on Christmas Eve but typically closes early, around 5PM or 6PM." },
      { q: "Is Starbucks open on Christmas Eve?", a: "Most Starbucks locations are open on Christmas Eve but with modified hours, often closing by 3PM–5PM." },
    ],
  },
  "new-years-eve": {
    slug: "new-years-eve",
    title: "New Year's Eve",
    date: "December 31, 2026",
    emoji: "🥂",
    intro: "New Year's Eve is mostly a normal shopping day, though some stores may close a few hours early. Most restaurants and bars are extremely busy.",
    context: "December 31st is a top revenue day for the beverage industry, restaurants, and event venues — but for retailers it's a quiet day. Most Americans have completed holiday shopping; traffic shifts to party supplies, food, and last-minute gift cards.",
    stats: [
      { label: "Retailers open (normal hrs)", value: "~85%", color: "text-green" },
      { label: "Bars and restaurants busy", value: "Extremely", color: "text-orange-400" },
      { label: "Liquor stores open", value: "Most", color: "text-blue-400" },
      { label: "Banks open", value: "No", color: "text-red-400" },
    ],
    publishedAt: "2025-12-15",
    updatedAt: "2026-02-01",
    openBrands: ["walmart", "target", "costco", "cvs", "walgreens", "home-depot", "mcdonalds", "starbucks"],
    closedBrands: [],
    reducedBrands: [],
    tips: [
      "Most stores are open normal hours on December 31st",
      "Grocery stores may close slightly early (9–10PM)",
      "Liquor stores and wine shops are very busy",
      "Plan for restaurant reservations well in advance",
    ],
    faqs: [
      { q: "Is Walmart open on New Year's Eve?", a: "Yes — Walmart is open on New Year's Eve with normal hours, typically closing at 11PM." },
      { q: "What stores are open on New Year's Eve?", a: "Most stores are open normal or near-normal hours on New Year's Eve. Expect reduced hours closer to midnight." },
    ],
  },
  "memorial-day": {
    slug: "memorial-day",
    title: "Memorial Day",
    date: "May 25, 2026",
    emoji: "🇺🇸",
    intro: "Memorial Day is a great shopping holiday — most major retailers are open, many with special sales and extended hours.",
    context: "Memorial Day weekend is the second-largest home improvement shopping weekend of the year (after Labor Day). Home Depot and Lowe's historically generate 15–20% of their annual revenue during Memorial Day through July 4th.",
    stats: [
      { label: "Retailers open", value: "~95%", color: "text-green" },
      { label: "Home improvement traffic", value: "+35% vs avg", color: "text-blue-400" },
      { label: "Banks open", value: "No", color: "text-red-400" },
      { label: "Major sales", value: "Most chains", color: "text-orange-400" },
    ],
    publishedAt: "2026-01-15",
    updatedAt: "2026-02-01",
    openBrands: ["walmart", "target", "home-depot", "lowes", "costco", "cvs", "walgreens", "mcdonalds"],
    closedBrands: [],
    reducedBrands: [],
    tips: [
      "Great day for home improvement shopping — Home Depot and Lowe's run major sales",
      "Grocery stores are open but busy with BBQ shoppers",
      "Banks and government offices are closed",
      "Most restaurants and fast food chains are open",
    ],
    faqs: [
      { q: "Is Home Depot open on Memorial Day?", a: "Yes — Home Depot is typically open on Memorial Day and often runs special sales events." },
      { q: "Is Costco open on Memorial Day?", a: "Yes — Costco is open on Memorial Day with normal warehouse hours." },
      { q: "Are banks open on Memorial Day?", a: "No — banks are closed on Memorial Day as it is a federal holiday." },
    ],
  },
  "independence-day": {
    slug: "independence-day",
    title: "Independence Day",
    date: "July 4, 2026",
    emoji: "🎇",
    intro: "July 4th sees many stores open in the morning but closing early afternoon so employees can celebrate. Banks are closed and government services are unavailable.",
    context: "July 4th is the peak of summer retail season. While early closures reduce afternoon hours, morning traffic is very high — particularly for grills, outdoor furniture, and food. Fireworks retailers see their single largest sales day of the year.",
    stats: [
      { label: "Typical closing time", value: "5–8 PM", color: "text-orange-400" },
      { label: "Banks open", value: "No", color: "text-red-400" },
      { label: "Fireworks stores open", value: "Extended hrs", color: "text-blue-400" },
      { label: "Grocery stores busy", value: "AM peak", color: "text-green" },
    ],
    publishedAt: "2026-01-15",
    updatedAt: "2026-02-01",
    openBrands: ["walmart", "target", "cvs", "walgreens", "mcdonalds", "starbucks"],
    closedBrands: [],
    reducedBrands: ["walmart", "target", "home-depot", "costco"],
    tips: [
      "Most stores open normal hours but close by 5–6PM",
      "Grocery stores are busy with party supply shoppers in the morning",
      "Banks and post offices are closed all day",
      "Fireworks retailers have extended hours on July 4th",
    ],
    faqs: [
      { q: "Is Walmart open on July 4th?", a: "Most Walmart stores are open on July 4th but may close early, typically at 8PM or 10PM." },
      { q: "Is the post office open on July 4th?", a: "No — USPS offices are closed on Independence Day. Package deliveries may be affected." },
    ],
  },
  "labor-day": {
    slug: "labor-day",
    title: "Labor Day",
    date: "September 7, 2026",
    emoji: "👷",
    intro: "Labor Day is largely a normal shopping day. Most major retailers are open, often with end-of-summer sales. Banks and government offices are closed.",
    context: "Labor Day weekend is the biggest weekend for mattress and appliance sales in the US — retailers run deep promotions. It's also the last major summer retail weekend before back-to-school season winds down.",
    stats: [
      { label: "Retailers open", value: "~95%", color: "text-green" },
      { label: "Mattress/appliance sales", value: "Peak event", color: "text-blue-400" },
      { label: "Banks open", value: "No", color: "text-red-400" },
      { label: "Back-to-school traffic", value: "High", color: "text-orange-400" },
    ],
    publishedAt: "2026-01-15",
    updatedAt: "2026-02-01",
    openBrands: ["walmart", "target", "home-depot", "lowes", "costco", "cvs", "walgreens", "mcdonalds"],
    closedBrands: [],
    reducedBrands: [],
    tips: [
      "Major Labor Day sales at most retailers",
      "Great time to shop for summer clearance deals",
      "Banks and post offices are closed",
      "Malls and shopping centers are typically open",
    ],
    faqs: [
      { q: "Is Costco open on Labor Day?", a: "Yes — Costco is typically open on Labor Day with normal warehouse hours." },
      { q: "Are banks open on Labor Day?", a: "No — banks are closed on Labor Day as it is a federal holiday." },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(HOLIDAY_DATA).map((name) => ({ name }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const holiday = HOLIDAY_DATA[name];
  if (!holiday) return { title: "Not Found" };

  return {
    title: `${holiday.title} Store Hours 2026 | What's Open?`,
    description: `Find out which stores are open on ${holiday.title} ${holiday.date}. Real-time hours for all major brands.`,
    alternates: { canonical: absoluteUrl(`/holiday/${name}`) },
    openGraph: {
      type: "article",
      url: absoluteUrl(`/holiday/${name}`),
      title: `${holiday.title} Store Hours 2026`,
      description: `Is your store open on ${holiday.title}? Check real-time status for all major brands.`,
      publishedTime: holiday.publishedAt,
      modifiedTime: holiday.updatedAt,
    },
    other: {
      "article:published_time": holiday.publishedAt,
      "article:modified_time": holiday.updatedAt,
    },
  };
}

export default async function HolidayPage({ params }: PageProps) {
  const { name } = await params;
  const holiday = HOLIDAY_DATA[name];
  if (!holiday) notFound();

  const openBrands = brandsData.filter((e) => holiday.openBrands.includes(e.brand.slug));
  const closedBrands = brandsData.filter((e) => holiday.closedBrands.includes(e.brand.slug));
  const reducedBrands = brandsData.filter((e) => holiday.reducedBrands.includes(e.brand.slug));
  const otherBrands = brandsData
    .filter((e) =>
      !holiday.openBrands.includes(e.brand.slug) &&
      !holiday.closedBrands.includes(e.brand.slug) &&
      !holiday.reducedBrands.includes(e.brand.slug)
    )
    .slice(0, 20);

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", item: absoluteUrl("/") },
    { name: "Holiday Hours", item: absoluteUrl("/holiday") },
    { name: holiday.title, item: absoluteUrl(`/holiday/${name}`) },
  ]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: holiday.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${holiday.title} Store Hours ${new Date().getFullYear()}`,
    description: `Which stores are open on ${holiday.title}? Real-time status and hours for all major brands.`,
    datePublished: holiday.publishedAt,
    dateModified: holiday.updatedAt,
    author: { "@type": "Organization", name: "IsOpenNow", url: absoluteUrl("/") },
    publisher: { "@type": "Organization", name: "IsOpenNow", url: absoluteUrl("/") },
    mainEntityOfPage: absoluteUrl(`/holiday/${name}`),
  };

  const otherHolidays = Object.values(HOLIDAY_DATA).filter((h) => h.slug !== holiday.slug).slice(0, 5);

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

        <div className="page-pad">
          <nav className="breadcrumb-row">
            <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <Link href="/holiday" className="text-muted2 no-underline hover:text-text transition-colors">Holiday Hours</Link>
            <span>/</span>
            <span className="text-text">{holiday.title}</span>
          </nav>
        </div>

        <div className="page-pad pt-4 pb-16">
          <div className="content-grid-shell">
            <main className="min-w-0 content-stack">
              <section className="ui-panel overflow-hidden">
                <div className="panel-body-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{holiday.emoji}</span>
                    <span className="text-[13px] text-muted2 font-medium">{holiday.date}</span>
                  </div>
                  <h1 className="font-heading font-extrabold text-[30px] sm:text-[42px] tracking-[-0.04em] leading-[0.95] text-text">
                    {holiday.title} Store Hours 2026
                  </h1>
                  <p className="text-muted2 text-[15px] leading-relaxed mt-5 max-w-[68ch]">
                    {holiday.intro}
                  </p>
                  {holiday.context && (
                    <p className="text-muted text-[13px] leading-relaxed mt-3 max-w-[68ch] border-l-2 border-border pl-3 italic">
                      {holiday.context}
                    </p>
                  )}
                  {holiday.stats && holiday.stats.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {holiday.stats.map((stat) => (
                        <div key={stat.label} className="rounded-xl border border-border bg-bg2 px-4 py-3 text-center">
                          <p className={`text-[20px] font-heading font-extrabold tracking-[-0.03em] ${stat.color || "text-text"}`}>
                            {stat.value}
                          </p>
                          <p className="text-[11px] text-muted2 mt-1 leading-tight">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {closedBrands.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                      Closed on {holiday.title}
                    </h2>
                    <span className="text-[12px] text-red-400 font-semibold">{closedBrands.length} brands</span>
                  </div>
                  <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {closedBrands.map(({ brand }) => (
                      <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="brand-card-link brand-card-closed brand-card-premium no-underline p-4 flex items-center gap-3"
                      >
                        <span className="text-xl">{brand.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-text">{brand.name}</p>
                          <p className="text-[11px] text-muted2">Typically closed</p>
                        </div>
                        <span className="brand-status-pill brand-status-pill-closed">
                          <span className="status-led" />
                          Closed
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {reducedBrands.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                      Reduced hours on {holiday.title}
                    </h2>
                    <span className="text-[12px] text-orange-400 font-semibold">{reducedBrands.length} brands</span>
                  </div>
                  <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {reducedBrands.map(({ brand }) => (
                      <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="brand-card-link brand-card-premium no-underline p-4 flex items-center gap-3"
                      >
                        <span className="text-xl">{brand.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-text">{brand.name}</p>
                          <p className="text-[11px] text-muted2">Check local hours</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-orange-400 border border-orange-500/30 bg-orange-500/10">
                          Reduced
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {openBrands.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                      Open on {holiday.title}
                    </h2>
                    <span className="text-[12px] text-green font-semibold">{openBrands.length} brands</span>
                  </div>
                  <div className="panel-body grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {openBrands.map(({ brand }) => (
                      <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="brand-card-link brand-card-open brand-card-premium no-underline p-4 flex items-center gap-3"
                      >
                        <span className="text-xl">{brand.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-text">{brand.name}</p>
                          <p className="text-[11px] text-muted2">Typically open</p>
                        </div>
                        <span className="brand-status-pill brand-status-pill-open">
                          <span className="status-led" />
                          Open
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={100} />

              {holiday.tips.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                      {holiday.title} shopping tips
                    </h2>
                  </div>
                  <div className="panel-body flex flex-col gap-3">
                    {holiday.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-green font-bold text-[13px] mt-0.5 shrink-0">✓</span>
                        <p className="text-[13px] text-muted2 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {holiday.faqs.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="panel-body-lg">
                    <h2 className="font-heading font-bold text-[18px] text-text tracking-[-0.02em] mb-5">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                      {holiday.faqs.map((faq, i) => (
                        <div key={i} className="border-b border-border last:border-0 pb-4 last:pb-0">
                          <p className="text-[14px] font-semibold text-text">{faq.q}</p>
                          <p className="text-[13px] text-muted2 mt-1.5 leading-relaxed">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {otherBrands.length > 0 && (
                <section className="ui-panel overflow-hidden">
                  <div className="card-title-row">
                    <h2 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">
                      Check other brands
                    </h2>
                  </div>
                  <div className="panel-body grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {otherBrands.map(({ brand }) => (
                      <Link
                        key={brand.slug}
                        href={`/brand/${brand.slug}`}
                        className="brand-card-link no-underline p-3 flex items-center gap-2"
                      >
                        <span className="text-base">{brand.emoji}</span>
                        <p className="text-[12px] font-medium text-text truncate">{brand.name}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </main>

            <aside className="sidebar-stack">
              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Other holidays</h3>
                </div>
                <div className="panel-body flex flex-col gap-2">
                  {otherHolidays.map((h) => (
                    <Link
                      key={h.slug}
                      href={`/holiday/${h.slug}`}
                      className="no-underline flex items-center gap-2.5 text-[13px] text-muted2 hover:text-text transition-colors px-4 py-2.5 rounded-xl border border-border hover:border-border2"
                    >
                      <span>{h.emoji}</span>
                      {h.title} →
                    </Link>
                  ))}
                  <Link
                    href="/holiday"
                    className="no-underline text-[12px] text-muted2 hover:text-text transition-colors text-center mt-1"
                  >
                    All holidays →
                  </Link>
                </div>
              </section>

              <section className="ui-panel overflow-hidden">
                <div className="card-title-row">
                  <h3 className="font-heading font-bold text-[15px] text-text tracking-[-0.01em]">Related pages</h3>
                </div>
                <div className="panel-body flex flex-col gap-2">
                  {[
                    { href: "/open-24h", label: "24 Hour Stores" },
                    { href: "/open-late", label: "Stores Open Late" },
                    { href: "/near-me", label: "Open Near Me" },
                    { href: "/brand/cvs", label: "CVS Hours" },
                    { href: "/brand/walgreens", label: "Walgreens Hours" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="no-underline text-[13px] text-muted2 hover:text-text transition-colors px-4 py-2.5 rounded-xl border border-border hover:border-border2"
                    >
                      {link.label} →
                    </Link>
                  ))}
                </div>
              </section>

              <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID} label="Sponsored" minHeight={220} />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
