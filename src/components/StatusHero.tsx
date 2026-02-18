"use client";

import { useEffect, useState } from "react";
import type { OpenStatus, BrandData } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n/translations";
import { trackCtaClick, trackShare } from "@/lib/track";

interface Props {
  brand: BrandData;
  initialStatus: OpenStatus;
  locale?: Locale;
}

export default function StatusHero({ brand, initialStatus, locale = "en" }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [localTime, setLocalTime] = useState(initialStatus.localTime);
  const [shareState, setShareState] = useState<"idle" | "done">("idle");
  const [locationMode, setLocationMode] = useState<"gps" | "ip" | "none">("none");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearest, setNearest] = useState<{ city: string | null; distanceKm: number } | null>(null);

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let cancelled = false;

    async function refresh() {
      try {
        const qs = new URLSearchParams({
          brand: brand.slug,
          timezone: tz,
        });

        if (coords) {
          qs.set("lat", String(coords.lat));
          qs.set("lng", String(coords.lng));
        }

        const res = await fetch(`/api/open-status?${qs.toString()}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setStatus(data.status);
          setLocationMode(data.locationSource || "none");
          setNearest(
            data.nearestLocation
              ? { city: data.nearestLocation.city ?? null, distanceKm: data.nearestLocation.distanceKm }
              : null
          );
        }
      } catch {
        // Keep showing the last known status.
      }
    }

    refresh();
    const id = setInterval(refresh, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [brand.slug, coords]);

  useEffect(() => {
    function tick() {
      setLocalTime(
        new Date().toLocaleTimeString(locale === "en" ? "en-US" : locale, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [locale]);

  useEffect(() => {
    if (!("permissions" in navigator) || !("geolocation" in navigator)) return;

    void (navigator as Navigator & { permissions: Permissions }).permissions
      .query({ name: "geolocation" as PermissionName })
      .then((p) => {
        if (p.state === "granted" || p.state === "prompt") {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            () => {},
            { enableHighAccuracy: false, timeout: 3500 }
          );
        }
      })
      .catch(() => {});
  }, []);

  const isOpen = status.isOpen;
  const nearestLine = isOpen
    ? t(locale, "nearestOpen", { brand: brand.name })
    : t(locale, "nearestClosed", { brand: brand.name });

  async function handleShare() {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Is ${brand.name} open right now?`,
          text: `Check real-time ${brand.name} opening status.`,
          url: shareUrl,
        });
        trackShare(brand.name, "native_share");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        trackShare(brand.name, "clipboard");
      }
      setShareState("done");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {
      // Ignore cancellation and clipboard errors.
    }
  }

  return (
    <section
      className="ui-panel overflow-hidden"
      style={{
        borderColor: isOpen ? "rgba(24,242,142,0.2)" : "rgba(255,90,103,0.2)",
        boxShadow: isOpen
          ? "0 18px 46px rgba(0,0,0,0.45), 0 0 22px rgba(24,242,142,0.08)"
          : "0 18px 46px rgba(0,0,0,0.45)",
      }}
    >
      <div className="relative panel-body-lg">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isOpen
              ? "linear-gradient(140deg, rgba(24,242,142,0.06) 0%, transparent 60%)"
              : "linear-gradient(140deg, rgba(255,90,103,0.06) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-[1] flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5 md:gap-6 min-w-0">
            <div
              className="w-[68px] h-[68px] md:w-[74px] md:h-[74px] rounded-2xl border border-border2 bg-bg2 flex items-center justify-center shrink-0"
              style={{ fontSize: 34 }}
            >
              {brand.emoji || "Store"}
            </div>

            <div className="min-w-0">
              <h1
                className="font-heading font-extrabold text-text"
                style={{
                  fontSize: "clamp(30px, 4vw, 42px)",
                  letterSpacing: "-0.04em",
                  lineHeight: 0.95,
                }}
              >
                {brand.name}
              </h1>

              <div className="mt-2 text-[13px] text-muted2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{brand.category}</span>
                {brand.is24h && (
                  <>
                    <span style={{ color: "var(--color-border2)" }}>&middot;</span>
                    <span className="text-muted">24/7 locations available</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2.5 shrink-0">
            <span
              className={`brand-status-pill ${isOpen ? "brand-status-pill-open" : "brand-status-pill-closed"} text-[12px]`}
            >
              <span className="status-led" />
              {isOpen ? t(locale, "openNowLabel") : t(locale, "closedNowLabel")}
            </span>

            <div className="font-mono text-[13px] text-muted2 md:text-right">
              {isOpen && status.closesIn && (
                <>
                  {t(locale, "closesIn")} <strong className="text-text text-[15px]">{status.closesIn}</strong>
                </>
              )}
              {!isOpen && status.opensAt && (
                <>
                  {t(locale, "opensAt")} <strong className="text-text text-[15px]">{status.opensAt}</strong>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="relative z-[1] mt-6 flex flex-col gap-2">
          <p className="text-[13px] md:text-[14px] text-text font-semibold">{nearestLine}</p>
          <p className="text-[12px] text-muted">
            {locationMode === "gps"
              ? t(locale, "statusBasedOnLocation")
              : locationMode === "ip"
                ? t(locale, "statusBasedOnIp")
                : t(locale, "statusBasedOnTimezone")}
          </p>
          {nearest && (
            <p className="text-[12px] text-muted">
              {t(locale, "nearestBranch")}: {nearest.city || t(locale, "nearestUnknownCity")} ({nearest.distanceKm} km)
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 stats-grid-responsive border-t border-border bg-bg2">
        <StatCell label={t(locale, "todayHours")} value={status.todayHours || "--"} />
        <StatCell label={t(locale, "localTime")} value={localTime} />
        <StatCell
          label={t(locale, "holidayToday")}
          value={status.holidayName || "No"}
          color={status.holidayName ? "var(--color-orange)" : "var(--color-green)"}
        />
        <StatCell label={t(locale, "updated")} value="Verified" color="var(--color-green)" />
      </div>

      <div className="panel-body border-t border-border flex flex-wrap gap-3">
        <a
          href={brand.website || `/is-${brand.slug}-open`}
          target={brand.website ? "_blank" : undefined}
          rel={brand.website ? "noopener noreferrer" : undefined}
          onClick={() => trackCtaClick("official_website", brand.name)}
          className="no-underline rounded-xl px-6 py-3 text-sm font-semibold bg-green text-black hover:brightness-95 transition-[filter]"
        >
          {t(locale, "officialWebsite")}
        </a>

        <a
          href="#user-reports"
          className="no-underline rounded-xl px-5 py-3 text-sm font-medium border border-border2 bg-bg2 text-muted2 hover:text-text hover:border-border transition-colors"
        >
          {t(locale, "reportIssueCta")}
        </a>

        <button
          type="button"
          onClick={handleShare}
          className="rounded-xl px-5 py-3 text-sm font-medium border border-border2 bg-bg2 text-muted2 hover:text-text hover:border-border transition-colors"
        >
          {shareState === "done" ? t(locale, "linkCopied") : t(locale, "sharePage")}
        </button>
      </div>

      <div className="px-6 py-3 border-t border-border flex items-center gap-2 text-[11px] text-muted">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green" />
        <span>Data verified via official sources + community reports. Updated in real-time.</span>
      </div>
    </section>
  );
}

function StatCell({
  label,
  value,
  color,
  muted,
}: {
  label: string;
  value: string;
  color?: string;
  muted?: boolean;
}) {
  return (
    <div className="px-5 py-5.5 md:px-7 md:py-5.5 border-r border-border last:border-r-0">
      <div className="font-mono uppercase text-muted text-[10px] tracking-[0.12em] mb-1.5">{label}</div>
      <div
        className="font-heading font-extrabold tracking-[-0.02em]"
        style={{
          fontSize: muted ? 14 : 17,
          color: muted ? "var(--color-muted2)" : color || "var(--color-text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
