"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

type ErrorLogRow = {
  id: number;
  createdAt: string;
  severity: string;
  type: string;
  message: string;
  stack: string | null;
  path: string | null;
  ip: string | null;
  userAgent: string | null;
  metadata: string | null;
};

interface Props {
  initialErrors: ErrorLogRow[];
  initialTotal: number;
}

/* ─── Constants ───────────────────────────────────────────────────────── */

const SEVERITY_OPTIONS = [
  { value: "critical", label: "Critical", color: "#ef4444" },
  { value: "high",     label: "High",     color: "#f97316" },
  { value: "medium",   label: "Medium",   color: "#eab308" },
  { value: "low",      label: "Low",      color: "#6b7280" },
];

const TYPE_OPTIONS = [
  { value: "client_js",       label: "Client JS" },
  { value: "server_api",      label: "Server API" },
  { value: "captcha",         label: "Captcha" },
  { value: "email_delivery",  label: "Email Delivery" },
  { value: "client_error",    label: "Client Error" },
  { value: "rate_limit",      label: "Rate Limit" },
  { value: "auth",            label: "Auth" },
  { value: "form_validation", label: "Form Validation" },
];

// Time preset options — value is how many hours back (0 = all time)
const TIME_PRESETS = [
  { label: "Any time", hours: 0 },
  { label: "Last 24h", hours: 24 },
  { label: "Last 7d",  hours: 24 * 7 },
  { label: "Last 30d", hours: 24 * 30 },
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function severityStyle(severity: string) {
  switch (severity) {
    case "critical":
      return { badge: "bg-red-900/60 text-red-200 border border-red-700/50",      dot: "#ef4444" };
    case "high":
      return { badge: "bg-orange-900/50 text-orange-300 border border-orange-700/40", dot: "#f97316" };
    case "medium":
      return { badge: "bg-yellow-900/40 text-yellow-300 border border-yellow-700/40", dot: "#eab308" };
    default: // low
      return { badge: "bg-gray-800/60 text-gray-400 border border-gray-700/40",    dot: "#6b7280" };
  }
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="rounded-xl border border-gray-700/60 px-5 py-4"
      style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
    >
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs mt-1 font-medium" style={{ color }}>{label}</div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */

const PAGE_SIZE = 25;

export default function AdminErrorsClient({ initialErrors, initialTotal }: Props) {
  const [errors, setErrors] = useState<ErrorLogRow[]>(initialErrors);
  const [total, setTotal] = useState(initialTotal);

  // Filters
  const [severity, setSeverity] = useState("");
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [timePreset, setTimePreset] = useState(0); // hours; 0 = any time

  // UI state
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  /* ── Compute from/to from preset ── */
  const { fromDate, toDate } = useMemo(() => {
    if (timePreset === 0) return { fromDate: "", toDate: "" };
    const from = new Date(Date.now() - timePreset * 60 * 60 * 1000);
    return {
      fromDate: from.toISOString(),
      toDate: "",
    };
  }, [timePreset]);

  /* ── Fetch ── */
  const fetchErrors = useCallback(async () => {
    const params = new URLSearchParams({ limit: "500" });
    if (severity) params.set("severity", severity);
    if (type)     params.set("type", type);
    if (search)   params.set("search", search);
    if (fromDate) params.set("from_date", fromDate);
    if (toDate)   params.set("to_date", toDate);
    try {
      const res = await fetch(`/api/admin/errors?${params.toString()}`);
      const data = await res.json();
      if (data.ok && data.errors) {
        setErrors(data.errors);
        setTotal(data.total ?? data.errors.length);
        setLastRefreshed(new Date());
      }
    } catch {
      // ignore
    }
  }, [severity, type, search, fromDate, toDate]);

  /* Auto-refresh 30s */
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchErrors, 30_000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchErrors]);

  /* Re-fetch on filter change */
  useEffect(() => {
    fetchErrors();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severity, type, search, fromDate, toDate]);

  const paginatedErrors = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return errors.slice(start, start + PAGE_SIZE);
  }, [errors, page]);

  const totalPages = Math.max(1, Math.ceil(errors.length / PAGE_SIZE));

  /* Stats — from live errors array so they update with filters */
  const stats = useMemo(() => ({
    critical: errors.filter((e) => e.severity === "critical").length,
    high:     errors.filter((e) => e.severity === "high").length,
    medium:   errors.filter((e) => e.severity === "medium").length,
    low:      errors.filter((e) => e.severity === "low").length,
  }), [errors]);

  const hasActiveFilters = severity || type || search || timePreset !== 0;

  /* Delete single */
  async function deleteError(id: number) {
    setDeletingId(id);
    try {
      await fetch(`/api/admin/errors?id=${id}`, { method: "DELETE" });
      setErrors((prev) => prev.filter((e) => e.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      if (expandedId === id) setExpandedId(null);
    } finally {
      setDeletingId(null);
    }
  }

  /* Clear visible (respects active filters) */
  async function clearAll() {
    setClearing(true);
    try {
      const params = new URLSearchParams();
      if (severity) params.set("severity", severity);
      if (type)     params.set("type", type);
      if (fromDate) params.set("from_date", fromDate);
      if (toDate)   params.set("to_date", toDate);
      await fetch(`/api/admin/errors/clear?${params.toString()}`, { method: "DELETE" });
      await fetchErrors();
      setConfirmClear(false);
      setExpandedId(null);
      setPage(1);
    } finally {
      setClearing(false);
    }
  }

  /* Copy full error */
  function copyError(err: ErrorLogRow) {
    const text = [
      `Time:     ${new Date(err.createdAt).toLocaleString()}`,
      `Severity: ${err.severity}`,
      `Type:     ${err.type}`,
      `Message:  ${err.message}`,
      `Path:     ${err.path || "-"}`,
      `IP:       ${err.ip || "-"}`,
      err.stack     ? `\nStack:\n${err.stack}` : "",
      err.userAgent ? `\nUser-Agent: ${err.userAgent}` : "",
      err.metadata  ? `\nMetadata:\n${err.metadata}` : "",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(err.id);
    setTimeout(() => setCopied(null), 2000);
  }

  function resetFilters() {
    setSeverity(""); setType(""); setSearch(""); setTimePreset(0);
    setPage(1);
  }

  return (
    <div className="space-y-6">

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Logged"    value={total}          color="#9ca3af" />
        <StatCard label="Critical"        value={stats.critical} color="#ef4444" />
        <StatCard label="High Severity"   value={stats.high}     color="#f97316" />
        <StatCard label="Medium / Low"    value={stats.medium + stats.low} color="#eab308" />
      </div>

      {/* ── Filters ── */}
      <div
        className="rounded-xl border border-gray-700/60 p-4 space-y-3"
        style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
      >
        {/* Row 1: dropdowns + time presets */}
        <div className="flex flex-wrap gap-3 items-end">
          {/* Severity dropdown */}
          <div className="min-w-[140px]">
            <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">
              Severity
            </label>
            <select
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
              className="w-full rounded-lg bg-gray-900 text-white px-3 py-2 border border-gray-700 text-sm outline-none focus:border-green-600 cursor-pointer"
            >
              <option value="">All severities</option>
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Type dropdown */}
          <div className="min-w-[170px]">
            <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="w-full rounded-lg bg-gray-900 text-white px-3 py-2 border border-gray-700 text-sm outline-none focus:border-green-600 cursor-pointer"
            >
              <option value="">All types</option>
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Time range preset buttons */}
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">
              Time Range
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.hours}
                  onClick={() => { setTimePreset(preset.hours); setPage(1); }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                    timePreset === preset.hours
                      ? "border-green-600 bg-green-900/30 text-green-400"
                      : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: search + actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            >
              <circle cx={11} cy={11} r={8} /><line x1={21} y1={21} x2={16.65} y2={16.65} />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search message or path…"
              className="w-full rounded-lg bg-gray-900 text-white pl-8 pr-3 py-2 border border-gray-700 text-sm outline-none focus:border-green-600"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
              >
                ✕ Clear filters
              </button>
            )}
            <button
              onClick={fetchErrors}
              className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-700 text-gray-300 hover:border-green-700 hover:text-green-400 transition-colors"
              title="Refresh now"
            >
              ↻ Refresh
            </button>
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                autoRefresh
                  ? "border-green-700 bg-green-900/30 text-green-400"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              {autoRefresh ? "⏸ Auto" : "▶ Auto"}
            </button>
            {errors.length > 0 && !confirmClear && (
              <button
                onClick={() => setConfirmClear(true)}
                className="px-3 py-2 rounded-lg text-xs font-medium border border-red-900/50 text-red-400 hover:border-red-700 hover:bg-red-900/20 transition-colors"
              >
                🗑 Clear {hasActiveFilters ? "filtered" : "all"}
              </button>
            )}
            {confirmClear && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-red-400">
                  Delete {errors.length} error{errors.length !== 1 ? "s" : ""}?
                </span>
                <button
                  onClick={clearAll}
                  disabled={clearing}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-800/60 text-red-200 hover:bg-red-700/60 transition-colors disabled:opacity-50"
                >
                  {clearing ? "…" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-1.5 rounded-lg text-xs border border-gray-700 text-gray-400 hover:border-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {errors.length} {hasActiveFilters ? "matching" : "total"} error{errors.length !== 1 ? "s" : ""}
          </span>
          <span>
            Refreshed {relativeTime(lastRefreshed.toISOString())}
            {autoRefresh && <span className="ml-2 text-green-500">● live</span>}
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      {paginatedErrors.length > 0 ? (
        <div className="rounded-xl border border-gray-700/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-700" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
                  {["Time", "Severity", "Type", "Message", "Path", "IP", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-xs text-gray-400 font-semibold uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedErrors.map((err) => {
                  const { badge, dot } = severityStyle(err.severity);
                  const isExpanded = expandedId === err.id;
                  return (
                    <>
                      {/* Main row */}
                      <tr
                        key={`row-${err.id}`}
                        className={`border-b border-gray-700/40 cursor-pointer transition-colors ${
                          isExpanded ? "bg-gray-800/40" : "hover:bg-gray-900/30"
                        }`}
                        onClick={() => setExpandedId(isExpanded ? null : err.id)}
                      >
                        <td className="py-3 px-4 text-xs whitespace-nowrap">
                          <div className="text-gray-300 font-medium">{relativeTime(err.createdAt)}</div>
                          <div className="text-gray-600 mt-0.5">{new Date(err.createdAt).toLocaleString()}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${badge}`}>
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
                            {err.severity.charAt(0).toUpperCase() + err.severity.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-mono text-gray-300 bg-gray-800/60 px-2 py-1 rounded">
                            {err.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300 max-w-xs">
                          <div className="truncate" title={err.message}>
                            {err.message.length > 80 ? `${err.message.slice(0, 80)}…` : err.message}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-gray-500">
                          {err.path || <span className="text-gray-700">—</span>}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-gray-500">
                          {err.ip || <span className="text-gray-700">—</span>}
                        </td>
                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => deleteError(err.id)}
                            disabled={deletingId === err.id}
                            className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-40"
                            title="Delete"
                          >
                            {deletingId === err.id ? "…" : "✕"}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr key={`detail-${err.id}`} className="border-b border-gray-700/40">
                          <td colSpan={7} className="p-0">
                            <div className="bg-gray-950/70 border-t border-gray-800 p-5 space-y-4">
                              {/* Header */}
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-white">Error Detail</h4>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => copyError(err)}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 transition-colors"
                                  >
                                    {copied === err.id ? "✓ Copied!" : "Copy all"}
                                  </button>
                                  <button
                                    onClick={() => setExpandedId(null)}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700 transition-colors"
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>

                              {/* Full message */}
                              <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Message</p>
                                <p className="text-sm text-gray-200 break-words leading-relaxed">{err.message}</p>
                              </div>

                              {/* Meta grid */}
                              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                                {[
                                  { label: "Severity", value: err.severity },
                                  { label: "Type",     value: err.type },
                                  { label: "Path",     value: err.path || "—" },
                                  { label: "IP",       value: err.ip   || "—" },
                                ].map(({ label, value }) => (
                                  <div key={label} className="rounded-lg bg-gray-900/60 px-3 py-2 border border-gray-800">
                                    <div className="text-gray-500 mb-0.5">{label}</div>
                                    <div className="text-gray-200 font-mono break-all">{value}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Stack trace */}
                              {err.stack && (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                                      Stack Trace
                                    </p>
                                    <button
                                      onClick={() => navigator.clipboard.writeText(err.stack || "")}
                                      className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700 transition-colors"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                  <pre className="text-xs bg-gray-950 p-3 rounded-lg border border-gray-800 text-gray-400 overflow-x-auto max-h-52 overflow-y-auto leading-relaxed">
                                    {err.stack}
                                  </pre>
                                </div>
                              )}

                              {/* User Agent */}
                              {err.userAgent && (
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                                    User Agent
                                  </p>
                                  <p className="text-xs text-gray-500 font-mono break-all">{err.userAgent}</p>
                                </div>
                              )}

                              {/* Metadata */}
                              {err.metadata && (
                                <div>
                                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                                    Metadata
                                  </p>
                                  <pre className="text-xs bg-gray-950 p-3 rounded-lg border border-gray-800 text-gray-400 overflow-x-auto max-h-48 overflow-y-auto">
                                    {(() => {
                                      try { return JSON.stringify(JSON.parse(err.metadata ?? ""), null, 2); }
                                      catch { return err.metadata; }
                                    })()}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl border border-gray-700/60 py-16 text-center"
          style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
        >
          <div className="text-4xl mb-3">✓</div>
          <div className="text-gray-400 font-medium">No errors found</div>
          <div className="text-gray-600 text-sm mt-1">
            {hasActiveFilters ? "Try adjusting your filters" : "System is running clean"}
          </div>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="mt-4 text-xs text-green-500 hover:text-green-400 underline">
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, errors.length)} of {errors.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 text-xs font-medium disabled:opacity-40 hover:bg-gray-700 border border-gray-700 transition-colors"
            >
              ← Prev
            </button>
            <span className="text-xs text-gray-400 px-2">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 text-xs font-medium disabled:opacity-40 hover:bg-gray-700 border border-gray-700 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
