"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
interface FieldError    { field: string; count: number }

interface FormFunnel {
  started:        number;
  submitted:      number;
  abandoned:      number;
  fieldErrors:    number;
  conversionRate: number;
  abandonRate:    number;
  topFieldErrors: FieldError[];
}

interface UtmRow    { label: string; views: number; pct: number }
interface UtmBreakdown {
  totalTracked: number;
  sources:   UtmRow[];
  mediums:   UtmRow[];
  campaigns: UtmRow[];
}

interface GeoCountry { code: string; views: number; pct: number }
interface GeoCity    { city: string; country: string; views: number; pct: number }
interface GeoBreakdown {
  totalTracked: number;
  countries: GeoCountry[];
  cities:    GeoCity[];
}

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
  formFunnel?:      FormFunnel;
  utmBreakdown?:    UtmBreakdown;
  geoBreakdown?:    GeoBreakdown;
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
      <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
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
              <div className="text-gray-500 text-xs mt-1 whitespace-nowrap" style={{ fontSize: 9 }}>
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

/* ─── Inline tooltip (hover "i" icon) ───────────────────────────────── */
function InfoTip({ text }: { text: string }) {
  return (
    <span className="relative group/tip inline-flex items-center ml-1">
      <span className="w-3.5 h-3.5 rounded-full border border-gray-600 text-gray-500 text-[9px] flex items-center justify-center cursor-default select-none hover:border-gray-400 hover:text-gray-300 transition-colors">
        i
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 leading-snug opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-30 shadow-xl whitespace-normal text-left">
        {text}
      </span>
    </span>
  );
}

/* ─── UTM breakdown table ────────────────────────────────────────────── */
function UtmTable({ rows, color }: { rows: UtmRow[]; color: string }) {
  if (!rows.length) {
    return <p className="text-gray-500 text-xs italic">No data for this period</p>;
  }
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-center justify-between text-xs mb-0.5">
            <span className="font-mono text-gray-300 truncate mr-2">{r.label}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-gray-500">{r.pct}%</span>
              <span className="text-gray-300 font-semibold w-8 text-right">{r.views}</span>
            </div>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: color, opacity: 0.75 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Form funnel card ───────────────────────────────────────────────── */

function FormFunnelCard({ funnel }: { funnel: FormFunnel }) {
  const convColor = funnel.conversionRate >= 50 ? "#22c55e" : funnel.conversionRate >= 25 ? "#eab308" : "#ef4444";

  const steps = [
    { label: "Started",   value: funnel.started,   color: "#3b82f6", desc: "opened form" },
    {
      label: "Submitted", value: funnel.submitted,  color: "#22c55e", desc: "completed & sent",
    },
    {
      label: "Abandoned", value: funnel.abandoned,  color: "#f97316", desc: "left without submitting",
      tip: "Explicitly tracked when someone closes or navigates away mid-form — not just inactivity.",
    },
  ];
  const maxVal = Math.max(1, funnel.started);

  if (funnel.started === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-gray-500 text-sm">
        No form interactions yet for this period
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Form Starts */}
        <div
          className="rounded-xl border border-gray-700/60 px-4 py-3 text-center"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          <div className="text-xl font-bold text-white">{funnel.started}</div>
          <div className="text-xs font-semibold mt-1" style={{ color: "#3b82f6" }}>Form Starts</div>
        </div>
        {/* Submissions */}
        <div
          className="rounded-xl border border-gray-700/60 px-4 py-3 text-center"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          <div className="text-xl font-bold text-white">{funnel.submitted}</div>
          <div className="text-xs font-semibold mt-1" style={{ color: "#22c55e" }}>Submissions</div>
        </div>
        {/* Conversion Rate with tooltip */}
        <div
          className="rounded-xl border border-gray-700/60 px-4 py-3 text-center"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          <div className="text-xl font-bold text-white">{funnel.conversionRate}%</div>
          <div className="flex items-center justify-center text-xs font-semibold mt-1" style={{ color: convColor }}>
            Conversion Rate
            <InfoTip text="What % of people who touched the form actually submitted it. Green ≥50%, yellow ≥25%, red <25%." />
          </div>
        </div>
      </div>

      {/* Funnel bars */}
      <div className="space-y-2">
        {steps.map((step) => {
          const pct = Math.round((step.value / maxVal) * 100);
          return (
            <div key={step.label} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: step.color }}
                  />
                  <span className="text-gray-300 font-medium">{step.label}</span>
                  {"tip" in step && step.tip && <InfoTip text={step.tip} />}
                  <span className="text-gray-500">{step.desc}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-gray-400">{pct}%</span>
                  <span className="text-gray-200 font-semibold w-6 text-right">{step.value}</span>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: step.color, opacity: 0.8 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Field errors */}
      {funnel.topFieldErrors.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
            Common Validation Errors
            <InfoTip text="Which specific form fields cause the most friction — great for knowing which fields to simplify or relabel." />
          </p>
          <div className="flex flex-wrap gap-2">
            {funnel.topFieldErrors.map((fe) => (
              <span
                key={fe.field}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border border-orange-800/40 bg-orange-900/20 text-orange-300"
              >
                <span className="font-mono">{fe.field}</span>
                <span className="text-orange-500 font-bold">{fe.count}</span>
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            {funnel.fieldErrors} total validation errors across {funnel.started} session{funnel.started !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Geo breakdown card ─────────────────────────────────────────────── */

// Convert ISO 3166-1 alpha-2 country code to emoji flag (works in all modern browsers)
function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🌐";
  try {
    return String.fromCodePoint(
      ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
    );
  } catch {
    return "🌐";
  }
}

// Human-readable country names for common codes
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", CA: "Canada", GB: "United Kingdom", AU: "Australia",
  MX: "Mexico", DE: "Germany", FR: "France", IN: "India", JP: "Japan",
  BR: "Brazil", IT: "Italy", ES: "Spain", NL: "Netherlands", RU: "Russia",
  KR: "South Korea", CN: "China", SG: "Singapore", SE: "Sweden", NO: "Norway",
  DK: "Denmark", FI: "Finland", NZ: "New Zealand", IE: "Ireland", CH: "Switzerland",
  AT: "Austria", BE: "Belgium", PL: "Poland", PT: "Portugal", ZA: "South Africa",
  AR: "Argentina", CL: "Chile", CO: "Colombia", PH: "Philippines", ID: "Indonesia",
  TH: "Thailand", MY: "Malaysia", VN: "Vietnam", IL: "Israel", AE: "UAE",
  SA: "Saudi Arabia", EG: "Egypt", NG: "Nigeria", KE: "Kenya", GH: "Ghana",
};

function countryName(code: string): string {
  return COUNTRY_NAMES[code.toUpperCase()] ?? code;
}

function GeoCard({ geo }: { geo: GeoBreakdown }) {
  const [tab, setTab] = useState<"countries" | "cities">("countries");

  if (geo.totalTracked === 0) {
    return (
      <div className="text-center py-6 space-y-2">
        <p className="text-gray-400 text-sm">No geographic data yet.</p>
        <p className="text-gray-600 text-xs max-w-sm mx-auto">
          Geo data is captured automatically via Vercel's edge network — it will appear here once your site receives traffic in production.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex items-center gap-1">
        {(["countries", "cities"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              tab === t
                ? "border-green-700 bg-green-900/30 text-green-400"
                : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-500">
          {geo.totalTracked.toLocaleString()} tracked visit{geo.totalTracked !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Countries list */}
      {tab === "countries" && (
        <div className="space-y-2">
          {geo.countries.map((c) => (
            <div key={c.code}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base leading-none">{countryFlag(c.code)}</span>
                  <span className="text-gray-300 truncate">{countryName(c.code)}</span>
                  <span className="text-gray-600 font-mono text-[10px] shrink-0">{c.code}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-gray-500">{c.pct}%</span>
                  <span className="text-gray-300 font-semibold w-10 text-right">{c.views.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${c.pct}%`, backgroundColor: "#22c55e", opacity: 0.7 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cities list */}
      {tab === "cities" && (
        <div className="space-y-2">
          {geo.cities.length > 0 ? geo.cities.map((c, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base leading-none">{countryFlag(c.country)}</span>
                  <span className="text-gray-300 truncate">{c.city}</span>
                  <span className="text-gray-600 font-mono text-[10px] shrink-0">{c.country}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-gray-500">{c.pct}%</span>
                  <span className="text-gray-300 font-semibold w-10 text-right">{c.views.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${c.pct}%`, backgroundColor: "#3b82f6", opacity: 0.7 }}
                />
              </div>
            </div>
          )) : (
            <p className="text-gray-500 text-sm italic">No city data for this period</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Page drill-down panel ──────────────────────────────────────────── */

interface NextPage { path: string; visits: number; pct: number }
interface PageDrillDownData {
  ok:         boolean;
  path:       string;
  days:       number;
  summary:    { totalViews: number; totalSessions: number; avgDuration: number | null; siteSharePct: number };
  pageViewsByDay:  Array<{ date: string; views: number; sessions: number }>;
  hourlyBreakdown: Array<{ hour: number; views: number }>;
  topReferrers:    Array<{ referrer: string; count: number; pct: number }>;
  nextPages:       NextPage[];
  deviceBreakdown: { mobile: number; desktop: number };
}

function PageDrillDown({
  data,
  loading,
  onClose,
}: {
  data: PageDrillDownData | null;
  loading: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Trap scrolling background when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const maxViews = data ? Math.max(1, ...data.pageViewsByDay.map((d) => d.views)) : 1;
  const maxHourly = data ? Math.max(1, ...data.hourlyBreakdown.map((d) => d.views)) : 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-hidden shadow-2xl"
        style={{
          width: "min(600px, 96vw)",
          backgroundColor: "#0f0f10",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5 shrink-0 border-b"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="min-w-0 pr-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Page Details</p>
            <h2
              className="text-base font-mono font-semibold text-white truncate"
              title={data?.path ?? ""}
            >
              {data?.path ?? "…"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-colors flex items-center justify-center text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loading && (
            <div className="h-40 flex items-center justify-center">
              <LoadingDots />
            </div>
          )}

          {!loading && data && (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Views",       value: formatNumber(data.summary.totalViews),    color: "#22c55e" },
                  { label: "Sessions",    value: formatNumber(data.summary.totalSessions), color: "#3b82f6" },
                  { label: "Avg. Time",   value: data.summary.avgDuration ? formatDuration(data.summary.avgDuration) : "—", color: "#a78bfa" },
                  { label: "Site Share",  value: `${data.summary.siteSharePct}%`,          color: "#f59e0b" },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-gray-700/50 px-3 py-3 text-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.025)" }}
                  >
                    <div className="text-lg font-bold text-white">{value}</div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Daily views mini chart */}
              {data.pageViewsByDay.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Daily Views
                  </p>
                  <div className="flex items-end gap-1 overflow-x-auto pb-2" style={{ height: 80 }}>
                    {data.pageViewsByDay.map((pv, i) => {
                      const h = Math.max(4, Math.round((pv.views / maxViews) * 60));
                      return (
                        <div
                          key={i}
                          className="group flex-1 min-w-[18px] flex flex-col items-center relative"
                        >
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                            <span className="text-white">{new Date(pv.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            <span className="text-green-400 ml-1">{pv.views}</span>
                          </div>
                          <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: 64 }}>
                            <div
                              className="rounded-t w-full"
                              style={{ height: h, backgroundColor: "#22c55e", opacity: 0.8 }}
                            />
                          </div>
                          <div className="text-gray-600 mt-1 whitespace-nowrap" style={{ fontSize: 8 }}>
                            {new Date(pv.date).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hourly heatmap */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Traffic by Hour
                </p>
                <div className="flex items-end gap-0.5 pb-4" style={{ height: 50 }}>
                  {data.hourlyBreakdown.map((b) => {
                    const h = Math.round((b.views / maxHourly) * 36);
                    const intensity = b.views / maxHourly;
                    const bg = intensity === 0
                      ? "#1f2937"
                      : `rgba(34,197,94,${0.15 + intensity * 0.85})`;
                    return (
                      <div
                        key={b.hour}
                        className="group flex-1 relative"
                        style={{ minWidth: 0 }}
                      >
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                          <span className="text-white">{fmtHour(b.hour)}</span>
                          <span className="text-green-400 ml-1">{b.views}</span>
                        </div>
                        <div
                          className="rounded-t w-full"
                          style={{ height: Math.max(3, h), backgroundColor: bg }}
                        />
                        {[0, 6, 12, 18].includes(b.hour) && (
                          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-gray-600" style={{ fontSize: 8 }}>
                            {fmtHour(b.hour)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2-col row: Top Referrers + Next Pages */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Top referrers to this page */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Referrers to This Page
                  </p>
                  {data.topReferrers.length > 0 ? (
                    <div className="space-y-2">
                      {data.topReferrers.map((r, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between text-xs mb-0.5">
                            <span className="font-mono text-gray-300 truncate mr-2" title={r.referrer}>{r.referrer}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-gray-500">{r.pct}%</span>
                              <span className="text-gray-300 font-semibold w-6 text-right">{r.count}</span>
                            </div>
                          </div>
                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: "#3b82f6", opacity: 0.7 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs italic">No referrer data</p>
                  )}
                </div>

                {/* Next pages */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Next Pages Visited
                  </p>
                  {data.nextPages.length > 0 ? (
                    <div className="space-y-2">
                      {data.nextPages.map((p, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between text-xs mb-0.5">
                            <span className="font-mono text-gray-300 truncate mr-2" title={p.path}>{p.path}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-gray-500">{p.pct}%</span>
                              <span className="text-gray-300 font-semibold w-6 text-right">{p.visits}</span>
                            </div>
                          </div>
                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, p.pct * 2)}%`, backgroundColor: "#a78bfa", opacity: 0.7 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs italic">No exit data</p>
                  )}
                </div>
              </div>

              {/* Device split */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Device Split
                </p>
                <div className="flex rounded-lg overflow-hidden h-4 mb-2">
                  <div style={{ width: `${data.deviceBreakdown.mobile}%`, backgroundColor: "#a78bfa" }} />
                  <div style={{ width: `${data.deviceBreakdown.desktop}%`, backgroundColor: "#22c55e" }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>📱 Mobile {data.deviceBreakdown.mobile}%</span>
                  <span>🖥 Desktop {data.deviceBreakdown.desktop}%</span>
                </div>
              </div>
            </>
          )}

          {!loading && !data && (
            <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
              No data available for this page.
            </div>
          )}
        </div>
      </div>
    </>
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
  const funnel   = data.formFunnel;
  const utm      = data.utmBreakdown;
  const geo      = data.geoBreakdown;

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
    blank,

    // ── Form funnel
    ...(funnel ? [
      row("FORM CONVERSIONS"),
      row("Metric", "Value"),
      row("Form Starts",      funnel.started),
      row("Submissions",      funnel.submitted),
      row("Abandoned",        funnel.abandoned),
      row("Conversion Rate",  `${funnel.conversionRate}%`),
      row("Abandonment Rate", `${funnel.abandonRate}%`),
      row("Total Field Errors", funnel.fieldErrors),
      blank,
      ...(funnel.topFieldErrors.length > 0 ? [
        row("COMMON VALIDATION ERRORS"),
        row("Field", "Error Count"),
        ...funnel.topFieldErrors.map((fe) => row(fe.field, fe.count)),
        blank,
      ] : [blank]),
    ] : []),

    // ── Geographic breakdown
    ...(geo && geo.totalTracked > 0 ? [
      row("VISITOR LOCATIONS"),
      row("Total Tracked Visits", geo.totalTracked),
      blank,
      row("TOP COUNTRIES"),
      row("Country Code", "Country", "Visits", "% of Tracked"),
      ...geo.countries.map((c) => row(c.code, COUNTRY_NAMES[c.code] ?? c.code, c.views, `${c.pct}%`)),
      blank,
      ...(geo.cities.length > 0 ? [
        row("TOP CITIES"),
        row("City", "Country", "Visits", "% of Tracked"),
        ...geo.cities.map((c) => row(c.city, c.country, c.views, `${c.pct}%`)),
        blank,
      ] : []),
    ] : []),

    // ── UTM / Campaign tracking
    ...(utm && utm.totalTracked > 0 ? [
      row("CAMPAIGN TRACKING (UTM)"),
      row("Total Tracked Visits", utm.totalTracked),
      blank,
      row("UTM SOURCES"),
      row("Source", "Visits", "% of Tagged"),
      ...utm.sources.map((r) => row(r.label, r.views, `${r.pct}%`)),
      blank,
      row("UTM MEDIUMS"),
      row("Medium", "Visits", "% of Tagged"),
      ...utm.mediums.map((r) => row(r.label, r.views, `${r.pct}%`)),
      blank,
      row("UTM CAMPAIGNS"),
      row("Campaign", "Visits", "% of Tagged"),
      ...utm.campaigns.map((r) => row(r.label, r.views, `${r.pct}%`)),
    ] : []),
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
  const [days, setDays]           = useState(7);
  const [data, setData]           = useState<AnalyticsData>(initialData);
  const [loading, setLoading]     = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Custom date range
  const [customMode, setCustomMode]   = useState(false);
  const [customFrom, setCustomFrom]   = useState("");
  const [customTo, setCustomTo]       = useState("");

  // Page drill-down panel
  const [drillPath, setDrillPath]     = useState<string | null>(null);
  const [drillData, setDrillData]     = useState<PageDrillDownData | null>(null);
  const [drillLoading, setDrillLoading] = useState(false);

  /* ── Fetch with either preset days or custom range ── */
  const fetchData = useCallback(async (opts: { days?: number; from?: string; to?: string }) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (opts.from && opts.to) {
        params.set("from_date", opts.from);
        params.set("to_date", opts.to);
      } else {
        params.set("days", String(opts.days ?? 7));
      }
      const res  = await fetch(`/api/admin/analytics?${params.toString()}`);
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

  /* ── Page drill-down fetch ── */
  const openDrillDown = useCallback(async (path: string) => {
    setDrillPath(path);
    setDrillData(null);
    setDrillLoading(true);
    try {
      const params = new URLSearchParams({ path });
      if (customMode && customFrom && customTo) {
        params.set("from_date", customFrom);
        params.set("to_date",   customTo);
      } else {
        params.set("days", String(days));
      }
      const res  = await fetch(`/api/admin/analytics/page?${params.toString()}`);
      const json = await res.json();
      if (json.ok) setDrillData(json as PageDrillDownData);
    } catch {
      // silent
    } finally {
      setDrillLoading(false);
    }
  }, [days, customMode, customFrom, customTo]);

  // Fetch when preset days changes (skip if in custom mode)
  useEffect(() => {
    if (!customMode) fetchData({ days });
  }, [days, customMode, fetchData]);

  // Fetch when both custom dates are filled
  useEffect(() => {
    if (customMode && customFrom && customTo && customFrom <= customTo) {
      fetchData({ from: customFrom, to: customTo });
    }
  }, [customMode, customFrom, customTo, fetchData]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      customMode && customFrom && customTo
        ? fetchData({ from: customFrom, to: customTo })
        : fetchData({ days });
    }, 60_000);
    return () => clearInterval(id);
  }, [autoRefresh, days, customMode, customFrom, customTo, fetchData]);

  const summary   = data.summary     ?? EMPTY_SUMMARY;
  const topPages  = data.topPages    ?? [];
  const hourly    = data.hourlyBreakdown ?? Array.from({ length: 24 }, (_, h) => ({ hour: h, views: 0 }));
  const pvByDay   = data.pageViewsByDay ?? [];
  const referrers = data.topReferrers ?? [];
  const device    = data.deviceBreakdown ?? { mobile: 0, desktop: 100 };
  const funnel    = data.formFunnel;
  const utm       = data.utmBreakdown;
  const geo       = data.geoBreakdown;

  const relTime = (d: Date) => {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 5) return "just now";
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ago`;
  };

  // Today's date string for max attribute on date inputs
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">

      {/* ── Page drill-down panel (portal-like, fixed) ───────────── */}
      {drillPath !== null && (
        <PageDrillDown
          data={drillData}
          loading={drillLoading}
          onClose={() => { setDrillPath(null); setDrillData(null); }}
        />
      )}

      {/* ── Controls row ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: presets + Custom toggle */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <TimePresets
              value={customMode ? -1 : days}
              onChange={(d) => { setCustomMode(false); setDays(d); }}
              disabled={loading}
            />
            {/* Custom date range button */}
            <button
              onClick={() => {
                setCustomMode((v) => !v);
                if (!customMode && !customFrom) {
                  // Default: last 7 days as starting point
                  const t = new Date();
                  const f = new Date(t.getTime() - 7 * 24 * 60 * 60 * 1000);
                  setCustomFrom(f.toISOString().slice(0, 10));
                  setCustomTo(t.toISOString().slice(0, 10));
                }
              }}
              disabled={loading}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap disabled:opacity-40 ${
                customMode
                  ? "border-purple-600 bg-purple-900/30 text-purple-400"
                  : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}
            >
              {customMode ? "✎ Custom" : "Custom"}
            </button>
            {loading && <LoadingDots />}
          </div>

          {/* Right: status + action buttons */}
          <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
            <span>Updated {relTime(lastRefreshed)}</span>
            <button
              onClick={() => customMode && customFrom && customTo
                ? fetchData({ from: customFrom, to: customTo })
                : fetchData({ days })}
              className="px-2.5 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:border-green-700 hover:text-green-400 transition-colors"
              title="Refresh now"
            >
              ↻
            </button>
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              title="Automatically refreshes data every 60 seconds"
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                autoRefresh
                  ? "border-green-700 bg-green-900/30 text-green-400"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              {autoRefresh
                ? <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" /> Auto-refresh on</span>
                : "Auto-refresh"}
            </button>
            <button
              onClick={() => exportCSV(data, days)}
              disabled={loading || !data.ok}
              className="px-2.5 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:border-blue-700 hover:text-blue-400 transition-colors disabled:opacity-40 font-medium"
              title="Download all visible data as CSV"
            >
              ↓ CSV
            </button>
          </div>
        </div>

        {/* Custom date range inputs — shown only when Custom is active */}
        {customMode && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-medium">From</span>
            <input
              type="date"
              value={customFrom}
              max={customTo || todayStr}
              onChange={(e) => setCustomFrom(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="rounded-lg bg-gray-900 text-gray-200 px-3 py-1.5 border border-gray-600 text-xs outline-none focus:border-purple-500 transition-colors cursor-pointer"
            />
            <span className="text-xs text-gray-400 font-medium">To</span>
            <input
              type="date"
              value={customTo}
              min={customFrom}
              max={todayStr}
              onChange={(e) => setCustomTo(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="rounded-lg bg-gray-900 text-gray-200 px-3 py-1.5 border border-gray-600 text-xs outline-none focus:border-purple-500 transition-colors cursor-pointer"
            />
            {customFrom && customTo && (
              <span className="text-xs text-gray-500">
                {Math.round((new Date(customTo).getTime() - new Date(customFrom).getTime()) / (86400000)) + 1} days selected
              </span>
            )}
          </div>
        )}
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
            sub={`Most visited in the last ${days}d — click any row for details`}
          />
          {topPages.length > 0 ? (
            <div className="space-y-2">
              {topPages.map((page, i) => (
                <button
                  key={i}
                  className="group w-full text-left rounded-lg px-2 py-1.5 -mx-2 transition-colors hover:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-green-700/60"
                  onClick={() => openDrillDown(page.path || "/")}
                  title={`View details for ${page.path || "/"}`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="font-mono text-gray-300 truncate group-hover:text-white transition-colors"
                        title={page.path}
                      >
                        {page.path || "/"}
                      </span>
                      <span className="text-gray-600 group-hover:text-gray-500 transition-colors shrink-0 text-[10px]">↗</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
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
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No page data yet</p>
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

      {/* ── Form conversion funnel ────────────────────────────────── */}
      <AdminCard>
        <SectionHeader
          title="Form Conversions"
          sub="Lead form funnel — from first interaction to submission"
        />
        {funnel ? (
          <FormFunnelCard funnel={funnel} />
        ) : (
          <div className="h-20 flex items-center justify-center text-gray-500 text-sm">
            No form data for this period
          </div>
        )}
      </AdminCard>

      {/* ── Geographic breakdown ──────────────────────────────────── */}
      <AdminCard>
        <SectionHeader
          title="Visitor Locations"
          sub="Countries and cities your traffic comes from"
        />
        {geo ? (
          <GeoCard geo={geo} />
        ) : (
          <div className="h-20 flex items-center justify-center text-gray-500 text-sm">
            No geographic data for this period
          </div>
        )}
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
          <p className="text-gray-400 text-sm">No referrer data for this period</p>
        )}
      </AdminCard>

      {/* ── UTM / Campaign tracking ───────────────────────────────── */}
      <AdminCard>
        <SectionHeader
          title="Campaign Tracking (UTM)"
          sub="Visits tagged with utm_source / utm_medium / utm_campaign parameters"
        />
        {utm && utm.totalTracked > 0 ? (
          <div className="space-y-1">
            {/* Totals banner */}
            <p className="text-xs text-gray-500 mb-4">
              <span className="text-white font-semibold">{utm.totalTracked}</span> tracked visit{utm.totalTracked !== 1 ? "s" : ""} with UTM parameters in this period
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Sources */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "#a78bfa" }} />
                  Sources
                  <InfoTip text="utm_source — identifies who sent the traffic (e.g. google, newsletter, instagram)." />
                </p>
                <UtmTable rows={utm.sources} color="#a78bfa" />
              </div>
              {/* Mediums */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "#38bdf8" }} />
                  Mediums
                  <InfoTip text="utm_medium — the marketing channel (e.g. cpc, email, social, organic)." />
                </p>
                <UtmTable rows={utm.mediums} color="#38bdf8" />
              </div>
              {/* Campaigns */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "#f59e0b" }} />
                  Campaigns
                  <InfoTip text="utm_campaign — specific campaign name (e.g. spring-promo, google-ads-2026)." />
                </p>
                <UtmTable rows={utm.campaigns} color="#f59e0b" />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-2">
            <p className="text-gray-400 text-sm">No UTM-tagged visits yet for this period.</p>
            <p className="text-gray-600 text-xs max-w-sm mx-auto">
              Add <span className="font-mono text-gray-500">?utm_source=google&utm_medium=cpc&utm_campaign=spring</span> to your links to start tracking campaigns.
            </p>
          </div>
        )}
      </AdminCard>

    </div>
  );
}
