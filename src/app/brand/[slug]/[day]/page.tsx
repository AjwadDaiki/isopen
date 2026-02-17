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
      <div className="bg-bg pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-0 items-start">
          <main className="min-w-0 lg:pr-10">
            <nav className="font-mono text-xs text-ink3 flex items-center gap-1.5 mb-5">
              <Link href="/" className="text-ink3 no-underline hover:text-ink">
                Home
              </Link>
              <span className="opacity-40">/</span>
              <Link href={`/is-${slug}-open`} className="text-ink3 no-underline hover:text-ink">
                {brand.name}
              </Link>
              <span className="opacity-40">/</span>
              <span>{dayInfo.name}</span>
            </nav>

            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">
              Is {brand.name} Open on {dayInfo.name}?
            </h1>

            <div
              className={`rounded-2xl p-6 sm:p-8 mb-6 border-2 ${
                isHoliday
                  ? "bg-amber-bg border-amber"
                  : isOpenOnDay
                    ? "bg-green-bg border-green"
                    : "bg-red-bg border-red"
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm">
                  {brand.emoji || "Store"}
                </div>
                <div>
                  <div className="text-lg font-bold">{brand.name}</div>
                  <div className="text-xs text-ink3">{brand.category}</div>
                </div>
              </div>

              {isHoliday ? (
                <div>
                  <p className="text-lg font-bold text-amber mb-2">
                    {dayInfo.name} - Hours may vary
                  </p>
                  <p className="text-sm text-ink2">
                    Many {brand.name} locations have reduced hours or are closed on{" "}
                    {dayInfo.name}. Check your local store for specific holiday hours.
                  </p>
                </div>
              ) : (
                <div>
                  <p
                    className={`text-3xl font-black tracking-tight mb-2 ${
                      isOpenOnDay ? "text-green" : "text-red"
                    }`}
                  >
                    {isOpenOnDay ? "Yes, typically open" : "No, usually closed"}
                  </p>
                  {isOpenOnDay && (
                    <p className="text-lg font-semibold text-ink">
                      Typical {dayInfo.name} hours:{" "}
                      <span className="font-mono">{hoursStr}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <h2 className="text-lg font-bold mb-3">Full week hours</h2>
            <HoursTable hours={hours} timezone="America/New_York" />

            <Link
              href={`/is-${slug}-open`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-green no-underline hover:underline mt-4"
            >
              Back to real-time status
            </Link>
          </main>

          <aside className="hidden lg:block sticky top-[84px]">
            <TrendingSidebar />
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}
