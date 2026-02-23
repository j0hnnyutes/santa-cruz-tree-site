"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  next: string;
  loggedOut?: boolean;
};

export default function AdminLoginClient({ next, loggedOut }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    loggedOut ? "You’ve been logged out." : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          password: password.trim(),
          next,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setError(data?.error || "Invalid password.");
        setLoading(false);
        return;
      }

      router.replace(data.next || "/admin/leads");
      router.refresh();
    } catch {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="site-container py-14">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm max-w-md mx-auto">
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <p className="mt-2 text-[var(--muted)]">
          Enter the admin password to access leads.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 border border-[var(--border)] bg-white px-4 text-base outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[var(--brand-green)] text-white font-semibold hover:bg-[var(--brand-accent)] transition"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="text-xs text-[var(--muted)]">
            Tip: if you just changed <code>.env.local</code>, restart npm run dev.
          </p>
        </form>
      </div>
    </main>
  );
}