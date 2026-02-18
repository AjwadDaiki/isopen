import { NextRequest, NextResponse } from "next/server";
import { getBrandBySlug } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { getStatusFromCacheBySlug } from "@/lib/establishments";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { HoursData, OpenStatus } from "@/lib/types";

interface NearestLocation {
  id: string;
  city: string | null;
  address: string | null;
  distanceKm: number;
  timezone: string | null;
}

type LocationSource = "gps" | "ip" | "none";
type ServedBy = "memory-cache" | "supabase-cache" | "local-dataset";

interface OpenStatusApiResponse {
  brand: {
    slug: string;
    name: string;
    category: string | null;
    emoji: string | null;
  };
  status: OpenStatus;
  servedBy: ServedBy;
  nearestLocation: NearestLocation | null;
  locationSource: LocationSource;
  verifiedAt: string | null;
  checkedAt: string;
}

interface MemoryEntry {
  value: OpenStatusApiResponse;
  expiresAt: number;
}

const RESPONSE_TTL_MS = 45_000;
const RESPONSE_CACHE_MAX = 800;
const responseCache = new Map<string, MemoryEntry>();

function roundCoord(n: number | null): number | null {
  if (!Number.isFinite(n)) return null;
  return Math.round((n as number) * 1000) / 1000;
}

function buildCacheKey(
  slug: string,
  timezone: string,
  lat: number | null,
  lng: number | null,
  source: LocationSource
): string {
  const latKey = lat === null ? "na" : String(lat);
  const lngKey = lng === null ? "na" : String(lng);
  return [slug, timezone, latKey, lngKey, source].join("|");
}

function getCachedResponse(key: string): OpenStatusApiResponse | null {
  const current = responseCache.get(key);
  if (!current) return null;
  if (current.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return null;
  }
  return current.value;
}

function setCachedResponse(key: string, value: OpenStatusApiResponse) {
  if (responseCache.size >= RESPONSE_CACHE_MAX) {
    const now = Date.now();
    for (const [cacheKey, entry] of responseCache) {
      if (entry.expiresAt <= now) responseCache.delete(cacheKey);
      if (responseCache.size < RESPONSE_CACHE_MAX) break;
    }
    if (responseCache.size >= RESPONSE_CACHE_MAX) {
      const first = responseCache.keys().next().value as string | undefined;
      if (first) responseCache.delete(first);
    }
  }
  responseCache.set(key, { value, expiresAt: Date.now() + RESPONSE_TTL_MS });
}

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
  // Rate limit: 30 requests per minute per IP.
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
  if (!slug) {
    return NextResponse.json(
      { error: "Missing 'brand' query parameter" },
      { status: 400 }
    );
  }

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

  const latRounded = roundCoord(resolvedLat);
  const lngRounded = roundCoord(resolvedLng);
  const memoryKey = buildCacheKey(slug, tz, latRounded, lngRounded, locationSource);
  const memoryHit = getCachedResponse(memoryKey);
  if (memoryHit) {
    return NextResponse.json(
      { ...memoryHit, servedBy: "memory-cache" as const },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Status-Cache": "memory-hit",
        },
      }
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
  let servedBy: ServedBy = "local-dataset";
  let verifiedAt: string | null = null;

  if (resolvedLat !== null && resolvedLng !== null) {
    const nearest = await getNearestLocationWithHours(slug, resolvedLat, resolvedLng);
    if (nearest) {
      nearestLocation = nearest.nearest;
      if (nearest.hours.length > 0) {
        resolvedHours = nearest.hours;
      }
    }
  }

  // Only use supabase cached status for non-location-specific checks.
  let status: OpenStatus;
  if (!nearestLocation) {
    const cached = await getStatusFromCacheBySlug(slug, tz);
    if (cached?.status) {
      status = cached.status;
      servedBy = "supabase-cache";
      verifiedAt = cached.verifiedAt || null;
    } else {
      status = computeOpenStatus(resolvedHours, tz, brand.is24h);
    }
  } else {
    status = computeOpenStatus(
      resolvedHours,
      nearestLocation.timezone || tz,
      brand.is24h
    );
  }

  const payload: OpenStatusApiResponse = {
    brand: {
      slug: brand.slug,
      name: brand.name,
      category: brand.category,
      emoji: brand.emoji,
    },
    status,
    servedBy,
    nearestLocation,
    locationSource,
    verifiedAt,
    checkedAt: new Date().toISOString(),
  };

  setCachedResponse(memoryKey, payload);

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "X-Status-Cache": "miss",
    },
  });
}
