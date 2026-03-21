"use client";

/**
 * AdminIdleTimer
 *
 * Tracks inactivity while the admin is logged in. After IDLE_WARN_AT ms of no
 * activity it shows a full-screen warning modal with a countdown timer. If the
 * admin clicks "Stay logged in" it POSTs to /api/admin/refresh-session and
 * resets the clock. If the countdown reaches zero (or they click "Log out
 * now") it redirects through the logout endpoint, which clears cookies.
 *
 * Activity events: mousemove, keydown, click, scroll, touchstart — throttled
 * to one acknowledgement per second so we don't hammer state on every pixel.
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ── Timing constants ──────────────────────────────────────────────────────────
const IDLE_LIMIT_MS = 30 * 60 * 1000;   // 30 min → auto-logout
const WARN_BEFORE_MS = 2 * 60 * 1000;   // show warning 2 min before logout
const WARN_AT_MS = IDLE_LIMIT_MS - WARN_BEFORE_MS; // 28 min idle → show modal

const ACTIVITY_EVENTS = [
  "mousemove", "keydown", "click", "scroll", "touchstart",
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCsrf(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)admin_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function formatCountdown(ms: number): string {
  const totalSecs = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(totalSecs / 60);
  const secs = String(totalSecs % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminIdleTimer() {
  const lastActivityRef  = useRef<number>(Date.now());
  const logoutCalledRef  = useRef(false);
  const refreshingRef    = useRef(false);

  const [warningVisible, setWarningVisible] = useState(false);
  const [msLeft, setMsLeft]                 = useState(WARN_BEFORE_MS);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const doLogout = useCallback((timed: boolean) => {
    if (logoutCalledRef.current) return;
    logoutCalledRef.current = true;
    const csrf    = getCsrf();
    const nextUrl = timed
      ? "/admin?loggedOut=1&timedOut=1"
      : "/admin?loggedOut=1";
    window.location.href =
      `/api/admin/logout?csrf=${encodeURIComponent(csrf)}&next=${encodeURIComponent(nextUrl)}`;
  }, []);

  // ── Session refresh ──────────────────────────────────────────────────────────
  const refreshSession = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const csrf = getCsrf();
      const res  = await fetch("/api/admin/refresh-session", {
        method:  "POST",
        headers: { "x-admin-csrf": csrf },
      });
      if (!res.ok) doLogout(true); // session already dead
    } catch {
      // network hiccup — don't force-logout
    } finally {
      refreshingRef.current = false;
    }
  }, [doLogout]);

  // ── "Stay logged in" handler ─────────────────────────────────────────────────
  const stayLoggedIn = useCallback(() => {
    lastActivityRef.current = Date.now();
    setWarningVisible(false);
    setMsLeft(WARN_BEFORE_MS);
    refreshSession();
  }, [refreshSession]);

  // ── Activity listeners ────────────────────────────────────────────────────────
  useEffect(() => {
    let throttle: ReturnType<typeof setTimeout> | null = null;

    function onActivity() {
      if (throttle) return;
      throttle = setTimeout(() => {
        throttle = null;
        lastActivityRef.current = Date.now();
      }, 1000);
    }

    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, onActivity, { passive: true });
    }
    return () => {
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, onActivity);
      }
      if (throttle) clearTimeout(throttle);
    };
  }, []);

  // ── Main interval — runs every second ────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current;

      if (idle >= IDLE_LIMIT_MS) {
        clearInterval(tick);
        doLogout(true);
        return;
      }

      if (idle >= WARN_AT_MS) {
        const remaining = IDLE_LIMIT_MS - idle;
        setMsLeft(remaining);
        setWarningVisible(true);
      } else {
        setWarningVisible(false);
        setMsLeft(WARN_BEFORE_MS);
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [doLogout]);

  // ── Warning modal ─────────────────────────────────────────────────────────────
  if (!warningVisible) return null;

  const countdown     = formatCountdown(msLeft);
  const isUrgent      = msLeft <= 30_000; // red in last 30 s
  const countdownColor = isUrgent ? "#f87171" : "#fbbf24";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Session expiring soon"
      style={{
        position:   "fixed",
        inset:      0,
        zIndex:     9999,
        display:    "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        style={{
          background:   "#1a2e1a",
          border:       "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding:      "36px 40px",
          maxWidth:     420,
          width:        "90%",
          textAlign:    "center",
          boxShadow:    "0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: 40, marginBottom: 14, lineHeight: 1 }}>⏰</div>

        <h2 style={{
          color:        "#fff",
          fontSize:     20,
          fontWeight:   700,
          margin:       "0 0 10px",
          letterSpacing: "-0.01em",
        }}>
          Session expiring soon
        </h2>

        <p style={{
          color:        "rgba(255,255,255,0.5)",
          fontSize:     14,
          lineHeight:   1.5,
          margin:       "0 0 24px",
        }}>
          You&apos;ve been inactive. You&apos;ll be logged out automatically in:
        </p>

        {/* Countdown */}
        <div style={{
          fontSize:         52,
          fontWeight:       800,
          color:            countdownColor,
          fontVariantNumeric: "tabular-nums",
          letterSpacing:    "-0.02em",
          margin:           "0 0 30px",
          transition:       "color 0.4s",
        }}>
          {countdown}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => doLogout(false)}
            style={{
              flex:       1,
              padding:    "11px 0",
              borderRadius: 8,
              border:     "1px solid rgba(255,255,255,0.15)",
              background: "transparent",
              color:      "rgba(255,255,255,0.55)",
              fontSize:   14,
              cursor:     "pointer",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.35)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)";
            }}
          >
            Log out now
          </button>

          <button
            onClick={stayLoggedIn}
            style={{
              flex:       2,
              padding:    "11px 0",
              borderRadius: 8,
              border:     "none",
              background: "#16a34a",
              color:      "#fff",
              fontSize:   14,
              fontWeight: 600,
              cursor:     "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#15803d";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#16a34a";
            }}
          >
            Stay logged in
          </button>
        </div>
      </div>
    </div>
  );
}
