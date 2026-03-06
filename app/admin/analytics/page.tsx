import { isAdminAuthenticated } from "@/lib/adminAuth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminNav from "@/components/AdminNav";
import AdminAnalyticsClient from "@/components/AdminAnalyticsClient";

export const metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

interface AnalyticsData {
  ok: boolean;
  pageViewsByDay: Array<{ date: string; views: number; sessions: number }>;
  deviceBreakdown: { mobile: number; desktop: number };
  topReferrers: Array<{ referrer: string; count: number }>;
}

export default async function AnalyticsPage() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) redirect("/admin?next=/admin/analytics");

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const base = process.env.SITE_URL || "http://localhost:3000";
  let analyticsData: AnalyticsData = {
    ok: false,
    pageViewsByDay: [],
    deviceBreakdown: { mobile: 0, desktop: 0 },
    topReferrers: [],
  };

  try {
    const res = await fetch(`${base}/api/admin/analytics?days=7`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    const data = await res.json();
    if (data.ok) {
      analyticsData = data;
    }
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
            Site traffic and user behavior insights
          </p>
        </div>

        <AdminAnalyticsClient initialData={analyticsData} />
      </main>
    </div>
  );
}
