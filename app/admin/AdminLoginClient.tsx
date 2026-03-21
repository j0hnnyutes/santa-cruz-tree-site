"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Props = {
  next: string;
  loggedOut?: boolean;
  timedOut?: boolean;
};

export default function AdminLoginClient({ next, loggedOut, timedOut }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function initialMessage() {
    if (timedOut)   return "Your session expired due to inactivity. Please sign in again.";
    if (loggedOut)  return "You've been logged out.";
    return null;
  }

  const [error, setError] = useState<string | null>(initialMessage);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: password.trim(), next }),
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
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-[var(--brand-green)] px-12 py-10">
        <div className="flex items-center gap-3">
          <Image
            src="/sctreepros-logo.svg"
            alt="Santa Cruz Tree Pros"
            width={160}
            height={44}
            className="brightness-0 invert"
          />
        </div>

        <div className="mb-[125px]">
          <blockquote className="text-white/90 text-2xl font-medium leading-snug">
            "Professional tree care rooted in the Santa Cruz community."
          </blockquote>
          <p className="mt-4 text-white/50 text-sm">Admin portal — authorized access only</p>
        </div>

        <div className="text-white/30 text-xs">
          &copy; {new Date().getFullYear()} Santa Cruz Tree Pros
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center bg-[var(--bg-soft)] px-6 py-12">
        <div className="w-full max-w-sm mb-[100px]">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--brand-green)] text-white text-xl font-bold tracking-tight shadow-lg">
              SC
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Welcome back</h1>
            <p className="mt-1.5 text-[var(--muted)]">Sign in to access your leads dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[var(--border)] bg-white px-3 pr-10 text-base outline-none transition-colors focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent)]/20"
                  autoComplete="current-password"
                  autoFocus
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                      <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-start gap-2.5 rounded-lg px-4 py-3"
                style={
                  timedOut && error === initialMessage()
                    ? { background: "#fefce8", border: "1px solid #fde68a" }
                    : { background: "#fef2f2", border: "1px solid #fecaca" }
                }
              >
                {timedOut && error === initialMessage() ? (
                  <svg className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 shrink-0 mt-0.5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                )}
                <p
                  className="text-sm font-medium"
                  style={{ color: timedOut && error === initialMessage() ? "#92400e" : "#b91c1c" }}
                >
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[var(--brand-green)] text-white font-semibold hover:bg-[var(--brand-green-dark)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : "Sign In"}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
