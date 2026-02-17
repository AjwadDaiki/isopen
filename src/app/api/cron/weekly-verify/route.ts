import { NextRequest, NextResponse } from "next/server";
import { runWeeklyVerification } from "@/lib/establishments";

function isCronAuthorized(request: NextRequest): boolean {
  const configured = process.env.CRON_SECRET;
  if (!configured) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${configured}`;
}

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runWeeklyVerification(500);
  return NextResponse.json({
    ok: true,
    strategy: "weekly verification only, no per-visit Google API",
    ...result,
  });
}
