import { createServerClient } from "@/lib/supabase";

interface RawEventRow {
  event_name: string | null;
  template_type: string | null;
  path: string | null;
  created_at: string | null;
}

export interface MonetizationByTemplate {
  template: string;
  pageViews: number;
  adSlotViews: number;
  affiliateClicks: number;
  ctaClicks: number;
  reports: number;
}

export interface MonetizationDashboard {
  days: number;
  totalEvents: number;
  templateViews: number;
  adSlotViews: number;
  affiliateClicks: number;
  ctaClicks: number;
  reportSubmissions: number;
  adViewsPerPageView: number;
  byTemplate: MonetizationByTemplate[];
  topPaths: Array<{ path: string; views: number }>;
}

function empty(days: number): MonetizationDashboard {
  return {
    days,
    totalEvents: 0,
    templateViews: 0,
    adSlotViews: 0,
    affiliateClicks: 0,
    ctaClicks: 0,
    reportSubmissions: 0,
    adViewsPerPageView: 0,
    byTemplate: [],
    topPaths: [],
  };
}

export async function getMonetizationDashboard(days: number = 30): Promise<MonetizationDashboard> {
  const safeDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 365) : 30;
  const supabase = createServerClient();
  if (!supabase) return empty(safeDays);

  const since = new Date();
  since.setDate(since.getDate() - safeDays);

  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_name, template_type, path, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(20_000);

  if (error || !data) return empty(safeDays);
  const rows = data as RawEventRow[];
  if (rows.length === 0) return empty(safeDays);

  let templateViews = 0;
  let adSlotViews = 0;
  let affiliateClicks = 0;
  let ctaClicks = 0;
  let reports = 0;

  const templateMap = new Map<string, MonetizationByTemplate>();
  const pathViewMap = new Map<string, number>();

  for (const row of rows) {
    const event = row.event_name || "";
    const template = row.template_type || "unknown";
    const path = row.path || "";

    if (event === "page_template_view") {
      templateViews += 1;
      if (path) pathViewMap.set(path, (pathViewMap.get(path) || 0) + 1);
    } else if (event === "ad_slot_view") {
      adSlotViews += 1;
    } else if (event === "affiliate_click") {
      affiliateClicks += 1;
    } else if (event === "cta_click") {
      ctaClicks += 1;
    } else if (event === "user_report") {
      reports += 1;
    }

    const current = templateMap.get(template) || {
      template,
      pageViews: 0,
      adSlotViews: 0,
      affiliateClicks: 0,
      ctaClicks: 0,
      reports: 0,
    };

    if (event === "page_template_view") current.pageViews += 1;
    if (event === "ad_slot_view") current.adSlotViews += 1;
    if (event === "affiliate_click") current.affiliateClicks += 1;
    if (event === "cta_click") current.ctaClicks += 1;
    if (event === "user_report") current.reports += 1;

    templateMap.set(template, current);
  }

  const byTemplate = [...templateMap.values()]
    .sort((a, b) => b.pageViews - a.pageViews)
    .slice(0, 16);

  const topPaths = [...pathViewMap.entries()]
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);

  return {
    days: safeDays,
    totalEvents: rows.length,
    templateViews,
    adSlotViews,
    affiliateClicks,
    ctaClicks,
    reportSubmissions: reports,
    adViewsPerPageView: templateViews ? adSlotViews / templateViews : 0,
    byTemplate,
    topPaths,
  };
}
