import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const ALLOWED_EVENTS = new Set([
  "affiliate_click",
  "cta_click",
  "share",
  "user_report",
  "page_template_view",
  "ad_slot_view",
]);

function asSafeString(value: unknown, max = 120): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function asSafePath(value: unknown): string | null {
  const v = asSafeString(value, 280);
  if (!v) return null;
  if (!v.startsWith("/")) return null;
  return v;
}

function asSafeBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  return null;
}

function inferTemplateFromPath(path: string | null): string | null {
  if (!path) return null;
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return "home";

  if (segments[0] === "about" || segments[0] === "contact" || segments[0] === "privacy" || segments[0] === "terms") {
    return "legal";
  }
  if (segments[0] === "search") return "search";
  if (segments[0] === "category") return "category";
  if (segments[0] === "city") {
    if (segments.length === 1) return "city_index";
    if (segments.length === 2) return "city_page";
    return "city_brand";
  }
  if (segments[0] === "state") return segments.length === 1 ? "state_index" : "state_page";
  if (segments[0] === "near-me") return segments.length === 1 ? "near_me_index" : "near_me_category";
  if (segments[0] === "brand") return segments.length >= 3 ? "brand_day" : "brand";
  if (/^is-.+-open(?:-on-.+)?$/.test(segments[0])) return segments[0].includes("-open-on-") ? "brand_day" : "brand";
  return "other";
}

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

function looksLikeBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /(bot|crawl|spider|slurp|bingpreview|lighthouse|headless)/i.test(userAgent);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent");

  // Ignore crawler traffic to keep monetization signals clean and DB costs low.
  if (looksLikeBot(userAgent)) {
    return NextResponse.json({ ok: true, ignored: "bot" });
  }

  const { limited, resetAt } = checkRateLimit(`event:${ip}`, 180, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Too many events." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const eventName = asSafeString((body as { eventName?: unknown })?.eventName, 60);
  if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const rawParams = (body as { params?: Record<string, unknown> })?.params || {};
  const safePath = asSafePath((body as { path?: unknown })?.path);
  const dedupeSignature = [
    eventName,
    safePath || "",
    asSafeString(rawParams.ad_slot) || "",
    asSafeString(rawParams.template_type) || "",
    asSafeString(rawParams.cta_type) || "",
    asSafeString(rawParams.affiliate_provider) || "",
  ].join("|");

  // Prevent duplicate high-frequency events from overcounting and overspending.
  const dedupeWindowMs =
    eventName === "page_template_view" ? 30_000 :
    eventName === "ad_slot_view" ? 20_000 :
    10_000;
  const dedupe = checkRateLimit(`event-dedupe:${ip}:${dedupeSignature}`, 1, dedupeWindowMs);
  if (dedupe.limited) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const payload = {
    event_name: eventName,
    template_type: asSafeString(rawParams.template_type) || inferTemplateFromPath(safePath),
    path: safePath,
    referrer: asSafeString((body as { referrer?: unknown })?.referrer, 280),
    brand_slug: asSafeString(rawParams.brand_slug),
    brand_name: asSafeString(rawParams.brand_name),
    cta_type: asSafeString(rawParams.cta_type),
    ad_slot: asSafeString(rawParams.ad_slot),
    ad_label: asSafeString(rawParams.ad_label),
    affiliate_provider: asSafeString(rawParams.affiliate_provider),
    report_type: asSafeString(rawParams.report_type),
    method: asSafeString(rawParams.method),
    brand_is_open: asSafeBoolean(rawParams.brand_is_open),
    content_type: asSafeString(rawParams.content_type),
    ip_hash: hashIp(ip),
    user_agent: asSafeString(userAgent, 220),
    metadata: {
      ts: typeof (body as { ts?: unknown })?.ts === "number" ? (body as { ts: number }).ts : Date.now(),
    },
  };

  const supabase = createServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const { error } = await supabase.from("analytics_events").insert(payload);
  if (error) {
    // Non-blocking: keep UX smooth even if analytics table is missing or unavailable.
    return NextResponse.json({ ok: true, persisted: false });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
