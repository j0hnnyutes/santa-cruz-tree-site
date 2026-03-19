"use client";

import { useState, useEffect, useCallback } from "react";
import {
  StatCard,
  AdminCard,
  SectionHeader,
  TimePresets,
  LoadingDots,
  formatDuration,
  formatNumber,
} from "@/components/AdminShared";

/* ─── Types ─────────────────────────────────────────────────────────── */

interface PageViewDay   { date: string; views: number; sessions: number }
interface TopPage       { path: string; views: number; pct: number }
interface HourlyBucket  { hour: number; views: number }
interface Referrer      { referrer: string; count: number; pct: number }

interface AnalyticsData {
  ok: boolean;
  days?: number;
  summary?: {
    totalViews: number;
    totalSessions: number;
    avgDuration: number | null;
    bounceRate: number;
    trends: { views: number | null; sessions: number | null };
  };
  pageViewsByDay:   PageViewDay[];
  topPages?:        TopPage[];
  hourlyBreakdown?: HourlyBucket[];
  deviceBreakdown:  { mobile: number; desktop: number };
  topReferrers:     Referrer[];
}

interface Props { initialData: AnalyticsData }

/* ─── Helpers ────────────────────────────────────────────────────────── */

function fmtAxisDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtHour(h: number) {
  if (h === 0)  return "12a";
  if (h === 12) return "12p";
  return h < 12 ? `${h}a` : `${h - 12}p`;
}

/* ─── Dual bar chart (views + sessions) ─────────────────────────────── */
function ViewsChart({ data, loading }: { data: PageViewDay[]; loading: boolean }) {
  const maxViews = Math.max(1, ...data.map((d) => d.views));

  if (!data.length) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-600 text-sm">
        No data for this period
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-gray-950/60 flex items-center justify-center rounded-lg z-10">
          <LoadingDots />
        </div>
      )}
      <div className="flex items-end gap-1 overflow-x-auto pb-2" style={{ height: 140 }}>
        {data.map((pv, i) => {
          const viewH   = Math.round((pv.views    / maxViews) * 110);
          const sessH   = Math.round((pv.sessions / maxViews) * 110);
          return (
            <div
              key={i}
              className="group flex-1 min-w-[28px] flex flex-col items-center gap-0 relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 text-center">
                <div className="text-white font-semibold">{fmtAxisDate(pv.date)}</div>
                <div className="text-green-400">{pv.views} views</div>
                <div className="text-blue-400">{pv.sessions} sessions</div>
              </div>
              {/* Bars side by side */}
              <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: 120 }}>
                <div
                  className="rounded-t transition-all"
                  style={{ width: "45%", height: viewH, backgroundColor: "#22c55e", opacity: 0.85 }}
                />
                <div
                  className="rounded-t transition-all"
                  style={{ width: "45%", height: sessH, backgroundColor: "#3b82f6", opacity: 0.7 }}
                />
              </div>
              <div className="text-gray-600 text-xs mt-1 whitespace-nowrap" style={{ fontSize: 9 }}>
                {fmtAxisDate(pv.date)}
              </div>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: "#22c55e" }} />
          Views
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: "#3b82f6" }} />
          Sessions
        </span>
      </div>
    </div>
  );
}

/* ─── Hourly heatmap ─────────────────────────────────────────────────── */
function HourlyChart({ data, loading }: { data: HourlyBucket[]; loading: boolean }) {
  const maxViews = Math.max(1, ...data.map((d) => d.views));
  const showLabels = [0, 3, 6, 9, 12, 15, 18, 21];

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-gray-950/60 flex items-center justify-center rounded-lg z-10">
          <LoadingDots />
        </div>
      )}
      <div className="flex items-end gap-0.5 pb-5" style={{ height: 72 }}>
        {data.map((b) => {
          const h = Math.round((b.views / maxViews) * 50);
          const intensity = b.views / maxViews;
          const bg = intensity === 0
            ? "#1f2937"
            : `rgba(34,197,94,${0.15 + intensity * 0.85})`;
          return (
            <div
              key={b.hour}
              className="group flex-1 relative"
              style={{ minWidth: 0 }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                <span className="text-white">{fmtHour(b.hour)}</span>
                <span className="text-green-400 ml-1">{b.views}</span>
              </div>
              <div
                className="rounded-t w-full transition-all"
                style={{ height: Math.max(4, h), backgroundColor: bg }}
              />
              {showLabels.includes(b.hour) && (
                <div
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-gray-600"
                  style={{ fontSize: 9, whiteSpace: "nowrap" }}
                >
                  {fmtHour(b.hour)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Shared constants ───────────────────────────────────────────────── */

const EMPTY_SUMMARY = {
  totalViews: 0, totalSessions: 0, avgDuration: null, bounceRate: 0,
  trends: { views: null, sessions: null },
};

/* ─── CSV export ─────────────────────────────────────────────────────── */

function exportCSV(data: AnalyticsData, days: number) {
  const summary  = data.summary  ?? EMPTY_SUMMARY;
  const pvByDay  = data.pageViewsByDay ?? [];
  const topPages = data.topPages ?? [];
  const hourly   = data.hourlyBreakdown ?? [];
  const refs     = data.topReferrers ?? [];
  const device   = data.deviceBreakdown ?? { mobile: 0, desktop: 100 };

  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const row = (...cols: (string | number)[]) => cols.map(esc).join(",");
  const blank = "";

  const lines: string[] = [
    // ── Meta header
    row("Santa Cruz Tree Pros — Analytics Export"),
    row("Period", `Last ${days} day${days !== 1 ? "s" : ""}`),
    row("Exported", new Date().toLocaleString()),
    blank,

    // ── Summary
    row("SUMMARY"),
    row("Metric", "Value"),
    row("Total Page Views",   summary.totalViews),
    row("Unique Sessions",    summary.totalSessions),
    row("Avg. Time on Page",  summary.avgDuration ? formatDuration(summary.avgDuration) : "—"),
    row("Bounce Rate",        `${summary.bounceRate}%`),
    row("Mobile Traffic",     `${device.mobile}%`),
    row("Desktop Traffic",    `${device.desktop}%`),
    blank,

    // ── Daily views
    row("DAILY PAGE VIEWS"),
    row("Date", "Views", "Sessions"),
    ...pvByDay.map((d) => row(d.date, d.views, d.sessions)),
    blank,

    // ── Top pages
    row("TOP PAGES"),
    row("Path", "Views", "% of Total"),
    ...topPages.map((p) => row(p.path || "/", p.views, `${p.pct}%`)),
    blank,

    // ── Top referrers
    row("TOP REFERRERS"),
    row("Source", "Visits", "% of Total"),
    ...refs.map((r) => row(r.referrer, r.count, `${r.pct}%`)),
    blank,

    // ── Hourly
    row("TRAFFIC BY HOUR"),
    row("Hour", "Views"),
    ...hourly.map((h) => row(`${h.hour}:00`, h.views)),
  ];

  const csv    = lines.join("\n");
  const blob   = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url    = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const fname  = `analytics-${days}d-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.href  = url;
  anchor.download = fname;
  anchor.click();
  URL.revokeObjectURL(url);
}

/* ─── Main component ─────────────────────────────────────────────────── */

export default function AdminAnalyticsClient({ initialData }: Props) {
  const [days, setDays]       = useState(7);
  const [data, setData]       = useState<AnalyticsData>(initialData);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchData = useCallback(async (d: number) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/analytics?days=${d}`);
      const json = await res.json();
      if (json.ok) {
        setData(json);
        setLastRefreshed(new Date());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(days); }, [days, fetchData]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => fetchData(days), 60_000);
    return () => clearInterval(id);
  }, [autoRefresh, days, fetchData]);

  const summary     = data.summary     ?? EMPTY_SUMMARY;
  const topPages    = data.topPages    ?? [];
  const hourly      = data.hourlyBreakdown ?? Array.from({ length: 24 }, (_, h) => ({ hour: h, views: 0 }));
  const pvByDay     = data.pageViewsByDay ?? [];
  const referrers   = data.topReferrers ?? [];
  const device      = data.deviceBreakdown ?? { mobile: 0, desktop: 100 };

  const relTime = (d: Date) => {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 5) return "just now";
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ago`;
  };

  return (
    <div className="space-y-6">

      {/* ── Controls row ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <TimePresets value={days} onChange={(d) => setDays(d)} disabled={loading} />
          {loading && <LoadingDots />}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
          <span>Refreshed {relTime(lastRefreshed)}</span>
          <button
            onClick={() => fetchData(days)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:border-green-700 hover:text-green-400 transition-colors"
            title="Refresh now"
          >
            ↻
          </button>
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
              autoRefresh
                ? "border-green-700 bg-green-900/30 text-green-400"
                : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}
          >
            {autoRefresh ? "⏸ Live" : "▶ Live"}
          </button>
          <button
            onClick={() => exportCSV(data, days)}
            disabled={loading || !data.ok}
            className="px-2.5 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:border-blue-700 hover:text-blue-400 transition-colors disabled:opacity-40 font-medium"
            title="Export to CSV"
          >
            ↓ CSV
          </button>
        </div>
      </div>

      {/* ── KPI cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Page Views"
          value={formatNumber(summary.totalViews)}
          trend={summary.trends.views ?? undefined}
          trendGoodWhenUp={true}
          color="#22c55e"
          icon="👁"
        />
        <StatCard
          label="Unique Sessions"
          value={formatNumber(summary.totalSessions)}
          trend={summary.trends.sessions ?? undefined}
          trendGoodWhenUp={true}
          color="#3b82f6"
          icon="🧑‍💻"
        />
        <StatCard
          label="Avg. Time on Page"
          value={summary.avgDuration ? formatDuration(summary.avgDuration) : "—"}
          sub="across all pages"
          color="#a78bfa"
          icon="⏱"
        />
        <StatCard
          label="Bounce Rate"
          value={`${summary.bounceRate}%`}
          sub="single-page sessions"
          trendGoodWhenUp={false}
          color="#f97316"
          icon="↩"
        />
      </div>

      {/* ── Views chart ───────────────────────────────────────────── */}
      <AdminCard>
        <SectionHeader
          title="Page Views & Sessions"
          sub={`Daily breakdown for the last ${days} day${days !== 1 ? "s" : ""}`}
        />
        <ViewsChart data={pvByDay} loading={loading} />
      </AdminCard>

      {/* ── Top pages + Device split ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Top pages — takes 2/3 */}
        <AdminCard className="lg:col-span-2">
          <SectionHeader
            title="Top Pages"
            sub={`Most visited in the last ${days}d`}
          />
          {topPages.length > 0 ? (
            <div className="space-y-2">
              {topPages.map((page, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className="font-mono text-gray-300 truncate mr-2 group-hover:text-white transition-colors"
                      title={page.path}
                    >
                      {page.path || "/"}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-gray-500">{page.pct}%</span>
                      <span className="text-gray-300 font-semibold w-10 text-right">
                        {formatNumber(page.views)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${page.pct}%`, backgroundColor: "#22c55e", opacity: 0.7 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No page data yet</p>
          )}
        </AdminCard>

        {/* Device split — 1/3 */}
        <AdminCard>
          <SectionHeader title="Device Split" />
          <div className="space-y-5">
            {/* Visual proportion bar */}
            <div>
              <div className="flex rounded-lg overflow-hidden h-5 mb-2">
                <div style={{ width: `${device.mobile}%`, backgroundColor: "#a78bfa" }} />
                <div style={{ width: `${device.desktop}%`, backgroundColor: "#22c55e" }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Mobile</span>
                <span>Desktop</span>
              </div>
            </div>
            {/* Stat rows */}
            <div className="space-y-3">
              {[
                { label: "📱 Mobile",  value: device.mobile,  color: "#a78bfa" },
                { label: "🖥 Desktop", value: device.desktop, color: "#22c55e" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{label}</span>
                  <span className="text-xl font-bold text-white">
                    {value}
                    <span className="text-sm font-normal text-gray-500 ml-0.5">%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AdminCard>
      </div>

      {/* ── Hourly traffic heatmap ────────────────────────────────── */}
      <AdminCard>
        <SectionHeader
          title="Traffic by Hour"
          sub="When your visitors are most active (local time)"
        />
        <HourlyChart data={hourly} loading={loading} />
      </AdminCard>

      {/* ── Top referrers ─────────────────────────────────────────── */}
      <AdminCard>
        <SectionHeader
          title="Top Referrers"
          sub={`Traffic sources for the last ${days}d`}
        />
        {referrers.length > 0 ? (
          <div className="space-y-3">
            {referrers.map((ref, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-gray-500 w-4 text-right shrink-0">{i + 1}</span>
                    <span className="font-mono text-gray-300 truncate" title={ref.referrer}>
                      {ref.referrer}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-gray-500">{ref.pct}%</span>
                    <span className="text-gray-300 font-semibold w-8 text-right">{ref.count}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${ref.pct}%`, backgroundColor: "#3b82f6", opacity: 0.7 }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No referrer data for this period</p>
        )}
      </AdminCard>

    </div>
  );
}
