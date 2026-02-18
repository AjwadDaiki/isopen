import type { Metadata } from "next";
import { getConsumptionDashboard } from "@/lib/establishments";
import { getMonetizationDashboard } from "@/lib/monetization";

interface Props {
  searchParams: Promise<{ token?: string; days?: string }>;
}

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Business Dashboard - IsItOpen",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const configuredToken = process.env.ADMIN_DASHBOARD_TOKEN;
  const authorized = !!configuredToken && params.token === configuredToken;

  if (!authorized) {
    return (
      <main className="page-pad min-h-screen py-16">
        <section className="ui-panel p-6">
          <h1 className="font-heading text-2xl font-bold text-text mb-2">Admin Dashboard</h1>
          <p className="text-muted2 text-sm">Unauthorized. Add `?token=...` to access this page.</p>
        </section>
      </main>
    );
  }

  const daysRaw = Number(params.days || 30);
  const days = Number.isFinite(daysRaw) ? Math.min(Math.max(daysRaw, 1), 365) : 30;
  const stats = await getConsumptionDashboard(days);
  const monetization = await getMonetizationDashboard(days);

  const supabaseRatio = stats.totalCalls
    ? (stats.sources.supabaseServed / stats.totalCalls) * 100
    : 0;

  return (
    <main className="page-pad min-h-screen py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-5">
        <section className="ui-panel p-6">
          <h1 className="font-heading text-3xl font-extrabold text-text tracking-tight">
            Business Dashboard
          </h1>
          <p className="text-muted2 mt-2 text-sm">
            Revenue signals + API cost controls for monetization-first decisions.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label={`API calls (${days}d)`} value={String(stats.totalCalls)} />
          <StatCard label="Estimated cost (USD)" value={`$${stats.totalCostUsd.toFixed(2)}`} />
          <StatCard label="Cache hit ratio" value={`${(stats.cacheHitRatio * 100).toFixed(1)}%`} />
          <StatCard
            label="Served by Supabase"
            value={`${supabaseRatio.toFixed(1)}%`}
            tone={supabaseRatio >= 95 ? "good" : "warn"}
          />
        </section>

        <section className="ui-panel overflow-hidden">
          <div className="card-title-row">
            <h2 className="font-heading text-sm font-bold text-text tracking-tight">Revenue Signals ({days}d)</h2>
          </div>
          <div className="p-4 md:p-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <StatCard label="Template views" value={String(monetization.templateViews)} />
              <StatCard label="Ad slot views" value={String(monetization.adSlotViews)} />
              <StatCard label="Affiliate clicks" value={String(monetization.affiliateClicks)} tone="good" />
              <StatCard label="CTA clicks" value={String(monetization.ctaClicks)} />
              <StatCard
                label="Ad views / page view"
                value={`${monetization.adViewsPerPageView.toFixed(2)}x`}
                tone={monetization.adViewsPerPageView >= 1 ? "good" : "warn"}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-bg2 border border-border rounded-lg p-4">
                <h3 className="font-heading text-sm font-bold text-text mb-3">Top templates</h3>
                {monetization.byTemplate.length === 0 ? (
                  <p className="text-xs text-muted2">No monetization events yet.</p>
                ) : (
                  <div className="grid gap-2">
                    {monetization.byTemplate.slice(0, 10).map((row) => (
                      <div
                        key={row.template}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                      >
                        <span className="font-mono text-xs text-muted2">{row.template}</span>
                        <span className="text-xs text-text">
                          pv:{row.pageViews} | ad:{row.adSlotViews} | aff:{row.affiliateClicks}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-bg2 border border-border rounded-lg p-4">
                <h3 className="font-heading text-sm font-bold text-text mb-3">Top paths by views</h3>
                {monetization.topPaths.length === 0 ? (
                  <p className="text-xs text-muted2">No path-level events yet.</p>
                ) : (
                  <div className="grid gap-2">
                    {monetization.topPaths.slice(0, 10).map((row) => (
                      <div
                        key={row.path}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2 gap-2"
                      >
                        <span className="font-mono text-xs text-muted2 truncate">{row.path}</span>
                        <span className="text-xs text-text shrink-0">{row.views}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="ui-panel overflow-hidden">
          <div className="card-title-row">
            <h2 className="font-heading text-sm font-bold text-text tracking-tight">Calls by day</h2>
          </div>
          <div className="p-4 md:p-6">
            {stats.byDay.length === 0 ? (
              <p className="text-sm text-muted2">No logs yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {stats.byDay.map((row) => (
                  <div
                    key={row.day}
                    className="bg-bg2 border border-border rounded-lg px-3 py-2 flex items-center justify-between"
                  >
                    <span className="font-mono text-xs text-muted2">{row.day}</span>
                    <span className="text-sm text-text">
                      {row.calls} calls - ${row.estimatedCostUsd.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone = "normal",
}: {
  label: string;
  value: string;
  tone?: "normal" | "good" | "warn";
}) {
  const color =
    tone === "good" ? "text-green" : tone === "warn" ? "text-orange" : "text-text";

  return (
    <div className="ui-panel p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className={`font-heading text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
