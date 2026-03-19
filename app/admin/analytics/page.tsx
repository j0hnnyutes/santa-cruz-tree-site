import { isAdminAuthenticated } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminNav from "@/components/AdminNav";
import AdminAnalyticsClient from "@/components/AdminAnalyticsClient";

export const metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export default async function AnalyticsPage() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) redirect("/admin?next=/admin/analytics");

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const base = process.env.SITE_URL || "http://localhost:3000";

  let initialData: any = {
    ok: false,
    pageViewsByDay:   [],
    deviceBreakdown:  { mobile: 0, desktop: 100 },
    topReferrers:     [],
    topPages:         [],
    hourlyBreakdown:  [],
    utmBreakdown:     { totalTracked: 0, sources: [], mediums: [], campaigns: [] },
    summary: {
      totalViews:    0,
      totalSessions: 0,
      avgDuration:   null,
      bounceRate:    0,
      trends:        { views: null, sessions: null },
    },
  };

  try {
    const res = await fetch(`${base}/api/admin/analytics?days=7`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    const data = await res.json();
    if (data.ok) initialData = data;
  } catch (err) {
    console.error("Failed to fetch analytics:", err);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>
      <AdminNav />

      <main className="site-container py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-400">
            Site traffic, visitor behavior, and performance insights
          </p>
        </div>

        <AdminAnalyticsClient initialData={initialData} />
      </main>
    </div>
  );
}
