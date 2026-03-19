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

export default function SiteAnalytics() {
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    const startTime = Date.now();
    const utm = getUtmParams();

    // Log page view on mount
    fetch("/api/log/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: window.location.pathname,
        referrer: document.referrer,
        sessionId,
        ...utm,
      }),
    }).catch(() => {});

    // Log duration on unmount
    return () => {
      const duration = Date.now() - startTime;
      fetch("/api/log/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: window.location.pathname,
          referrer: document.referrer,
          sessionId,
          duration,
        }),
      }).catch(() => {});
    };
  }, []);

  return null;
}
