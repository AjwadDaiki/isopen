"use client";

import { useState } from "react";

interface Report {
  id: string;
  type: "confirmed_open" | "confirmed_closed" | "wrong_hours";
  message: string;
  timeAgo: string;
}

// Static demo reports — will be replaced by API later
const DEMO_REPORTS: Report[] = [
  {
    id: "1",
    type: "confirmed_open",
    message: "Confirmed open, went there just now. Normal service, no wait.",
    timeAgo: "12 min ago",
  },
  {
    id: "2",
    type: "confirmed_open",
    message: "Drive-thru only after 10 PM at this location.",
    timeAgo: "1h ago",
  },
  {
    id: "3",
    type: "confirmed_closed",
    message: "Closed early today (renovation). Check the next location nearby.",
    timeAgo: "3h ago",
  },
];

interface Props {
  brandSlug: string;
}

export default function UserReports({ brandSlug }: Props) {
  const [reports] = useState<Report[]>(DEMO_REPORTS);
  const [showForm, setShowForm] = useState(false);
  const [reportType, setReportType] = useState<Report["type"]>("confirmed_open");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production, this would call /api/report
    setSubmitted(true);
    setShowForm(false);
    setMessage("");
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <div className="bg-white border border-ink/10 rounded-xl mb-4 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between">
        <h2 className="text-[15px] font-bold tracking-tight flex items-center gap-2">
          <span>💬</span> Live user reports
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-transparent text-ink2 border border-ink/20 rounded-lg px-3 py-1.5 font-medium text-xs cursor-pointer hover:bg-bg2 transition-all"
        >
          Report hours issue
        </button>
      </div>

      {/* Submit form */}
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
                  reportType === type
                    ? classes
                    : "bg-white text-ink3 border-ink/10"
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
            className="w-full bg-white border border-ink/10 rounded-lg px-3 py-2 text-sm resize-none h-20 outline-none focus:border-green/40 transition-colors"
          />
          <button
            type="submit"
            className="mt-2 bg-ink text-bg rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-ink/80 transition-colors"
          >
            Submit report
          </button>
        </form>
      )}

      {/* Success message */}
      {submitted && (
        <div className="px-6 py-3 bg-green-bg text-green text-sm font-semibold">
          ✅ Thanks! Your report has been submitted.
        </div>
      )}

      {/* Reports list */}
      <div className="py-2">
        {reports.map((report) => (
          <div
            key={report.id}
            className="px-6 py-3 flex items-start gap-3 border-b border-ink/10 last:border-b-0"
          >
            <div
              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                report.type === "confirmed_closed" ? "bg-red" : "bg-green"
              }`}
            />
            <p className="text-[13px] text-ink2 leading-relaxed flex-1">
              {report.message}
            </p>
            <span className="font-mono text-[11px] text-ink3 shrink-0 mt-0.5">
              {report.timeAgo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
