"use client";

import { useEffect } from "react";

export default function NotFoundTracker() {
  useEffect(() => {
    fetch("/api/log/not-found", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: window.location.pathname + window.location.search,
        referrer: document.referrer || null,
      }),
    }).catch(() => {});
  }, []);

  return null;
}
