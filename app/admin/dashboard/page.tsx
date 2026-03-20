import { isAdminAuthenticated } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

interface StatsData {
  ok: boolean;
  leads: {
    total: number;
    byStatus: Record<string, number>;
    lastNDays: number;
  };
  errors: {
    lastNDays: number;
    bySeverity: Record<string, number>;
    recent: Array<{ message: string; type: string; severity: string; count: number; lastSeen: string }>;
  };
  formFunnel: {
    started: number;
    fieldError: number;
    abandoned: number;
    submitted: number;
    conversionRate: number | null;
  };
  topPages: Array<{ path: string; views: number; avgDuration: number }>;
}

export default async function DashboardPage() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) redirect("/admin?next=/admin/dashboard");

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const base = process.env.SITE_URL || "http://localhost:3000";
  let statsData: StatsData = {
    ok: false,
    leads: { total: 0, byStatus: {}, lastNDays: 0 },
    errors: { lastNDays: 0, bySeverity: {}, recent: [] },
    formFunnel: { started: 0, fieldError: 0, abandoned: 0, submitted: 0, conversionRate: 0 },
    topPages: [],
  };

  try {
    const res = await fetch(`${base}/api/admin/stats?days=30`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    const data = await res.json();
    if (data.ok) {
      statsData = data;
    }
  } catch (err) {
    console.error("Failed to fetch stats:", err);
  }

  const started = statsData.formFunnel.started;
  const submitted = statsData.formFunnel.submitted;
  const conversionRate = statsData.formFunnel.conversionRate;
  const conversionDisplay =
    conversionRate !== null && conversionRate !== undefined
      ? `${conversionRate.toFixed(1)}%`
      : submitted > 0
      ? "N/A"
      : "—";
  const conversionTrend =
    started > 0
      ? `${submitted}/${started} submitted`
      : submitted > 0
      ? `${submitted} submitted, tracking starting`
      : "No form activity yet";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>
      <AdminNav />

      <main className="site-container py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-400">Last 30 days</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Leads"
            value={statsData.leads.total.toString()}
            trend={`${statsData.leads.lastNDays} this month`}
          />
          <StatCard
            label="New This Month"
            value={statsData.leads.lastNDays.toString()}
            trend={`of ${statsData.leads.total} total`}
          />
          <StatCard
            label="Errors (30d)"
            value={statsData.errors.lastNDays.toString()}
            trend={`${statsData.errors.bySeverity.critical || 0} critical`}
          />
          <StatCard
            label="Form Conversion"
            value={conversionDisplay}
            trend={conversionTrend}
          />
        </div>

        {/* Form Funnel */}
        <div
          className="rounded-lg p-6"
          style={{ backgroundColor: "#1a2e1a", border: "1px solid rgba(255, 255, 255, 0.1)" }}
        >
          <h2 className="mb-2 text-xl font-semibold text-white">Form Funnel (30d)</h2>
          <p className="mb-5 text-sm text-gray-400">
            Tracks estimate form interactions. &ldquo;Field Errors&rdquo; = validation errors on submit attempt
            (separate from server-side errors below).
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <FunnelBox label="Started" count={statsData.formFunnel.started} />
            <div className="text-white">→</div>
            <FunnelBox label="Field Errors" count={statsData.formFunnel.fieldError} />
            <div className="text-white">→</div>
            <FunnelBox label="Abandoned" count={statsData.formFunnel.abandoned} />
            <div className="text-white">→</div>
            <FunnelBox label="Submitted" count={statsData.formFunnel.submitted} accent />
          </div>
        </div>

        {/* Top Pages */}
        <div
          className="rounded-lg p-6"
          style={{ backgroundColor: "#1a2e1a", border: "1px solid rgba(255, 255, 255, 0.1)" }}
        >
          <h2 className="mb-6 text-xl font-semibold text-white">Top Pages</h2>
          {statsData.topPages.length > 0 ? (
            <div className="space-y-4">
              {statsData.topPages.map((page, idx) => {
                const maxViews = Math.max(
                  1,
                  Math.max(...statsData.topPages.map((p) => p.views))
                );
                const barWidth = (page.views / maxViews) * 100;
                const avgMs = page.avgDuration;
                let avgLabel = "—";
                if (avgMs && avgMs > 0) {
                  const s = Math.round(avgMs / 1000);
                  avgLabel = s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
                }
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{page.path}</span>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-gray-500 text-xs">avg {avgLabel}</span>
                        <span className="text-gray-400">{page.views} views</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: "var(--brand-green)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400">No page views yet</p>
          )}
        </div>

        {/* Recent Errors */}
        <div
          className="rounded-lg p-6"
          style={{ backgroundColor: "#1a2e1a", border: "1px solid rgba(255, 255, 255, 0.1)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Errors</h2>
            <Link href="/admin/errors" className="text-sm font-medium" style={{ color: "var(--brand-green)" }}>
              View all errors →
            </Link>
          </div>
          {statsData.errors.recent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      Severity
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">
                      Message
                    </th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">
                      Count
                    </th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">
                      Last seen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statsData.errors.recent.map((err, idx) => (
                    <tr key={idx} className="border-b border-gray-700/50">
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            err.severity === "critical"
                              ? "bg-red-900/50 text-red-200"
                              : err.severity === "error"
                              ? "bg-red-900/30 text-red-300"
                              : "bg-yellow-900/30 text-yellow-300"
                          }`}
                        >
                          {err.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{err.type}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {err.message.length > 60
                          ? `${err.message.slice(0, 60)}...`
                          : err.message}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-300 font-medium">
                        {err.count}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500 text-xs">
                        {err.lastSeen
                          ? new Date(err.lastSeen).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400">No errors in the last 30 days</p>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div
      className="rounded-lg p-6"
      style={{ backgroundColor: "#1a2e1a", border: "1px solid rgba(255, 255, 255, 0.1)" }}
    >
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{trend}</p>
    </div>
  );
}

function FunnelBox({
  label,
  count,
  accent = false,
}: {
  label: string;
  count: number;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-lg px-4 py-3 text-center"
      style={{
        backgroundColor: accent ? "var(--brand-green)" : "rgba(255, 255, 255, 0.05)",
        border: `1px solid ${accent ? "var(--brand-green)" : "rgba(255, 255, 255, 0.1)"}`,
      }}
    >
      <div className="text-sm font-medium" style={{ color: accent ? "white" : "#d1d5db" }}>
        {label}
      </div>
      <div className="text-2xl font-bold text-white">{count}</div>
    </div>
  );
}
