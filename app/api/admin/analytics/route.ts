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

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Page views by day
    const pageViewsByDayRaw = await prisma.$queryRaw<
      Array<{ date: string; views: bigint; sessions: bigint }>
    >`
      SELECT strftime('%Y-%m-%d', createdAt) as date,
             COUNT(*) as views,
             COUNT(DISTINCT sessionId) as sessions
      FROM PageView
      WHERE createdAt >= ${cutoff.toISOString()}
      GROUP BY date
      ORDER BY date ASC
    `;

    const pageViewsByDay = pageViewsByDayRaw.map((r) => ({
      date: r.date,
      views: Number(r.views),
      sessions: Number(r.sessions),
    }));

    // Device breakdown
    const allPageViews = await (prisma as any).pageView.findMany({
      where: { createdAt: { gte: cutoff } },
      select: { userAgent: true },
    });

    let mobileCount = 0;
    const mobileKeywords = [
      "mobile",
      "android",
      "iphone",
      "ipad",
      "tablet",
      "windows phone",
    ];
    for (const pv of allPageViews) {
      const ua = (pv.userAgent || "").toLowerCase();
      if (mobileKeywords.some((kw) => ua.includes(kw))) {
        mobileCount++;
      }
    }

    const totalViews = allPageViews.length;
    const mobilePercent =
      totalViews > 0 ? Math.round((mobileCount / totalViews) * 100) : 0;
    const desktopPercent = 100 - mobilePercent;

    // Top referrers
    const topReferrersRaw = await (prisma as any).pageView.groupBy({
      by: ["referrer"],
      _count: true,
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    const topReferrers = topReferrersRaw.map((r: any) => {
      const referrer = r.referrer || "";
      let label = "Direct";

      if (referrer) {
        try {
          const url = new URL(referrer);
          const domain = url.hostname || referrer;
          label = domain;
        } catch {
          label = referrer;
        }
      }

      return { referrer: label, count: r._count };
    });

    return NextResponse.json(
      {
        ok: true,
        pageViewsByDay,
        deviceBreakdown: {
          mobile: mobilePercent,
          desktop: desktopPercent,
        },
        topReferrers,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("GET /api/admin/analytics error:", err);
    logError(request, {
      severity: "error",
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
