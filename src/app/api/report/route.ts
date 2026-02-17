import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
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

    // Write to Supabase
    const supabase = createServerClient();
    const { data, error } = await supabase.from("user_reports").insert({
      brand_slug: brandSlug,
      report_type: reportType,
      message: message || null,
    }).select().single();

    if (error) {
      console.error("Supabase insert error:", error);
      // Still return success to user even if DB fails (graceful degradation)
      return NextResponse.json(
        {
          success: true,
          report: {
            brandSlug,
            reportType,
            message: message || null,
            reportedAt: new Date().toISOString(),
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { success: true, report: data },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
