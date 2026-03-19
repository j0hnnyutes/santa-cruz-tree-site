"use client";

/**
 * AdminShared — reusable primitives shared across admin pages.
 *
 * Components exported:
 *   StatCard       — numbered KPI card with optional trend indicator
 *   AdminCard      — dark card wrapper with consistent border/bg
 *   SectionHeader  — card title + optional subtitle
 *   TimePresets    — "Last 24h / 7d / 30d / 90d" toggle group
 *   Skeleton       — loading placeholder bar
 */

import { ReactNode } from "react";

/* ─── Types ────────────────────────────────────────────────────────────── */

export type TrendDir = "up" | "down" | "flat";

export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;               // small line below value
  trend?: number;             // % change vs prev period (positive = up)
  trendGoodWhenUp?: boolean;  // false = red when going up (e.g. bounce rate)
  color?: string;             // label color override
  icon?: ReactNode;
}

export interface TimePreset {
  label: string;
  days: number;
}

export const DEFAULT_TIME_PRESETS: TimePreset[] = [
  { label: "24h",  days: 1  },
  { label: "7d",   days: 7  },
  { label: "30d",  days: 30 },
  { label: "90d",  days: 90 },
];

/* ─── StatCard ─────────────────────────────────────────────────────────── */

export function StatCard({
  label, value, sub, trend, trendGoodWhenUp = true, color = "#9ca3af", icon,
}: StatCardProps) {
  let trendEl: ReactNode = null;
  if (trend !== undefined && trend !== null) {
    const dir: TrendDir = trend > 0 ? "up" : trend < 0 ? "down" : "flat";
    const isGood = trendGoodWhenUp ? dir === "up" : dir === "down";
    const trendColor = dir === "flat" ? "#6b7280" : isGood ? "#22c55e" : "#ef4444";
    const arrow = dir === "up" ? "↑" : dir === "down" ? "↓" : "→";
    trendEl = (
      <span className="text-xs font-semibold ml-1.5" style={{ color: trendColor }}>
        {arrow} {Math.abs(trend)}%
      </span>
    );
  }

  return (
    <div
      className="rounded-xl border border-gray-700/60 px-5 py-4 flex flex-col gap-1"
      style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
    >
      <div className="flex items-start justify-between">
        <div className="text-2xl font-bold text-white leading-none">
          {value}
          {trendEl}
        </div>
        {icon && <span className="text-gray-500 text-lg">{icon}</span>}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      <div className="text-xs font-semibold mt-1" style={{ color }}>{label}</div>
    </div>
  );
}

/* ─── AdminCard ────────────────────────────────────────────────────────── */

export function AdminCard({
  children,
  className = "",
  noPad = false,
}: {
  children: ReactNode;
  className?: string;
  noPad?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-700/60 ${noPad ? "" : "p-5"} ${className}`}
      style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
    >
      {children}
    </div>
  );
}

/* ─── SectionHeader ────────────────────────────────────────────────────── */

export function SectionHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">{title}</h2>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}

/* ─── TimePresets ──────────────────────────────────────────────────────── */

export function TimePresets({
  presets = DEFAULT_TIME_PRESETS,
  value,
  onChange,
  disabled = false,
}: {
  presets?: TimePreset[];
  value: number;
  onChange: (days: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {presets.map((p) => (
        <button
          key={p.days}
          onClick={() => onChange(p.days)}
          disabled={disabled}
          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap disabled:opacity-40 ${
            value === p.days
              ? "border-green-600 bg-green-900/30 text-green-400"
              : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────────────────── */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded animate-pulse bg-gray-800/60 ${className}`}
    />
  );
}

/* ─── LoadingOverlay ───────────────────────────────────────────────────── */

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-green-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */

export function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
