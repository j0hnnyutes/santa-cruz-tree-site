import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logError";

export async function GET(request: Request) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const daysParam = url.searchParams.get("days");
    let days = 7;

    if (daysParam) {
      const parsed = parseInt(daysParam, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 90) {
        days = parsed;
      }
    }

    const now = new Date();
    const cutoff     = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevCutoff = new Date(cutoff.getTime() - days * 24 * 60 * 60 * 1000);

    /* ── 1. Page views by day ─────────────────────────────────────────── */
    const pageViewsByDayRaw = await prisma.$queryRaw<
      Array<{ date: string; views: bigint; sessions: bigint }>
    >`
      SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date,
             COUNT(*) as views,
             COUNT(DISTINCT "sessionId") as sessions
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff}
      GROUP BY date
      ORDER BY date ASC
    `;

    const pageViewsByDay = pageViewsByDayRaw.map((r) => ({
      date:     r.date,
      views:    Number(r.views),
      sessions: Number(r.sessions),
    }));

    /* ── 2. Summary stats (current period) ───────────────────────────── */
    const summaryRaw = await prisma.$queryRaw<
      Array<{ total_views: bigint; total_sessions: bigint; avg_duration: number | null }>
    >`
      SELECT
        COUNT(*) as total_views,
        COUNT(DISTINCT "sessionId") as total_sessions,
        AVG(CASE WHEN duration > 0 AND duration < 600000 THEN duration END) as avg_duration
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff}
    `;

    const s = summaryRaw[0] || { total_views: BigInt(0) as bigint, total_sessions: BigInt(0) as bigint, avg_duration: null };
    const totalViews    = Number(s.total_views);
    const totalSessions = Number(s.total_sessions);
    const avgDuration   = s.avg_duration ? Math.round(Number(s.avg_duration)) : null;

    /* ── 3. Bounce rate (sessions with exactly 1 pageview) ───────────── */
    const bounceRaw = await prisma.$queryRaw<Array<{ bounce_count: bigint }>>`
      SELECT COUNT(*) as bounce_count FROM (
        SELECT "sessionId"
        FROM "PageView"
        WHERE "createdAt" >= ${cutoff} AND "sessionId" IS NOT NULL
        GROUP BY "sessionId"
        HAVING COUNT(*) = 1
      ) t
    `;
    const bounceCount = Number((bounceRaw[0] || { bounce_count: BigInt(0) as bigint }).bounce_count);
    const bounceRate  = totalSessions > 0 ? Math.round((bounceCount / totalSessions) * 100) : 0;

    /* ── 4. Previous period — for trend comparison ───────────────────── */
    const prevRaw = await prisma.$queryRaw<
      Array<{ total_views: bigint; total_sessions: bigint }>
    >`
      SELECT COUNT(*) as total_views, COUNT(DISTINCT "sessionId") as total_sessions
      FROM "PageView"
      WHERE "createdAt" >= ${prevCutoff} AND "createdAt" < ${cutoff}
    `;
    const p = prevRaw[0] || { total_views: BigInt(0) as bigint, total_sessions: BigInt(0) as bigint };
    const prevViews    = Number(p.total_views);
    const prevSessions = Number(p.total_sessions);

    const pct = (curr: number, prev: number) =>
      prev === 0 ? null : Math.round(((curr - prev) / prev) * 100);

    /* ── 5. Top pages ────────────────────────────────────────────────── */
    const topPagesRaw = await prisma.$queryRaw<Array<{ path: string; views: bigint }>>`
      SELECT path, COUNT(*) as views
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff}
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `;
    const topPages = topPagesRaw.map((r) => ({
      path:  r.path,
      views: Number(r.views),
      pct:   totalViews > 0 ? Math.round((Number(r.views) / totalViews) * 100) : 0,
    }));

    /* ── 6. Hourly breakdown (0–23) ──────────────────────────────────── */
    const hourlyRaw = await prisma.$queryRaw<Array<{ hour: number; views: bigint }>>`
      SELECT EXTRACT(HOUR FROM "createdAt")::int as hour, COUNT(*) as views
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff}
      GROUP BY hour
      ORDER BY hour ASC
    `;
    // Fill all 24 hours, even if some have 0
    const hourlyMap = new Map(hourlyRaw.map((r) => [r.hour, Number(r.views)]));
    const hourlyBreakdown = Array.from({ length: 24 }, (_, h) => ({
      hour:  h,
      views: hourlyMap.get(h) ?? 0,
    }));

    /* ── 7. Device breakdown ─────────────────────────────────────────── */
    const allPageViews = await (prisma as any).pageView.findMany({
      where: { createdAt: { gte: cutoff } },
      select: { userAgent: true },
    });

    const mobileKeywords = ["mobile", "android", "iphone", "ipad", "tablet", "windows phone"];
    let mobileCount = 0;
    for (const pv of allPageViews) {
      const ua = (pv.userAgent || "").toLowerCase();
      if (mobileKeywords.some((kw) => ua.includes(kw))) mobileCount++;
    }
    const totalForDevice = allPageViews.length;
    const mobilePercent  = totalForDevice > 0 ? Math.round((mobileCount / totalForDevice) * 100) : 0;

    /* ── 8. Top referrers ────────────────────────────────────────────── */
    const topReferrersRaw = await (prisma as any).pageView.groupBy({
      by: ["referrer"],
      _count: true,
      where: { createdAt: { gte: cutoff } },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const topReferrers = topReferrersRaw.map((r: any) => {
      const referrer = r.referrer || "";
      let label = "Direct / None";
      if (referrer) {
        try {
          const u = new URL(referrer);
          label = u.hostname || referrer;
        } catch {
          label = referrer;
        }
      }
      return {
        referrer: label,
        count: r._count,
        pct: totalViews > 0 ? Math.round((r._count / totalViews) * 100) : 0,
      };
    });

    /* ── Response ────────────────────────────────────────────────────── */
    return NextResponse.json(
      {
        ok: true,
        days,
        summary: {
          totalViews,
          totalSessions,
          avgDuration,
          bounceRate,
          trends: {
            views:    pct(totalViews, prevViews),
            sessions: pct(totalSessions, prevSessions),
          },
        },
        pageViewsByDay,
        topPages,
        hourlyBreakdown,
        deviceBreakdown: {
          mobile:  mobilePercent,
          desktop: 100 - mobilePercent,
        },
        topReferrers,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("GET /api/admin/analytics error:", err);
    logError(request, {
      severity: "high",
      type: "server_api",
      message: err instanceof Error ? err.message : "Server error fetching analytics",
      stack: err instanceof Error ? err.stack : undefined,
      path: "/api/admin/analytics",
    });
    return NextResponse.json(
      { ok: false, error: "Server error fetching analytics" },
      { status: 500 }
    );
  }
}
