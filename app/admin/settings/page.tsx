"use client";

import { useEffect, useRef, useState } from "react";
import AdminNav from "@/components/AdminNav";

type Status = { kind: "ok" | "err"; message: string } | null;

function getCsrf(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)admin_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Strength indicator
  const strength = (() => {
    if (newPassword.length === 0) return null;
    let score = 0;
    if (newPassword.length >= 10) score++;
    if (newPassword.length >= 16) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    if (score <= 1) return { label: "Weak", color: "#ef4444" };
    if (score <= 3) return { label: "Fair", color: "#f59e0b" };
    return { label: "Strong", color: "#22c55e" };
  })();

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-csrf": getCsrf(),
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        setStatus({ kind: "err", message: data?.error || "Something went wrong." });
      } else {
        setStatus({ kind: "ok", message: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        formRef.current?.reset();
      }
    } catch {
      setStatus({ kind: "err", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-colors focus:ring-2 focus:ring-[var(--brand-green)]/40 pr-10";
  const inputStyle = { background: "#0f1f0f", border: "1px solid rgba(255,255,255,0.12)" };

  function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
        tabIndex={-1}
      >
        {show ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      <AdminNav />

      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-white/50 text-sm mb-8">Manage your admin account.</p>

        {/* Change Password Card */}
        <div className="rounded-xl p-6" style={{ background: "#1a2e1a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 className="text-lg font-semibold text-white mb-5">Change Password</h2>

          {status && (
            <div
              className="mb-5 rounded-lg px-4 py-3 text-sm font-medium"
              style={{
                background: status.kind === "ok" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                border: `1px solid ${status.kind === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: status.kind === "ok" ? "#86efac" : "#fca5a5",
              }}
            >
              {status.message}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputBase}
                  style={inputStyle}
                  autoComplete="current-password"
                  required
                />
                <EyeToggle show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} />
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputBase}
                  style={inputStyle}
                  autoComplete="new-password"
                  minLength={10}
                  required
                />
                <EyeToggle show={showNew} onToggle={() => setShowNew((v) => !v)} />
              </div>
              {/* Strength indicator */}
              {strength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1">
                    {["Weak", "Fair", "Strong"].map((level, i) => {
                      const levels = ["Weak", "Fair", "Strong"];
                      const currentIndex = levels.indexOf(strength.label);
                      return (
                        <div
                          key={level}
                          className="h-1 w-10 rounded-full transition-colors"
                          style={{ background: i <= currentIndex ? strength.color : "rgba(255,255,255,0.1)" }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
              <p className="mt-1.5 text-xs text-white/30">Minimum 10 characters. Use uppercase, numbers, and symbols for a stronger password.</p>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputBase}
                  style={{
                    ...inputStyle,
                    borderColor: passwordsMismatch
                      ? "rgba(239,68,68,0.5)"
                      : passwordsMatch
                      ? "rgba(34,197,94,0.5)"
                      : "rgba(255,255,255,0.12)",
                  }}
                  autoComplete="new-password"
                  required
                />
                <EyeToggle show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
              </div>
              {passwordsMismatch && <p className="mt-1 text-xs text-red-400">Passwords do not match.</p>}
              {passwordsMatch && <p className="mt-1 text-xs text-green-400">Passwords match.</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !!passwordsMismatch}
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: "var(--brand-green)" }}
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        </div>

        {/* Info card */}
        <div className="mt-4 rounded-xl px-5 py-4 text-sm text-white/40" style={{ background: "#1a2e1a", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="font-medium text-white/60 mb-1">🔒 Password stored securely</p>
          <p>Your new password is hashed with bcrypt and stored in the database. If you ever get locked out, use the emergency reset script: <code className="text-white/60">node scripts/reset-password.mjs</code></p>
        </div>
      </div>
    </div>
  );
}
