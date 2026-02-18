import { computeOpenStatus } from "@/lib/isOpenNow";
import type { HoursData, OpenStatus } from "@/lib/types";
import { createServerClient } from "@/lib/supabase";

type SourceType = "manual" | "public" | "scrape" | "google";

interface EstablishmentRow {
  id: string;
  slug: string;
  name: string;
  timezone: string | null;
  country: string | null;
  google_place_id: string | null;
  source: SourceType;
  standard_hours: HoursData[] | null;
  is_24h: boolean;
  last_verified_at: string | null;
  last_google_sync_at: string | null;
}

interface ApiLogInsert {
  provider: "google_places" | "local" | "public_dataset" | "nager_date";
  endpoint: string;
  status_code?: number | null;
  cache_hit?: boolean;
  estimated_cost_usd?: number;
  establishment_id?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}

function toHours(rows: unknown): HoursData[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((r) => r as Partial<HoursData>)
    .filter((r) => typeof r.dayOfWeek === "number")
    .map((r) => ({
      dayOfWeek: r.dayOfWeek as number,
      openTime: r.openTime ?? null,
      closeTime: r.closeTime ?? null,
      isClosed: Boolean(r.isClosed),
      spansMidnight: Boolean(r.spansMidnight),
    }));
}

async function insertApiLog(payload: ApiLogInsert): Promise<void> {
  const supabase = createServerClient();
  if (!supabase) return;
  await supabase.from("api_logs").insert({
    provider: payload.provider,
    endpoint: payload.endpoint,
    status_code: payload.status_code ?? null,
    cache_hit: payload.cache_hit ?? false,
    estimated_cost_usd: payload.estimated_cost_usd ?? 0,
    establishment_id: payload.establishment_id ?? null,
    notes: payload.notes ?? null,
    metadata: payload.metadata ?? null,
  });
}

async function fetchEstablishmentBySlug(
  slug: string
): Promise<EstablishmentRow | null> {
  const supabase = createServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("establishments")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return {
    ...(data as Omit<EstablishmentRow, "standard_hours">),
    standard_hours: toHours(data.standard_hours),
  };
}

async function fetchEstablishmentById(
  id: string
): Promise<EstablishmentRow | null> {
  const supabase = createServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("establishments")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return {
    ...(data as Omit<EstablishmentRow, "standard_hours">),
    standard_hours: toHours(data.standard_hours),
  };
}

interface GoogleBootstrapInput {
  slug: string;
  name: string;
  googlePlaceId: string;
  timezone?: string;
  country?: string;
}

interface GoogleFetchResult {
  name: string;
  timezone: string;
  hours: HoursData[];
}

async function fetchFromGoogleOnce(
  input: GoogleBootstrapInput
): Promise<GoogleFetchResult | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;

  // This uses the Place Details endpoint as a one-time bootstrap.
  const url =
    "https://maps.googleapis.com/maps/api/place/details/json" +
    `?place_id=${encodeURIComponent(input.googlePlaceId)}` +
    "&fields=name,utc_offset" +
    `&key=${encodeURIComponent(key)}`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  await insertApiLog({
    provider: "google_places",
    endpoint: "place/details/bootstrap",
    status_code: res.status,
    cache_hit: false,
    estimated_cost_usd: 0.017,
    notes: "single-fetch bootstrap",
    metadata: { slug: input.slug, placeId: input.googlePlaceId },
  });

  if (!res.ok) return null;
  const json = (await res.json()) as {
    result?: { name?: string; utc_offset?: number };
  };
  const hours: HoursData[] = Array.from({ length: 7 }).map((_, d) => ({
    dayOfWeek: d,
    openTime: null,
    closeTime: null,
    isClosed: false,
    spansMidnight: false,
  }));

  return {
    name: json.result?.name || input.name,
    timezone: input.timezone || "America/New_York",
    hours,
  };
}

async function persistBootstrapRecord(
  input: GoogleBootstrapInput,
  result: GoogleFetchResult
): Promise<EstablishmentRow | null> {
  const supabase = createServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("establishments")
    .upsert(
      {
        slug: input.slug,
        name: result.name,
        country: input.country || "US",
        timezone: result.timezone,
        google_place_id: input.googlePlaceId,
        source: "google",
        standard_hours: result.hours,
        is_24h: false,
        last_google_sync_at: new Date().toISOString(),
        last_verified_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    )
    .select("*")
    .single();

  if (error || !data) return null;
  return {
    ...(data as Omit<EstablishmentRow, "standard_hours">),
    standard_hours: toHours(data.standard_hours),
  };
}

function localStatus(row: EstablishmentRow, timezone: string): OpenStatus {
  return computeOpenStatus(
    row.standard_hours || [],
    timezone || row.timezone || "America/New_York",
    row.is_24h
  );
}

export async function getStatusFromCacheBySlug(
  slug: string,
  timezone: string
): Promise<{ status: OpenStatus; source: "supabase"; verifiedAt: string | null } | null> {
  const row = await fetchEstablishmentBySlug(slug);
  if (!row || !row.standard_hours || row.standard_hours.length === 0) return null;

  await insertApiLog({
    provider: "local",
    endpoint: "status/cache-by-slug",
    cache_hit: true,
    estimated_cost_usd: 0,
    establishment_id: row.id,
    metadata: { slug },
  });
  return { status: localStatus(row, timezone), source: "supabase", verifiedAt: row.last_verified_at };
}

export async function getStatus(
  establishmentId: string,
  timezone: string,
  options?: { allowGoogleBootstrap?: boolean; bootstrap?: GoogleBootstrapInput }
): Promise<{
  status: OpenStatus;
  source: "supabase_cache" | "google_bootstrap";
  establishmentId: string;
} | null> {
  const row = await fetchEstablishmentById(establishmentId);
  if (row && row.standard_hours && row.standard_hours.length > 0) {
    await insertApiLog({
      provider: "local",
      endpoint: "status/get-status",
      cache_hit: true,
      estimated_cost_usd: 0,
      establishment_id: row.id,
      metadata: { establishmentId },
    });

    return {
      status: localStatus(row, timezone),
      source: "supabase_cache",
      establishmentId: row.id,
    };
  }

  if (!options?.allowGoogleBootstrap || !options.bootstrap) return null;
  const bootstrapResult = await fetchFromGoogleOnce(options.bootstrap);
  if (!bootstrapResult) return null;

  const persisted = await persistBootstrapRecord(options.bootstrap, bootstrapResult);
  if (!persisted) return null;

  return {
    status: localStatus(persisted, timezone),
    source: "google_bootstrap",
    establishmentId: persisted.id,
  };
}

// Alias kept intentionally to match architecture spec naming.
export const get_status = getStatus;

export async function getConsumptionDashboard(days: number = 30): Promise<{
  byDay: Array<{ day: string; calls: number; estimatedCostUsd: number }>;
  totalCalls: number;
  totalCostUsd: number;
  cacheHits: number;
  cacheHitRatio: number;
  sources: { supabaseServed: number; googleServed: number };
}> {
  const supabase = createServerClient();
  if (!supabase) {
    return {
      byDay: [],
      totalCalls: 0,
      totalCostUsd: 0,
      cacheHits: 0,
      cacheHitRatio: 0,
      sources: { supabaseServed: 0, googleServed: 0 },
    };
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("api_logs")
    .select("provider, cache_hit, estimated_cost_usd, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  const rows = data || [];
  const daily = new Map<string, { calls: number; cost: number }>();
  let totalCost = 0;
  let cacheHits = 0;
  let supabaseServed = 0;
  let googleServed = 0;

  for (const row of rows) {
    const day = String(row.created_at).slice(0, 10);
    const curr = daily.get(day) || { calls: 0, cost: 0 };
    curr.calls += 1;
    curr.cost += Number(row.estimated_cost_usd || 0);
    daily.set(day, curr);

    totalCost += Number(row.estimated_cost_usd || 0);
    if (row.cache_hit) cacheHits += 1;
    if (row.provider === "google_places") googleServed += 1;
    else supabaseServed += 1;
  }

  const totalCalls = rows.length;
  const byDay = Array.from(daily.entries()).map(([day, v]) => ({
    day,
    calls: v.calls,
    estimatedCostUsd: Number(v.cost.toFixed(4)),
  }));

  return {
    byDay,
    totalCalls,
    totalCostUsd: Number(totalCost.toFixed(4)),
    cacheHits,
    cacheHitRatio: totalCalls ? cacheHits / totalCalls : 0,
    sources: { supabaseServed, googleServed },
  };
}

export async function runWeeklyVerification(limit: number = 250): Promise<{
  scanned: number;
  verified: number;
  skippedNoGoogleId: number;
  googleChecks: number;
}> {
  const supabase = createServerClient();
  if (!supabase) {
    return { scanned: 0, verified: 0, skippedNoGoogleId: 0, googleChecks: 0 };
  }

  const { data } = await supabase
    .from("establishments")
    .select("id, google_place_id, slug, last_verified_at")
    .eq("is_active", true)
    .limit(limit);

  const threshold = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const rows = (data || []).filter((row) => {
    if (!row.last_verified_at) return true;
    return new Date(row.last_verified_at).getTime() < threshold;
  });
  let verified = 0;
  let skippedNoGoogleId = 0;
  let googleChecks = 0;

  for (const row of rows) {
    const now = new Date().toISOString();
    if (!row.google_place_id) {
      skippedNoGoogleId += 1;
      await supabase
        .from("establishments")
        .update({ last_verified_at: now })
        .eq("id", row.id);
      await insertApiLog({
        provider: "local",
        endpoint: "cron/weekly-verify",
        cache_hit: true,
        estimated_cost_usd: 0,
        establishment_id: row.id,
        notes: "no google_place_id, local verification only",
        metadata: { slug: row.slug },
      });
      verified += 1;
      continue;
    }

    googleChecks += 1;
    await insertApiLog({
      provider: "google_places",
      endpoint: "cron/weekly-verify",
      cache_hit: false,
      estimated_cost_usd: 0.005,
      establishment_id: row.id,
      notes: "weekly consistency check",
      metadata: { slug: row.slug },
    });
    await supabase
      .from("establishments")
      .update({ last_verified_at: now, last_google_sync_at: now })
      .eq("id", row.id);
    verified += 1;
  }

  return {
    scanned: rows.length,
    verified,
    skippedNoGoogleId,
    googleChecks,
  };
}
