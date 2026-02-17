"use client";

import { useEffect, useState, useCallback } from "react";

interface Report {
  id: string;
  report_type: string;
  message: string | null;
  reported_at: string;
  upvotes: number;
}

interface Props {
  brandSlug: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - then) / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;

  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

function reportText(type: string) {
  if (type === "confirmed_open") return "Confirmed open";
  if (type === "confirmed_closed") return "Confirmed closed";
  return "Wrong hours reported";
}

export default function UserReports({ brandSlug }: Props) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reportType, setReportType] = useState<string>("confirmed_open");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch(`/api/reports?brand=${brandSlug}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [brandSlug]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandSlug,
          reportType,
          message: message.trim() || null,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setShowForm(false);
        setMessage("");
        setTimeout(() => setSubmitted(false), 4000);
        fetchReports();
      }
    } catch {
      // Silent fail
    } finally {
      setSubmitting(false);
    }
  }

  const quickActions: Array<[string, string]> = [
    ["confirmed_open", "Confirm open"],
    ["confirmed_closed", "Report closed"],
    ["wrong_hours", "Wrong hours"],
  ];

  return (
    <section id="user-reports" className="ui-panel overflow-hidden">
      <div className="card-title-row">
        <div>
          <h3 className="font-heading font-bold text-[15px] tracking-[-0.01em] text-text">Live user reports</h3>
          <p className="mt-1 text-[12px] text-muted2">Community feedback helps keep this page accurate.</p>
        </div>
        <span className="font-mono text-[10px] text-muted tracking-[0.06em]">{reports.length} reports</span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="px-5 py-4 md:px-6 md:py-5 border-b border-border bg-bg1/60">
          <div className="flex flex-wrap gap-2 mb-3.5">
            {(
              [
                ["confirmed_open", "Open", "bg-green/10 text-green border-green/20"],
                ["confirmed_closed", "Closed", "bg-red/10 text-red border-red/20"],
                ["wrong_hours", "Wrong hours", "bg-orange/10 text-orange border-orange/20"],
              ] as const
            ).map(([type, label, classes]) => (
              <button
                key={type}
                type="button"
                onClick={() => setReportType(type)}
                className={`text-[13px] font-semibold px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                  reportType === type ? classes : "bg-bg2 text-muted2 border-border"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional: Add details about what you found..."
            className="w-full bg-bg2 border border-border rounded-xl px-3.5 py-3 text-[14px] text-text resize-none h-24 outline-none focus:border-green/40 transition-colors font-sans placeholder:text-muted"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <p className="text-[12px] text-muted">Your report helps keep hours accurate in real time.</p>
            <button
              type="submit"
              disabled={submitting}
              className="bg-green text-black rounded-lg px-4 py-2.5 text-[13px] font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit report"}
            </button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="px-5 py-3 md:px-6 bg-green-dim text-green text-sm font-semibold border-b border-border">
          Report submitted. Thank you.
        </div>
      )}

      <div className="px-4 py-4 md:px-5 md:py-5">
        {loading ? (
          <div className="rounded-xl border border-border bg-bg2/50 px-4 py-6 text-center text-muted text-[14px]">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-border bg-bg2/50 px-4 py-6 text-center text-muted text-[13px]">
            No reports yet. Be the first to report.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-xl border border-border bg-bg2/55 px-3.5 py-3.5 md:px-4 md:py-4 grid grid-cols-[10px_1fr_auto] items-start gap-3"
              >
                <div
                  className={`w-[8px] h-[8px] rounded-full mt-1.5 ${
                    report.report_type === "confirmed_closed"
                      ? "bg-red"
                      : report.report_type === "wrong_hours"
                        ? "bg-orange"
                        : "bg-green"
                  }`}
                  style={report.report_type === "confirmed_open" ? { boxShadow: "0 0 6px var(--color-green-glow)" } : undefined}
                />

                <div className="min-w-0">
                  <p className="text-[14px] text-text leading-relaxed break-words">{report.message || reportText(report.report_type)}</p>
                </div>

                <span className="font-mono text-[11px] text-muted shrink-0 mt-0.5">{timeAgo(report.reported_at)}</span>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-5 py-4 md:px-6 border-t border-border bg-bg1/60">
        {quickActions.map(([type, label]) => (
          <button
            key={type}
            onClick={() => {
              setShowForm(true);
              setReportType(type);
            }}
            className="py-2.5 px-3 rounded-lg border border-border2 bg-bg2 text-muted2 font-medium text-[13px] cursor-pointer transition-all hover:border-green hover:text-green hover:bg-green-dim"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

