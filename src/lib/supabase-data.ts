import { supabase } from "./supabase";
import type { BrandData, HoursData } from "./types";

// Guard: if supabase is null (missing env vars), all functions return empty results gracefully.

export interface SupaBrand {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  emoji: string | null;
  logo_url: string | null;
  website: string | null;
  is_24h: boolean;
}

export interface SupaBrandHour {
  id: string;
  brand_id: string;
  country: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  spans_midnight: boolean;
}

export interface SupaUserReport {
  id: string;
  brand_slug: string;
  report_type: string;
  message: string | null;
  reported_at: string;
  upvotes: number;
}

function toBrandData(row: SupaBrand): BrandData {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    emoji: row.emoji,
    logoUrl: row.logo_url,
    website: row.website,
    is24h: row.is_24h,
  };
}

function toHoursData(row: SupaBrandHour): HoursData {
  return {
    dayOfWeek: row.day_of_week,
    openTime: row.open_time,
    closeTime: row.close_time,
    isClosed: row.is_closed,
    spansMidnight: row.spans_midnight,
  };
}

/** Fetch all brands from Supabase */
export async function fetchAllBrands(): Promise<BrandData[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  if (error || !data) return [];
  return data.map(toBrandData);
}

/** Fetch a single brand by slug */
export async function fetchBrandBySlug(slug: string): Promise<BrandData | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return toBrandData(data);
}

/** Fetch brand hours for a brand (by brand_id + country) */
export async function fetchBrandHours(
  brandId: string,
  country: string = "US"
): Promise<HoursData[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("brand_hours")
    .select("*")
    .eq("brand_id", brandId)
    .eq("country", country)
    .order("day_of_week");

  if (error || !data) return [];
  return data.map(toHoursData);
}

/** Fetch brand + hours in one call */
export async function fetchBrandWithHours(
  slug: string,
  country: string = "US"
): Promise<{ brand: BrandData; hours: HoursData[] } | null> {
  const brand = await fetchBrandBySlug(slug);
  if (!brand) return null;

  const hours = await fetchBrandHours(brand.id, country);
  return { brand, hours };
}

/** Fetch recent user reports for a brand */
export async function fetchReports(
  brandSlug: string,
  limit: number = 10
): Promise<SupaUserReport[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("user_reports")
    .select("*")
    .eq("brand_slug", brandSlug)
    .order("reported_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

/** Fetch all brand slugs (for generateStaticParams) */
export async function fetchAllSlugs(): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("brands")
    .select("slug");

  if (error || !data) return [];
  return data.map((d) => d.slug);
}

/** Fetch holidays for a country around a date */
export async function fetchUpcomingHolidays(
  country: string = "US",
  withinDays: number = 14
): Promise<{ date: string; name: string }[]> {
  if (!supabase) return [];
  const today = new Date();
  const future = new Date(today);
  future.setDate(future.getDate() + withinDays);

  const { data, error } = await supabase
    .from("holidays")
    .select("date, name")
    .eq("country", country)
    .gte("date", today.toISOString().split("T")[0])
    .lte("date", future.toISOString().split("T")[0])
    .order("date");

  if (error || !data) return [];
  return data;
}
