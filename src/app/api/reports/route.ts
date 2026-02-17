import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const brandSlug = searchParams.get("brand");
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

  if (!brandSlug) {
    return NextResponse.json(
      { error: "Missing 'brand' query parameter" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("user_reports")
    .select("id, brand_slug, report_type, message, reported_at, upvotes")
    .eq("brand_slug", brandSlug)
    .order("reported_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { reports: data || [] },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
