"use client";

import { useEffect } from "react";

/**
 * GlobalErrorTracker
 * Catches unhandled JS errors and unhandled promise rejections that occur
 * outside the React component tree (e.g. setTimeout callbacks, third-party
 * scripts, fetch().then chains) and reports them to the server error log.
 *
 * React component crashes are handled separately by ErrorBoundary
 * (componentDidCatch) and app/error.tsx.
 */
export default function GlobalErrorTracker() {
  useEffect(() => {
    function send(data: object): void {
      fetch("/api/log/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).catch(() => {});
    }

    function handleError(event: ErrorEvent): void {
      // Skip errors that React already caught via ErrorBoundary
      const message = event.message || "Unhandled JS error";
      if (message === "ResizeObserver loop limit exceeded") return; // benign browser noise
      if (message.startsWith("Script error")) return; // cross-origin noise, no useful info

      send({
        severity: "error",
        type: "client_js",
        message,
        stack:
          event.error?.stack ||
          `${event.filename}:${event.lineno}:${event.colno}`,
        path: window.location.pathname,
        metadata: {
          source: "window.onerror",
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent): void {
      const reason = event.reason;
      const isError = reason instanceof Error;
      const message = isError
        ? reason.message
        : String(reason ?? "Unhandled promise rejection");
      const stack = isError ? reason.stack : undefined;

      send({
        severity: "error",
        type: "client_js",
        message,
        stack,
        path: window.location.pathname,
        metadata: {
          source: "unhandledrejection",
          reasonType: isError ? "Error" : typeof reason,
        },
      });
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
