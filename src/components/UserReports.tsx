"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackReport } from "@/lib/track";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

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

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

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
  const captchaEnabled = Boolean(turnstileSiteKey);
  const captchaRef = useRef<HTMLDivElement | null>(null);
  const captchaWidgetId = useRef<string | null>(null);

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reportType, setReportType] = useState<string>("confirmed_open");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!showForm || !captchaEnabled || !turnstileSiteKey) return;

    let cancelled = false;

    const renderTurnstile = () => {
      if (cancelled || !captchaRef.current || !window.turnstile || captchaWidgetId.current) return;
      captchaWidgetId.current = window.turnstile.render(captchaRef.current, {
        sitekey: turnstileSiteKey,
        theme: "dark",
        callback: (token: string) => {
          setCaptchaToken(token);
          setCaptchaError(null);
        },
        "expired-callback": () => {
          setCaptchaToken("");
          setCaptchaError("Captcha expired. Please verify again.");
        },
        "error-callback": () => {
          setCaptchaToken("");
          setCaptchaError("Captcha could not load. Please reload the page.");
        },
      });
    };

    if (window.turnstile) {
      renderTurnstile();
    } else {
      const existingScript = document.querySelector<HTMLScriptElement>('script[data-turnstile="1"]');
      if (existingScript) {
        existingScript.addEventListener("load", renderTurnstile, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = "1";
        script.addEventListener("load", renderTurnstile, { once: true });
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      if (captchaWidgetId.current && window.turnstile) {
        window.turnstile.remove(captchaWidgetId.current);
      }
      captchaWidgetId.current = null;
      setCaptchaToken("");
      setCaptchaError(null);
    };
  }, [captchaEnabled, showForm]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);

    if (captchaEnabled && !captchaToken) {
      setSubmitError("Please complete the captcha before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandSlug,
          reportType,
          message: message.trim() || null,
          captchaToken: captchaToken || null,
          website: website || "",
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setSubmitError(body?.error || "Could not submit your report. Please try again.");
        return;
      }

      trackReport(brandSlug, reportType);
      setSubmitted(true);
      setShowForm(false);
      setMessage("");
      setWebsite("");
      setCaptchaToken("");
      setTimeout(() => setSubmitted(false), 4000);
      fetchReports();
    } catch {
      setSubmitError("Could not submit your report. Please try again.");
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
          <p className="mt-1.5 text-[12px] text-muted2">Community feedback helps keep this page accurate.</p>
        </div>
        <span className="font-mono text-[10px] text-muted tracking-[0.06em]">{reports.length} reports</span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="relative panel-body border-b border-border ui-bg-1-60">
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor={`website-${brandSlug}`}>Website</label>
            <input
              id={`website-${brandSlug}`}
              type="text"
              autoComplete="off"
              tabIndex={-1}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2.5 mb-4">
            {(
              [
                ["confirmed_open", "Open", "ui-bg-green-10 text-green ui-border-green-20"],
                ["confirmed_closed", "Closed", "ui-bg-red-10 text-red ui-border-red-20"],
                ["wrong_hours", "Wrong hours", "ui-bg-orange-10 text-orange ui-border-orange-20"],
              ] as const
            ).map(([type, label, classes]) => (
              <button
                key={type}
                type="button"
                onClick={() => setReportType(type)}
                className={`text-[13px] font-semibold px-4 py-2.5 rounded-xl border transition-colors cursor-pointer ${
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
            maxLength={400}
            className="w-full bg-bg2 border border-border rounded-xl px-4 py-3.5 text-[14px] text-text resize-none h-24 outline-none ui-focus-border-green-40 transition-colors font-sans placeholder:text-muted"
          />

          {captchaEnabled && (
            <div className="mt-4">
              <div ref={captchaRef} />
              {captchaError && <p className="mt-2 text-[12px] text-red">{captchaError}</p>}
            </div>
          )}

          {submitError && (
            <div className="mt-4 rounded-xl border border-red/35 bg-red-dim px-3.5 py-2.5 text-[12px] text-red">
              {submitError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <p className="text-[12px] text-muted">Your report helps keep hours accurate in real time.</p>
            <button
              type="submit"
              disabled={submitting || (captchaEnabled && !captchaToken)}
              className="bg-green text-black rounded-xl px-4 py-2.5 text-[13px] font-semibold cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit report"}
            </button>
          </div>
        </form>
      )}

      {submitted && (
        <div className="panel-body bg-green-dim text-green text-sm font-semibold border-b border-border">
          Report submitted. Thank you.
        </div>
      )}

      <div className="panel-body">
        {loading ? (
          <div className="rounded-xl border border-border ui-bg-2-50 px-5 py-8 text-center text-muted text-[14px]">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-border ui-bg-2-50 px-5 py-8 text-center text-muted text-[13px]">
            No reports yet. Be the first to report.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map((report) => (
              <article
                key={report.id}
                className="rounded-xl border border-border ui-bg-2-55 px-5 py-4 md:px-6 md:py-5 grid grid-cols-[10px_1fr_auto] items-start gap-3.5"
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

      <div className="panel-body border-t border-border ui-bg-1-60 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {quickActions.map(([type, label]) => (
          <button
            key={type}
            onClick={() => {
              setShowForm(true);
              setReportType(type);
              setSubmitError(null);
            }}
            className="py-3 px-4 rounded-xl border border-border2 bg-bg2 text-muted2 font-medium text-[13px] cursor-pointer transition-colors hover:border-green hover:text-green hover:bg-green-dim"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
