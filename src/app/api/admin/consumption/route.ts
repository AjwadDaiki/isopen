import { NextRequest, NextResponse } from "next/server";
import { getConsumptionDashboard } from "@/lib/establishments";

function isAuthorized(request: NextRequest): boolean {
  const configured = process.env.ADMIN_DASHBOARD_TOKEN;
  if (!configured) return true;
  const bearer = request.headers.get("authorization");
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : null;
  return token === configured;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const daysRaw = Number(new URL(request.url).searchParams.get("days") || 30);
  const days = Number.isFinite(daysRaw) ? Math.min(Math.max(daysRaw, 1), 365) : 30;
  const stats = await getConsumptionDashboard(days);

  return NextResponse.json({ days, stats });
}
