"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Re-fire a GA4 page_view event on SPA navigations.
 * The initial pageview is already fired by the gtag('config', ...) call in
 * layout.tsx, so we skip the first render and only fire on subsequent
 * route changes.  Silently no-ops when GA4 is not loaded (no GA_ID set).
 */
function fireGa4PageView(path: string) {
  try {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "page_view", {
        page_path:  path,
        page_title: document.title,
      });
    }
  } catch {
    // gtag unavailable — safe to ignore
  }
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getOrCreateSessionId(): string {
  try {
    let sessionId = sessionStorage.getItem("__site_session_id");
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem("__site_session_id", sessionId);
    }
    return sessionId;
  } catch {
    return "";
  }
}

// Computed once per page-load (module scope) so all pageviews in a session
// report the same value. localStorage persists across sessions; sessionStorage
// does not — so we use localStorage for the "has visited before" flag and
// sessionStorage to remember the resolved value for this session.
function resolveIsNewVisitor(): boolean {
  try {
    // Fast path: already resolved for this session
    const cached = sessionStorage.getItem("__site_is_new");
    if (cached !== null) return cached === "1";

    const visited = !!localStorage.getItem("__site_visited");
    if (!visited) {
      localStorage.setItem("__site_visited", "1");
    }
    const isNew = !visited;
    sessionStorage.setItem("__site_is_new", isNew ? "1" : "0");
    return isNew;
  } catch {
    return false;
  }
}

function getUtmParams(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
  try {
    const p = new URLSearchParams(window.location.search);
    const src  = p.get("utm_source")   ?? undefined;
    const med  = p.get("utm_medium")   ?? undefined;
    const camp = p.get("utm_campaign") ?? undefined;

    // Persist UTM params in sessionStorage so the contact form can read them
    // even if the user navigates to another page before submitting.
    // Only overwrite if new UTM params are present in the current URL.
    if (src || med || camp) {
      const stored = { utmSource: src, utmMedium: med, utmCampaign: camp };
      sessionStorage.setItem("__utm", JSON.stringify(stored));
    }

    // Fall back to previously stored UTMs if none in current URL
    if (!src && !med && !camp) {
      const raw = sessionStorage.getItem("__utm");
      if (raw) return JSON.parse(raw);
    }

    return { utmSource: src, utmMedium: med, utmCampaign: camp };
  } catch {
    return {};
  }
}

function logPageview(payload: Record<string, unknown>) {
  fetch("/api/log/pageview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export default function SiteAnalytics() {
  // usePathname changes on every SPA navigation in Next.js App Router.
  // Using it as a dependency means this effect re-runs on each route change,
  // which correctly tracks multi-page sessions and inherits UTM params.
  const pathname = usePathname();

  // Track first render so we don't double-fire GA4 on initial page load
  // (layout.tsx already calls gtag('config', ...) which fires the first view).
  const isFirstRender = useRef(true);

  useEffect(() => {
    // GA4 SPA re-fire — skip initial mount, fire on every subsequent navigation.
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      fireGa4PageView(window.location.pathname);
    }

    const sessionId    = getOrCreateSessionId();
    const isNewVisitor = resolveIsNewVisitor();
    const startTime    = Date.now();
    // Read UTMs on every page — getUtmParams falls back to sessionStorage so
    // params captured on the landing URL are inherited by subsequent pages.
    const utm = getUtmParams();
    // Snapshot the path and referrer at effect-run time so they always reflect
    // the current route, not a stale closure value from a previous navigation.
    const currentPath     = window.location.pathname;
    const currentReferrer = document.referrer;

    let logged = false;
    let durationSent = false;
    let timerId: ReturnType<typeof setTimeout>;

    // ── Scroll depth tracking ────────────────────────────────────────────
    // Track the maximum scroll percentage reached on this page (0–100).
    // Resets to 0 on every route change (new useEffect run).
    let maxScrollPct = 0;

    function measureScroll() {
      const scrolled = window.scrollY + window.innerHeight;
      const total    = document.documentElement.scrollHeight;
      if (total <= 0) return;
      const pct = Math.min(100, Math.round((scrolled / total) * 100));
      if (pct > maxScrollPct) maxScrollPct = pct;
    }

    // Passive listener — no layout thrashing, no forced reflows.
    window.addEventListener("scroll", measureScroll, { passive: true });
    // Capture the initial position immediately (catches "100%" for short pages).
    measureScroll();
    // ────────────────────────────────────────────────────────────────────

    function doLog() {
      if (logged) return;
      // Only count the visit if the page is actually visible — filters out
      // prefetched pages the user never looked at, and most headless tools
      // that don't implement the Visibility API.
      if (document.visibilityState !== "visible") return;
      logged = true;
      logPageview({
        path: currentPath,
        referrer: currentReferrer,
        sessionId,
        isNewVisitor,
        ...utm,
      });
    }

    function sendDuration() {
      if (!logged || durationSent) return;
      durationSent = true;
      logPageview({
        path: currentPath,
        referrer: currentReferrer,
        sessionId,
        duration: Date.now() - startTime,
        scrollDepth: maxScrollPct,
      });
    }

    // Primary trigger: 1.5 s after route change, if page is visible.
    // Real users are still on the page; bounces and prefetch hits are gone.
    timerId = setTimeout(doLog, 1500);

    // Handles both:
    //  - tab becoming visible (middle-click open in background → log initial view)
    //  - tab becoming hidden (close, switch, or external navigation → send duration)
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        doLog();
      } else {
        // Page is hidden — fire duration now because cleanup may never run
        // (tab close, cmd+L to new URL, switch to another app, etc.)
        sendDuration();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Cleanup runs on every SPA navigation (pathname change) and on unmount.
    // sendDuration fires here to capture time on page before route changes.
    // The durationSent flag prevents double-sending if visibilitychange
    // already fired (e.g. user switched tabs then navigated in-app).
    return () => {
      clearTimeout(timerId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("scroll", measureScroll);
      sendDuration();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
