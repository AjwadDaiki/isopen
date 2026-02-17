"use client";

import { useEffect, useState } from "react";
import type { OpenStatus, BrandData } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n/translations";

interface Props {
  brand: BrandData;
  initialStatus: OpenStatus;
  locale?: Locale;
}

export default function StatusHero({ brand, initialStatus, locale = "en" }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [localTime, setLocalTime] = useState(initialStatus.localTime);
  const [shareState, setShareState] = useState<"idle" | "done">("idle");
  const [geoPrecise, setGeoPrecise] = useState(false);
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
              setGeoPrecise(true);
              setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            () => setGeoPrecise(false),
            { enableHighAccuracy: false, timeout: 3500 }
          );
        }
      })
      .catch(() => {
        // Ignore permission API failures.
      });
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
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }

      setShareState("done");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {
      // User canceled
    }
  }

  return (
    <section
      className="ui-panel overflow-hidden"
      style={{
        borderColor: isOpen ? "rgba(0,232,122,0.25)" : "rgba(255,71,87,0.22)",
        boxShadow: isOpen ? "0 0 56px rgba(0,232,122,0.08)" : "0 14px 40px rgba(0,0,0,0.28)",
      }}
    >
      <div className="relative px-5 py-6 md:px-7 md:py-8 bg-bg1">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isOpen
              ? "linear-gradient(130deg, rgba(0,232,122,0.08) 0%, transparent 62%)"
              : "linear-gradient(130deg, rgba(255,71,87,0.08) 0%, transparent 62%)",
          }}
        />

        <div className="relative z-[1] flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4 md:gap-5 min-w-0">
            <div className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl border border-border2 bg-bg2 flex items-center justify-center text-3xl md:text-4xl shrink-0">
              {brand.emoji || "Store"}
            </div>

            <div className="min-w-0">
              <h1 className="font-heading font-extrabold text-text text-[30px] leading-[1.02] tracking-[-0.04em] md:text-[38px]">
                {brand.name}
              </h1>
              <div className="mt-2 text-sm text-muted2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{brand.category}</span>
                {brand.is24h && (
                  <>
                    <span className="text-border2">|</span>
                    <span className="text-muted">24/7 locations available</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div
              className="font-heading font-extrabold inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[18px] tracking-[0.03em]"
              style={{
                background: isOpen ? "rgba(0,232,122,0.12)" : "rgba(255,71,87,0.1)",
                border: `2px solid ${isOpen ? "rgba(0,232,122,0.35)" : "rgba(255,71,87,0.3)"}`,
                color: isOpen ? "var(--color-green)" : "var(--color-red)",
              }}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOpen ? "bg-green animate-pulse-dot" : "bg-red"}`}
                style={isOpen ? { boxShadow: "0 0 12px var(--color-green-glow)" } : undefined}
              />
              {isOpen ? t(locale, "openNowLabel") : t(locale, "closedNowLabel")}
            </div>

            <div className="font-mono text-sm text-muted2 md:text-right">
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

        <p className="relative z-[1] mt-4 text-sm md:text-[15px] text-text font-semibold">
          {nearestLine}
        </p>
        <p className="relative z-[1] mt-1.5 text-[12px] text-muted2">
          {geoPrecise ? t(locale, "statusBasedOnLocation") : t(locale, "statusBasedOnTimezone")}
        </p>
        {nearest && (
          <p className="relative z-[1] mt-1 text-[12px] text-muted2">
            {t(locale, "nearestBranch")}: {nearest.city || t(locale, "nearestUnknownCity")} ({nearest.distanceKm} km)
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-border bg-bg2">
        <StatCell label={t(locale, "todayHours")} value={status.todayHours || "--"} />
        <StatCell label={t(locale, "localTime")} value={localTime} />
        <StatCell
          label={t(locale, "holidayToday")}
          value={status.holidayName || "No"}
          color={status.holidayName ? "var(--color-orange)" : "var(--color-green)"}
        />
        <StatCell label={t(locale, "updated")} value={t(locale, "live")} muted />
      </div>

      <div className="px-5 py-4 md:px-7 md:py-5 bg-bg1 border-t border-border flex flex-wrap gap-2.5">
        <a
          href={brand.website || `/is-${brand.slug}-open`}
          target={brand.website ? "_blank" : undefined}
          rel={brand.website ? "noopener noreferrer" : undefined}
          className="no-underline rounded-lg px-4 py-2.5 text-sm font-semibold bg-green text-black hover:opacity-90 transition-opacity"
        >
          {t(locale, "officialWebsite")}
        </a>

        <a
          href="#user-reports"
          className="no-underline rounded-lg px-4 py-2.5 text-sm font-medium border border-border2 bg-bg2 text-muted2 hover:text-text hover:border-border transition-colors"
        >
          {t(locale, "reportIssueCta")}
        </a>

        <button
          type="button"
          onClick={handleShare}
          className="rounded-lg px-4 py-2.5 text-sm font-medium border border-border2 bg-bg2 text-muted2 hover:text-text hover:border-border transition-colors"
        >
          {shareState === "done" ? t(locale, "linkCopied") : t(locale, "sharePage")}
        </button>
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
    <div className="px-4 py-4 md:px-6 md:py-[18px] border-r border-border last:border-r-0">
      <div className="font-mono uppercase text-muted text-[10px] tracking-[0.12em] mb-1">{label}</div>
      <div
        className="font-heading font-bold tracking-[-0.02em]"
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
