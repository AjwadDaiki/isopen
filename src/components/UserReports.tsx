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

  const reportButtons: [string, string][] = [
    ["confirmed_open", "✓ Confirm open"],
    ["confirmed_closed", "✗ Report closed"],
    ["wrong_hours", "⚠ Wrong hours"],
  ];

  return (
    <div
      id="user-reports"
      className="bg-bg1 border border-border rounded-2xl overflow-hidden"
    >
      <div className="card-title-row">
        <h3 className="font-heading font-bold text-sm tracking-[-0.01em] flex items-center gap-2 text-text">
          <span>👥</span> Live user reports
        </h3>
        <span className="font-mono text-[10px] text-muted tracking-[0.06em]">
          {reports.length} reports
        </span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="px-6 py-4 border-b border-border">
          <div className="flex gap-2 mb-3">
            {(
              [
                ["confirmed_open", "✅ Open", "bg-green/10 text-green border-green/20"],
                ["confirmed_closed", "❌ Closed", "bg-red/10 text-red border-red/20"],
                ["wrong_hours", "⚠️ Wrong hours", "bg-orange/10 text-orange border-orange/20"],
              ] as const
            ).map(([type, label, classes]) => (
              <button
                key={type}
                type="button"
                onClick={() => setReportType(type)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
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
            className="w-full bg-bg2 border border-border rounded-lg px-3 py-2 text-sm text-text resize-none h-20 outline-none focus:border-green/40 transition-colors font-sans placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-green text-black rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit report"}
          </button>
        </form>
      )}

      {submitted && (
        <div className="px-6 py-3 bg-green-dim text-green text-sm font-semibold border-b border-border">
          ✅ Thanks! Your report has been submitted.
        </div>
      )}

      <div className="py-2">
        {loading ? (
          <div className="px-6 py-6 text-center text-muted text-sm">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="px-6 py-7 text-center text-muted text-[13px]">
            No reports yet. Be the first to report!
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="px-6 py-3 flex items-start gap-3 border-b border-border last:border-b-0 hover:bg-bg2 transition-colors"
            >
              <div
                className={`w-[7px] h-[7px] rounded-full mt-1.5 shrink-0 ${
                  report.report_type === "confirmed_closed"
                    ? "bg-red"
                    : report.report_type === "wrong_hours"
                      ? "bg-orange"
                      : "bg-green"
                }`}
                style={
                  report.report_type === "confirmed_open"
                    ? { boxShadow: "0 0 6px var(--color-green-glow)" }
                    : {}
                }
              />
              <p className="text-[13px] text-muted2 leading-relaxed flex-1">
                {report.message || (
                  report.report_type === "confirmed_open"
                    ? "Confirmed open"
                    : report.report_type === "confirmed_closed"
                      ? "Confirmed closed"
                      : "Wrong hours reported"
                )}
              </p>
              <span className="font-mono text-[11px] text-muted shrink-0 mt-0.5">
                {timeAgo(report.reported_at)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Quick action buttons */}
      <div className="flex gap-2 px-6 py-4 border-t border-border">
        {reportButtons.map(([type, label]) => (
          <button
            key={type}
            onClick={() => {
              setShowForm(true);
              setReportType(type);
            }}
            className="flex-1 py-2.5 px-3 rounded-lg border border-border2 bg-bg2 text-muted2 font-medium text-[13px] cursor-pointer transition-all hover:border-green hover:text-green hover:bg-green-dim flex items-center justify-center gap-1.5"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
