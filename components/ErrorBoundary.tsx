"use client";

import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to server
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const stack = error.stack || errorInfo.componentStack;

    fetch("/api/log/error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack,
        path,
        severity: "high",
        type: "client_js",
      }),
    }).catch(() => {});
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[var(--bg-soft)] px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg border border-[var(--border)]">
            <div className="mb-6 flex justify-center">
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
              Oops! Something went wrong
            </h2>

            <p className="mb-6 text-center text-sm text-[var(--muted)]">
              We encountered an unexpected error. Please try reloading the page, or
              contact us if the problem persists.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 rounded bg-red-50 border border-red-200 p-3">
                <p className="text-xs font-mono text-red-700">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full rounded-lg bg-[var(--brand-green)] px-4 py-2 font-semibold text-white hover:bg-[var(--brand-green-dark)] transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
