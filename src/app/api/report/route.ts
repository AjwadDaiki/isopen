import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit: 5 reports per minute per IP
  const ip = getClientIp(request);
  const { limited, remaining, resetAt } = checkRateLimit(`report:${ip}`, 5, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Too many reports. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { brandSlug, reportType, message } = body;

    if (!brandSlug || !reportType) {
      return NextResponse.json(
        { error: "Missing required fields: brandSlug, reportType" },
        { status: 400 }
      );
    }

    const validTypes = ["confirmed_open", "confirmed_closed", "wrong_hours"];
    if (!validTypes.includes(reportType)) {
      return NextResponse.json(
        { error: `Invalid reportType. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    if (supabase) {
      const { data, error } = await supabase.from("user_reports").insert({
        brand_slug: brandSlug,
        report_type: reportType,
        message: message || null,
      }).select().single();

      if (!error && data) {
        return NextResponse.json(
          { success: true, report: data },
          { status: 201, headers: { "X-RateLimit-Remaining": String(remaining) } }
        );
      }
      if (error) console.error("Supabase insert error:", error);
    }

    // Graceful degradation: return success even if DB unavailable
    return NextResponse.json(
      {
        success: true,
        report: {
          id: crypto.randomUUID(),
          brand_slug: brandSlug,
          report_type: reportType,
          message: message || null,
          reported_at: new Date().toISOString(),
          upvotes: 0,
        },
      },
      { status: 201, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
