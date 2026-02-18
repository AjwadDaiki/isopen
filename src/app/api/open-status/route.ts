import { NextRequest, NextResponse } from "next/server";
import { getBrandBySlug } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { getStatusFromCacheBySlug } from "@/lib/establishments";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { HoursData } from "@/lib/types";

interface NearestLocation {
  id: string;
  city: string | null;
  address: string | null;
  distanceKm: number;
  timezone: string | null;
}

type LocationSource = "gps" | "ip" | "none";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getNearestLocationWithHours(
  slug: string,
  lat: number,
  lng: number
): Promise<{ nearest: NearestLocation; hours: HoursData[] } | null> {
  const supabase = createServerClient();
  if (!supabase) return null;

  const brandRes = await supabase
    .from("brands")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  const brandId = brandRes.data?.id;
  if (!brandId) return null;

  const locationsRes = await supabase
    .from("locations")
    .select("id, city, address, latitude, longitude, timezone")
    .eq("brand_id", brandId)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .limit(300);

  const locations = locationsRes.data || [];
  if (locations.length === 0) return null;

  let nearest: (typeof locations)[number] | null = null;
  let best = Number.POSITIVE_INFINITY;

  for (const loc of locations) {
    const d = haversineKm(lat, lng, Number(loc.latitude), Number(loc.longitude));
    if (d < best) {
      best = d;
      nearest = loc;
    }
  }

  if (!nearest) return null;

  const hoursRes = await supabase
    .from("hours")
    .select("day_of_week, open_time, close_time, is_closed, spans_midnight")
    .eq("location_id", nearest.id)
    .order("day_of_week", { ascending: true });

  const hours = (hoursRes.data || []).map((h) => ({
    dayOfWeek: h.day_of_week,
    openTime: h.open_time,
    closeTime: h.close_time,
    isClosed: h.is_closed,
    spansMidnight: h.spans_midnight,
  }));

  return {
    nearest: {
      id: nearest.id,
      city: nearest.city,
      address: nearest.address,
      timezone: nearest.timezone,
      distanceKm: Number(best.toFixed(1)),
    },
    hours,
  };
}

export async function GET(request: NextRequest) {
  // Rate limit: 30 requests per minute per IP
  const ip = getClientIp(request);
  const { limited, resetAt } = checkRateLimit(`open-status:${ip}`, 30, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("brand");
  const tz = searchParams.get("timezone") || "America/New_York";
  const latRaw = searchParams.get("lat");
  const lngRaw = searchParams.get("lng");
  const queryLat = latRaw ? Number(latRaw) : null;
  const queryLng = lngRaw ? Number(lngRaw) : null;
  const headerLatRaw = request.headers.get("x-vercel-ip-latitude");
  const headerLngRaw = request.headers.get("x-vercel-ip-longitude");
  const ipLat = headerLatRaw ? Number(headerLatRaw) : null;
  const ipLng = headerLngRaw ? Number(headerLngRaw) : null;

  const hasQueryCoords = Number.isFinite(queryLat) && Number.isFinite(queryLng);
  const hasIpCoords = Number.isFinite(ipLat) && Number.isFinite(ipLng);
  const resolvedLat = hasQueryCoords ? (queryLat as number) : hasIpCoords ? (ipLat as number) : null;
  const resolvedLng = hasQueryCoords ? (queryLng as number) : hasIpCoords ? (ipLng as number) : null;
  const locationSource: LocationSource = hasQueryCoords ? "gps" : hasIpCoords ? "ip" : "none";

  if (!slug) {
    return NextResponse.json(
      { error: "Missing 'brand' query parameter" },
      { status: 400 }
    );
  }

  const data = getBrandBySlug(slug);
  if (!data) {
    return NextResponse.json(
      { error: `Brand '${slug}' not found` },
      { status: 404 }
    );
  }

  const { brand, hours } = data;
  let nearestLocation: NearestLocation | null = null;
  let resolvedHours = hours;

  if (resolvedLat !== null && resolvedLng !== null) {
    const nearest = await getNearestLocationWithHours(slug, resolvedLat, resolvedLng);
    if (nearest) {
      nearestLocation = nearest.nearest;
      if (nearest.hours.length > 0) {
        resolvedHours = nearest.hours;
      }
    }
  }

  const cached = await getStatusFromCacheBySlug(slug, tz);
  const status =
    cached?.status ||
    computeOpenStatus(
      resolvedHours,
      nearestLocation?.timezone || tz,
      brand.is24h
    );

  return NextResponse.json(
    {
      brand: {
        slug: brand.slug,
        name: brand.name,
        category: brand.category,
        emoji: brand.emoji,
      },
      status,
      servedBy: cached ? "supabase-cache" : "local-dataset",
      nearestLocation,
      locationSource,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
