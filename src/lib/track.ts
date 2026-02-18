/**
 * Lightweight tracking for monetization.
 * Sends events to GA4 (if loaded) and to an internal endpoint for dashboarding.
 */

type Primitive = string | number | boolean;
type EventParams = Record<string, Primitive>;
type GtagFn = (command: string, action: string, params?: EventParams) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

const INTERNAL_TRACK_PATH = "/api/event";

function sendInternalEvent(eventName: string, params: EventParams) {
  if (typeof window === "undefined") return;

  const payload = {
    eventName,
    params,
    path: window.location.pathname,
    referrer: document.referrer || null,
    ts: Date.now(),
  };

  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(INTERNAL_TRACK_PATH, blob);
      return;
    }

    void fetch(INTERNAL_TRACK_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Keep tracking non-blocking.
  }
}

function fire(eventName: string, params: EventParams) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
  sendInternalEvent(eventName, params);
}

/** User clicks an affiliate link (Uber Eats, Amazon, etc.) */
export function trackAffiliateClick(provider: string, brandName: string, isOpen: boolean) {
  fire("affiliate_click", {
    affiliate_provider: provider,
    brand_name: brandName,
    brand_is_open: isOpen,
    content_type: "affiliate",
  });
}

/** User clicks the main CTA (official website link) */
export function trackCtaClick(ctaType: string, brandName: string) {
  fire("cta_click", {
    cta_type: ctaType,
    brand_name: brandName,
  });
}

/** User shares a page */
export function trackShare(brandName: string, method: string) {
  fire("share", {
    method,
    content_type: "brand_page",
    brand_name: brandName,
  });
}

/** User submits a report */
export function trackReport(brandSlug: string, reportType: string) {
  fire("user_report", {
    brand_slug: brandSlug,
    report_type: reportType,
  });
}

/** Track page template type for RPM analysis */
export function trackPageView(templateType: string, brandSlug?: string) {
  fire("page_template_view", {
    template_type: templateType,
    ...(brandSlug ? { brand_slug: brandSlug } : {}),
  });
}

/** Track when a display ad slot is actually viewable. */
export function trackAdSlotView(slot: string, label: string) {
  fire("ad_slot_view", {
    ad_slot: slot,
    ad_label: label,
    content_type: "display_ad",
  });
}
