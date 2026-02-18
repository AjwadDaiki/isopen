import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hasCaptchaSecret, isCaptchaRequired, verifyTurnstileToken } from "@/lib/captcha";

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
    const { brandSlug, reportType, message, captchaToken, website } = body;

    if (!brandSlug || !reportType) {
      return NextResponse.json(
        { error: "Missing required fields: brandSlug, reportType" },
        { status: 400 }
      );
    }

    // Honeypot field: bots tend to fill this hidden field.
    if (typeof website === "string" && website.trim().length > 0) {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }

    // Captcha is required in production and optional in dev/staging.
    const captchaRequired = isCaptchaRequired();
    const captchaSecretAvailable = hasCaptchaSecret();
    if (captchaRequired && !captchaSecretAvailable) {
      return NextResponse.json(
        { error: "Report protection misconfigured. Please try again later." },
        { status: 503 }
      );
    }

    if (captchaSecretAvailable) {
      if (typeof captchaToken !== "string" || !captchaToken.trim()) {
        return NextResponse.json({ error: "Captcha validation is required." }, { status: 400 });
      }

      const captcha = await verifyTurnstileToken(captchaToken, ip);
      if (!captcha.success) {
        return NextResponse.json(
          { error: "Captcha check failed.", code: captcha.errors[0] || "captcha_failed" },
          { status: 400 }
        );
      }
    }

    const validTypes = ["confirmed_open", "confirmed_closed", "wrong_hours"];
    if (!validTypes.includes(reportType)) {
      return NextResponse.json(
        { error: `Invalid reportType. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const normalizedMessage =
      typeof message === "string" && message.trim().length > 0
        ? message.trim().slice(0, 400)
        : null;

    const supabase = createServerClient();

    if (supabase) {
      const { data, error } = await supabase.from("user_reports").insert({
        brand_slug: brandSlug,
        report_type: reportType,
        message: normalizedMessage,
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
          message: normalizedMessage,
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
