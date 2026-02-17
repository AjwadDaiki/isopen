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

  return (
    <div className="bg-white border border-ink/10 rounded-xl mb-4 overflow-hidden shadow-[0_2px_16px_rgba(26,22,18,0.08)]">
      <div className="px-6 py-[18px] border-b border-ink/10 flex items-center justify-between">
        <h2 className="text-[15px] font-bold tracking-[-0.01em] flex items-center gap-2">
          <span className="text-base">💬</span> Live user reports
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-transparent text-ink2 border border-ink/20 rounded-lg px-3 py-1.5 font-medium text-xs cursor-pointer hover:bg-bg2 transition-all"
        >
          Report hours issue
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="px-6 py-4 border-b border-ink/10 bg-bg">
          <div className="flex gap-2 mb-3">
            {(
              [
                ["confirmed_open", "✅ Open", "bg-green-bg text-green border-green/20"],
                ["confirmed_closed", "❌ Closed", "bg-red-bg text-red border-red/20"],
                ["wrong_hours", "⚠️ Wrong hours", "bg-amber-bg text-amber border-amber/20"],
              ] as const
            ).map(([type, label, classes]) => (
              <button
                key={type}
                type="button"
                onClick={() => setReportType(type)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  reportType === type ? classes : "bg-white text-ink3 border-ink/10"
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
            className="w-full bg-white border border-ink/10 rounded-lg px-3 py-2 text-sm resize-none h-20 outline-none focus:border-green/40 transition-colors font-sans"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-ink text-bg rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit report"}
          </button>
        </form>
      )}

      {submitted && (
        <div className="px-6 py-3 bg-green-bg text-green text-sm font-semibold">
          ✅ Thanks! Your report has been submitted.
        </div>
      )}

      <div className="py-2">
        {loading ? (
          <div className="px-6 py-6 text-center text-ink3 text-sm">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="px-6 py-6 text-center text-ink3 text-sm">
            No reports yet. Be the first to report!
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="px-6 py-3 flex items-start gap-3 border-b border-ink/10 last:border-b-0"
            >
              <div
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  report.report_type === "confirmed_closed"
                    ? "bg-red"
                    : report.report_type === "wrong_hours"
                      ? "bg-amber"
                      : "bg-green"
                }`}
              />
              <p className="text-[13px] text-ink2 leading-relaxed flex-1">
                {report.message || (
                  report.report_type === "confirmed_open"
                    ? "Confirmed open"
                    : report.report_type === "confirmed_closed"
                      ? "Confirmed closed"
                      : "Wrong hours reported"
                )}
              </p>
              <span className="font-mono text-[11px] text-ink3 shrink-0 mt-0.5">
                {timeAgo(report.reported_at)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
