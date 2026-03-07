"use client";

import { useEffect } from "react";

/**
 * app/error.tsx — Next.js App Router route-segment error boundary.
 * Catches errors thrown during rendering of any page or layout below the
 * root layout. Logs the error to the database and shows a recovery UI.
 */
export default function Error({
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
        severity: "error",
        type: "client_js",
        message: error.message || "Route-level render error",
        stack: error.stack,
        path: typeof window !== "undefined" ? window.location.pathname : "",
        metadata: {
          source: "app/error.tsx",
          digest: error.digest ?? null,
        },
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div
        className="w-full max-w-md rounded-xl bg-white p-8"
        style={{
          border: "1px solid var(--border)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h2 className="mb-2 text-center text-xl font-semibold text-[var(--text)]">
          Something went wrong
        </h2>

        <p className="mb-6 text-center text-sm text-[var(--muted)]">
          An unexpected error occurred. You can try again — if the problem
          persists, please{" "}
          <a
            href="/contact"
            className="font-medium underline"
            style={{ color: "var(--brand-accent)" }}
          >
            contact us
          </a>
          .
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "var(--brand-green)" }}
          >
            Try again
          </button>
          <a
            href="/"
            className="block w-full rounded-lg border py-2.5 text-center text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
