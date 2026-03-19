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
    const url  = new URL(request.url);
    const path = url.searchParams.get("path");
    if (!path) {
      return NextResponse.json({ ok: false, error: "Missing path param" }, { status: 400 });
    }

    // Date range — same logic as main analytics route
    const fromParam = url.searchParams.get("from_date");
    const toParam   = url.searchParams.get("to_date");
    const daysParam = url.searchParams.get("days");

    let cutoff: Date;
    let toDate: Date;
    let days: number;

    if (fromParam && toParam) {
      cutoff = new Date(`${fromParam}T00:00:00.000Z`);
      toDate = new Date(`${toParam}T23:59:59.999Z`);
      days   = Math.max(1, Math.round((toDate.getTime() - cutoff.getTime()) / (24 * 60 * 60 * 1000)));
    } else {
      days   = 7;
      if (daysParam) {
        const parsed = parseInt(daysParam, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 365) days = parsed;
      }
      toDate = new Date();
      cutoff = new Date(toDate.getTime() - days * 24 * 60 * 60 * 1000);
    }

    /* ── 1. Summary for this page ────────────────────────────────────── */
    const summaryRaw = await prisma.$queryRaw<
      Array<{ total_views: bigint; total_sessions: bigint; avg_duration: number | null }>
    >`
      SELECT
        COUNT(*) as total_views,
        COUNT(DISTINCT "sessionId") as total_sessions,
        AVG(CASE WHEN duration > 0 AND duration < 600000 THEN duration END) as avg_duration
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
        AND path = ${path}
    `;

    const s = summaryRaw[0] || {
      total_views:    BigInt(0) as bigint,
      total_sessions: BigInt(0) as bigint,
      avg_duration:   null,
    };
    const totalViews    = Number(s.total_views);
    const totalSessions = Number(s.total_sessions);
    const avgDuration   = s.avg_duration ? Math.round(Number(s.avg_duration)) : null;

    /* ── 2. Daily views for this page ────────────────────────────────── */
    const pvByDayRaw = await prisma.$queryRaw<
      Array<{ date: string; views: bigint; sessions: bigint }>
    >`
      SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as date,
             COUNT(*) as views,
             COUNT(DISTINCT "sessionId") as sessions
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
        AND path = ${path}
      GROUP BY date
      ORDER BY date ASC
    `;

    const pageViewsByDay = pvByDayRaw.map((r) => ({
      date:     r.date,
      views:    Number(r.views),
      sessions: Number(r.sessions),
    }));

    /* ── 3. Hourly breakdown for this page ───────────────────────────── */
    const hourlyRaw = await prisma.$queryRaw<Array<{ hour: number; views: bigint }>>`
      SELECT EXTRACT(HOUR FROM "createdAt")::int as hour, COUNT(*) as views
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
        AND path = ${path}
      GROUP BY hour
      ORDER BY hour ASC
    `;
    const hourlyMap = new Map(hourlyRaw.map((r) => [r.hour, Number(r.views)]));
    const hourlyBreakdown = Array.from({ length: 24 }, (_, h) => ({
      hour:  h,
      views: hourlyMap.get(h) ?? 0,
    }));

    /* ── 4. Top referrers to this page ───────────────────────────────── */
    const referrersRaw = await (prisma as any).pageView.groupBy({
      by: ["referrer"],
      _count: true,
      where: {
        createdAt: { gte: cutoff, lte: toDate },
        path,
      },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    });

    const topReferrers = referrersRaw.map((r: any) => {
      const ref = r.referrer || "";
      let label = "Direct / None";
      if (ref) {
        try {
          const u = new URL(ref);
          label = u.hostname || ref;
        } catch {
          label = ref;
        }
      }
      return {
        referrer: label,
        count:    r._count,
        pct:      totalViews > 0 ? Math.round((r._count / totalViews) * 100) : 0,
      };
    });

    /* ── 5. Next pages (what users visited after this page) ──────────── */
    // For each session that visited this page, find the next pageview in that session
    const nextPagesRaw = await prisma.$queryRaw<Array<{ next_path: string; visits: bigint }>>`
      SELECT next_pv.path as next_path, COUNT(*) as visits
      FROM "PageView" AS current_pv
      JOIN "PageView" AS next_pv
        ON next_pv."sessionId" = current_pv."sessionId"
        AND next_pv."createdAt" > current_pv."createdAt"
        AND next_pv."createdAt" <= current_pv."createdAt" + INTERVAL '30 minutes'
      WHERE current_pv.path = ${path}
        AND current_pv."createdAt" >= ${cutoff}
        AND current_pv."createdAt" <= ${toDate}
        AND current_pv."sessionId" IS NOT NULL
        AND next_pv.path <> ${path}
      GROUP BY next_path
      ORDER BY visits DESC
      LIMIT 8
    `;

    const nextPages = nextPagesRaw.map((r) => ({
      path:    r.next_path,
      visits:  Number(r.visits),
      pct:     totalViews > 0 ? Math.round((Number(r.visits) / totalViews) * 100) : 0,
    }));

    /* ── 6. Device split for this page ───────────────────────────────── */
    const uaRows = await (prisma as any).pageView.findMany({
      where: { createdAt: { gte: cutoff, lte: toDate }, path },
      select: { userAgent: true },
    });
    const mobileKw = ["mobile", "android", "iphone", "ipad", "tablet", "windows phone"];
    let mobileCount = 0;
    for (const pv of uaRows) {
      const ua = (pv.userAgent || "").toLowerCase();
      if (mobileKw.some((kw) => ua.includes(kw))) mobileCount++;
    }
    const mobilePercent = uaRows.length > 0 ? Math.round((mobileCount / uaRows.length) * 100) : 0;

    /* ── 7. Site-wide % share for this page ──────────────────────────── */
    const siteTotal = await (prisma as any).pageView.count({
      where: { createdAt: { gte: cutoff, lte: toDate } },
    });
    const siteSharePct = siteTotal > 0 ? Math.round((totalViews / siteTotal) * 100) : 0;

    return NextResponse.json({
      ok: true,
      path,
      days,
      summary: {
        totalViews,
        totalSessions,
        avgDuration,
        siteSharePct,
      },
      pageViewsByDay,
      hourlyBreakdown,
      topReferrers,
      nextPages,
      deviceBreakdown: {
        mobile:  mobilePercent,
        desktop: 100 - mobilePercent,
      },
    });
  } catch (err: unknown) {
    console.error("GET /api/admin/analytics/page error:", err);
    logError(request, {
      severity: "high",
      type:    "server_api",
      message: err instanceof Error ? err.message : "Server error fetching page analytics",
      stack:   err instanceof Error ? err.stack : undefined,
      path:    "/api/admin/analytics/page",
    });
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
