import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HoursTable from "@/components/HoursTable";
import TrendingSidebar from "@/components/TrendingSidebar";
import { getBrandBySlug, getAllBrandSlugs } from "@/data/brands";
import { generateJsonLd } from "@/lib/schema";

export const revalidate = 300;

const DAYS_MAP: Record<string, { index: number; name: string }> = {
  sunday: { index: 0, name: "Sunday" },
  monday: { index: 1, name: "Monday" },
  tuesday: { index: 2, name: "Tuesday" },
  wednesday: { index: 3, name: "Wednesday" },
  thursday: { index: 4, name: "Thursday" },
  friday: { index: 5, name: "Friday" },
  saturday: { index: 6, name: "Saturday" },
  christmas: { index: -1, name: "Christmas" },
  thanksgiving: { index: -2, name: "Thanksgiving" },
  "new-years": { index: -3, name: "New Year's Day" },
  easter: { index: -4, name: "Easter" },
};

const ALL_DAYS = Object.keys(DAYS_MAP);

interface PageProps {
  params: Promise<{ slug: string; day: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllBrandSlugs();
  const result: { slug: string; day: string }[] = [];
  for (const slug of slugs) {
    for (const day of ALL_DAYS) result.push({ slug, day });
  }
  return result;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, day } = await params;
  const data = getBrandBySlug(slug);
  const dayInfo = DAYS_MAP[day];
  if (!data || !dayInfo) return { title: "Not Found" };

  const { brand } = data;
  const year = new Date().getFullYear();

  return {
    title: `Is ${brand.name} Open on ${dayInfo.name}? [${year} Hours]`,
    description: `Check ${brand.name} hours on ${dayInfo.name}. Opening time, closing time, and whether it's typically open. Updated for ${year}.`,
    alternates: {
      canonical: `https://isopenow.com/is-${slug}-open-on-${day}`,
    },
  };
}

export default async function DayPage({ params }: PageProps) {
  const { slug, day } = await params;
  const data = getBrandBySlug(slug);
  const dayInfo = DAYS_MAP[day];
  if (!data || !dayInfo) notFound();

  const { brand, hours } = data;
  const jsonLd = generateJsonLd(brand, hours, `https://isopenow.com/is-${slug}-open-on-${day}`);

  const dayHours = dayInfo.index >= 0 ? hours.find((h) => h.dayOfWeek === dayInfo.index) : null;
  const isHoliday = dayInfo.index < 0;
  const isOpenOnDay = dayHours ? !dayHours.isClosed && !!dayHours.openTime : false;
  const hoursStr =
    dayHours?.openTime && dayHours?.closeTime
      ? `${dayHours.openTime} - ${dayHours.closeTime}`
      : "Closed";

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-10 pt-8 pb-16 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          <main className="min-w-0">
            <nav className="font-mono text-xs text-muted flex items-center gap-1.5 mb-5">
              <Link href="/" className="text-muted2 no-underline hover:text-text transition-colors">Home</Link>
              <span className="text-muted">/</span>
              <Link href={`/is-${slug}-open`} className="text-muted2 no-underline hover:text-text transition-colors">{brand.name}</Link>
              <span className="text-muted">/</span>
              <span className="text-text">{dayInfo.name}</span>
            </nav>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 text-text">
              Is {brand.name} Open on {dayInfo.name}?
            </h1>

            <div
              className={`rounded-[20px] p-6 sm:p-8 mb-6 border ${
                isHoliday
                  ? "border-orange/30"
                  : isOpenOnDay
                    ? "border-green/25"
                    : "border-red/20"
              }`}
              style={{
                background: isHoliday
                  ? "var(--color-orange-dim)"
                  : isOpenOnDay
                    ? "linear-gradient(135deg, var(--color-bg1) 0%, rgba(0,232,122,0.04) 100%)"
                    : "linear-gradient(135deg, var(--color-bg1) 0%, rgba(255,71,87,0.03) 100%)",
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-bg2 border border-border2 flex items-center justify-center text-2xl">
                  {brand.emoji || "🏪"}
                </div>
                <div>
                  <div className="text-lg font-heading font-bold text-text">{brand.name}</div>
                  <div className="text-xs text-muted2">{brand.category}</div>
                </div>
              </div>

              {isHoliday ? (
                <div>
                  <p className="text-lg font-heading font-bold text-orange mb-2">
                    {dayInfo.name} — Hours may vary
                  </p>
                  <p className="text-sm text-muted2">
                    Many {brand.name} locations have reduced hours or are closed on{" "}
                    {dayInfo.name}. Check your local store for specific holiday hours.
                  </p>
                </div>
              ) : (
                <div>
                  <p
                    className={`text-3xl font-heading font-extrabold tracking-tight mb-2 ${
                      isOpenOnDay ? "text-green" : "text-red"
                    }`}
                  >
                    {isOpenOnDay ? "Yes, typically open" : "No, usually closed"}
                  </p>
                  {isOpenOnDay && (
                    <p className="text-lg font-semibold text-text">
                      Typical {dayInfo.name} hours:{" "}
                      <span className="font-mono">{hoursStr}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <h2 className="font-heading text-lg font-bold mb-3 text-text">Full week hours</h2>
            <HoursTable hours={hours} />

            <Link
              href={`/is-${slug}-open`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-green no-underline hover:underline mt-4"
            >
              &larr; Back to real-time status
            </Link>
          </main>

          <aside className="hidden lg:block sticky top-[72px]">
            <TrendingSidebar />
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
