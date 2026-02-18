"use client";

import * as React from "react";

type Props = {
  next: string;
  loggedOut?: boolean;
};

export default function AdminLoginClient({ next, loggedOut }: Props) {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch(`/api/admin/login?next=${encodeURIComponent(next)}`, {
        method: "POST",
        body: fd,
      });

      if (res.redirected) {
        window.location.href = res.url;
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Login failed.");
        setSubmitting(false);
        return;
      }

      window.location.href = next || "/admin/leads";
    } catch (err: any) {
      setError(err?.message || "Login failed.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>

      {loggedOut ? (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          You’ve been logged out.
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <p className="mt-3 text-sm text-neutral-600">
        Enter your admin password to view leads.
      </p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full rounded-lg px-4 py-2 text-white ${
            submitting ? "bg-neutral-400" : "bg-black hover:bg-neutral-800"
          }`}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
