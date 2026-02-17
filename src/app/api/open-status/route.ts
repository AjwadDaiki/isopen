import { NextRequest, NextResponse } from "next/server";
import { getBrandBySlug } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";
import { getStatusFromCacheBySlug } from "@/lib/establishments";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("brand");
  const tz = searchParams.get("timezone") || "America/New_York";

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
  const cached = await getStatusFromCacheBySlug(slug, tz);
  const status = cached?.status || computeOpenStatus(hours, tz, brand.is24h);

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
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
