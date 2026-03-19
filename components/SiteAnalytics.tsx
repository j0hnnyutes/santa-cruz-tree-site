"use client";

import { useEffect } from "react";

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

function getUtmParams(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
  try {
    const p = new URLSearchParams(window.location.search);
    const src  = p.get("utm_source")   ?? undefined;
    const med  = p.get("utm_medium")   ?? undefined;
    const camp = p.get("utm_campaign") ?? undefined;
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
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    const startTime = Date.now();
    const utm = getUtmParams();
    let logged = false;
    let timerId: ReturnType<typeof setTimeout>;

    function doLog() {
      if (logged) return;
      // Only count the visit if the page is actually visible — filters out
      // prefetched pages the user never looked at, and most headless tools
      // that don't implement the Visibility API.
      if (document.visibilityState !== "visible") return;
      logged = true;
      logPageview({
        path: window.location.pathname,
        referrer: document.referrer,
        sessionId,
        ...utm,
      });
    }

    // Primary trigger: 1.5 s after mount, if page is visible.
    // Real users are still on the page; bounces and prefetch hits are gone.
    timerId = setTimeout(doLog, 1500);

    // Fallback: if the tab was in the background on load (e.g. opened via
    // middle-click) log as soon as it becomes visible.
    function onVisible() {
      if (document.visibilityState === "visible") doLog();
    }
    document.addEventListener("visibilitychange", onVisible);

    // Log duration on unmount (only if the initial view was recorded)
    return () => {
      clearTimeout(timerId);
      document.removeEventListener("visibilitychange", onVisible);
      if (logged) {
        const duration = Date.now() - startTime;
        logPageview({
          path: window.location.pathname,
          referrer: document.referrer,
          sessionId,
          duration,
        });
      }
    };
  }, []);

  return null;
}
