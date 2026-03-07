"use client";

import { useEffect } from "react";

/**
 * app/global-error.tsx — Next.js root layout error boundary.
 * Only activates when the root layout itself throws (very rare).
 * Must render its own <html>/<body> since the root layout is gone.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    fetch("/api/log/error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        severity: "critical",
        type: "client_js",
        message: error.message || "Root layout error",
        stack: error.stack,
        path: typeof window !== "undefined" ? window.location.pathname : "",
        metadata: {
          source: "app/global-error.tsx",
          digest: error.digest ?? null,
        },
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
          fontFamily: "system-ui, sans-serif",
          padding: "1rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: "#fff",
            borderRadius: 12,
            padding: "2rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
            }}
          >
            <svg width="24" height="24" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 style={{ textAlign: "center", fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem", color: "#111" }}>
            Something went wrong
          </h2>

          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.5rem" }}>
            The page failed to load. Please try again or return home.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              onClick={() => reset()}
              style={{
                width: "100%",
                padding: "0.625rem",
                borderRadius: 8,
                background: "#1b5e35",
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.875rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                display: "block",
                textAlign: "center",
                width: "100%",
                padding: "0.625rem",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                color: "#374151",
                fontWeight: 500,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
