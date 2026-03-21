import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logError";

// Report time-zone for daily/hourly groupings.  All page-views are stored as
// UTC in the DB; applying AT TIME ZONE means "2am Pacific" won't spill into
// the next UTC calendar day and hourly charts match the local clock the admin
// sees.  Santa Cruz, CA → America/Los_Angeles.
const REPORT_TZ = "America/Los_Angeles";

export async function GET(request: Request) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);

    // Support either ?days=N  OR  ?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD
    const fromParam = url.searchParams.get("from_date");
    const toParam   = url.searchParams.get("to_date");
    const daysParam = url.searchParams.get("days");

    let cutoff: Date;
    let toDate: Date;
    let days: number;

    if (fromParam && toParam) {
      // Custom date range — parse as start-of-day / end-of-day UTC
      cutoff = new Date(`${fromParam}T00:00:00.000Z`);
      toDate  = new Date(`${toParam}T23:59:59.999Z`);
      days    = Math.max(1, Math.round((toDate.getTime() - cutoff.getTime()) / (24 * 60 * 60 * 1000)));
    } else {
      days    = 7;
      if (daysParam) {
        const parsed = parseInt(daysParam, 10);
        if (!isNaN(parsed) && parsed > 0 && parsed <= 365) days = parsed;
      }
      toDate = new Date();
      cutoff = new Date(toDate.getTime() - days * 24 * 60 * 60 * 1000);
    }

    const prevCutoff = new Date(cutoff.getTime() - days * 24 * 60 * 60 * 1000);

    /* ── 1. Page views by day ─────────────────────────────────────────── */
    const pageViewsByDayRaw = await prisma.$queryRaw<
      Array<{ date: string; views: bigint; sessions: bigint }>
    >`
      SELECT TO_CHAR("createdAt" AT TIME ZONE ${REPORT_TZ}, 'YYYY-MM-DD') as date,
             COUNT(*) as views,
             COUNT(DISTINCT "sessionId") as sessions
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
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
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
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
        WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate} AND "sessionId" IS NOT NULL
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
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
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
      SELECT EXTRACT(HOUR FROM "createdAt" AT TIME ZONE ${REPORT_TZ})::int as hour, COUNT(*) as views
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
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
    // Broken out by iOS (iPhone/iPad), Android, other mobile, and desktop.
    const deviceRaw = await prisma.$queryRaw<
      Array<{ total_views: bigint; ios_views: bigint; android_views: bigint; other_mobile_views: bigint }>
    >`
      SELECT
        COUNT(*) as total_views,
        COUNT(CASE
          WHEN "userAgent" ILIKE '%iphone%' OR "userAgent" ILIKE '%ipad%'
          THEN 1 END) as ios_views,
        COUNT(CASE
          WHEN "userAgent" ILIKE '%android%'
          THEN 1 END) as android_views,
        COUNT(CASE
          WHEN ("userAgent" ILIKE '%mobile%' OR "userAgent" ILIKE '%tablet%' OR "userAgent" ILIKE '%windows phone%')
            AND "userAgent" NOT ILIKE '%iphone%'
            AND "userAgent" NOT ILIKE '%ipad%'
            AND "userAgent" NOT ILIKE '%android%'
          THEN 1 END) as other_mobile_views
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
    `;
    const totalForDevice    = Number(deviceRaw[0]?.total_views       ?? BigInt(0));
    const iosCount          = Number(deviceRaw[0]?.ios_views         ?? BigInt(0));
    const androidCount      = Number(deviceRaw[0]?.android_views     ?? BigInt(0));
    const otherMobileCount  = Number(deviceRaw[0]?.other_mobile_views ?? BigInt(0));
    const mobileCount       = iosCount + androidCount + otherMobileCount;
    const mobilePercent     = totalForDevice > 0 ? Math.round((mobileCount       / totalForDevice) * 100) : 0;
    const iosPercent        = totalForDevice > 0 ? Math.round((iosCount         / totalForDevice) * 100) : 0;
    const androidPercent    = totalForDevice > 0 ? Math.round((androidCount     / totalForDevice) * 100) : 0;
    const otherMobilePct    = totalForDevice > 0 ? Math.round((otherMobileCount / totalForDevice) * 100) : 0;

    /* ── 8. Top referrers ────────────────────────────────────────────── */
    // Derive the site's own hostname from SITE_URL (or fall back to a known
    // production hostname) so we can exclude internal referrers that were
    // written before the write-time null-out was in place.
    const siteHostname = (() => {
      try {
        return new URL(process.env.SITE_URL || "https://santacruztreepros.com").hostname;
      } catch {
        return "santacruztreepros.com";
      }
    })();

    const topReferrersRaw = await prisma.$queryRaw<
      Array<{ referrer: string | null; views: bigint }>
    >`
      SELECT "referrer", COUNT(*) as views
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
        AND (
          "referrer" IS NULL
          OR "referrer" NOT LIKE ${'%' + siteHostname + '%'}
        )
      GROUP BY "referrer"
      ORDER BY views DESC
      LIMIT 10
    `;

    const topReferrers = topReferrersRaw.map((r) => {
      const referrer = r.referrer ?? "";
      const count    = Number(r.views);
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
        count,
        pct: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
      };
    });

    /* ── 9. Form conversion funnel ───────────────────────────────────── */
    const formFunnelRaw = await prisma.$queryRaw<
      Array<{ eventType: string; count: bigint }>
    >`
      SELECT "eventType", COUNT(*) as count
      FROM "FormEvent"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
      GROUP BY "eventType"
    `;

    const funnelCounts: Record<string, number> = {
      STARTED: 0, SUBMITTED: 0, ABANDONED: 0, FIELD_ERROR: 0,
    };
    for (const f of formFunnelRaw) {
      if (f.eventType in funnelCounts) funnelCounts[f.eventType] = Number(f.count);
    }

    // Top fields that trigger validation errors
    const fieldErrorsRaw = await prisma.$queryRaw<
      Array<{ fieldName: string | null; count: bigint }>
    >`
      SELECT "fieldName", COUNT(*) as count
      FROM "FormEvent"
      WHERE "eventType" = 'FIELD_ERROR'
        AND "fieldName" IS NOT NULL
        AND "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
      GROUP BY "fieldName"
      ORDER BY count DESC
      LIMIT 5
    `;

    const topFieldErrors = fieldErrorsRaw.map((f) => ({
      field: f.fieldName || "unknown",
      count: Number(f.count),
    }));

    const conversionRate = funnelCounts.STARTED > 0
      ? Math.round((funnelCounts.SUBMITTED / funnelCounts.STARTED) * 100)
      : 0;

    const abandonRate = funnelCounts.STARTED > 0
      ? Math.round((funnelCounts.ABANDONED / funnelCounts.STARTED) * 100)
      : 0;

    const formFunnel = {
      started:        funnelCounts.STARTED,
      submitted:      funnelCounts.SUBMITTED,
      abandoned:      funnelCounts.ABANDONED,
      fieldErrors:    funnelCounts.FIELD_ERROR,
      conversionRate,
      abandonRate,
      topFieldErrors,
    };

    /* ── 10. UTM breakdown ───────────────────────────────────────────── */
    const utmSourceRaw = await prisma.$queryRaw<Array<{ source: string | null; views: bigint }>>`
      SELECT "utmSource" as source, COUNT(*) as views
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
        AND "utmSource" IS NOT NULL AND "utmSource" <> ''
      GROUP BY "utmSource"
      ORDER BY views DESC
      LIMIT 10
    `;

    const utmMediumRaw = await prisma.$queryRaw<Array<{ medium: string | null; views: bigint }>>`
      SELECT "utmMedium" as medium, COUNT(*) as views
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
        AND "utmMedium" IS NOT NULL AND "utmMedium" <> ''
      GROUP BY "utmMedium"
      ORDER BY views DESC
      LIMIT 10
    `;

    const utmCampaignRaw = await prisma.$queryRaw<Array<{ campaign: string | null; views: bigint }>>`
      SELECT "utmCampaign" as campaign, COUNT(*) as views
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
        AND "utmCampaign" IS NOT NULL AND "utmCampaign" <> ''
      GROUP BY "utmCampaign"
      ORDER BY views DESC
      LIMIT 10
    `;

    const utmTotalRaw = await prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT COUNT(*) as total FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
        AND "utmSource" IS NOT NULL AND "utmSource" <> ''
    `;
    const utmTotal = Number((utmTotalRaw[0] || { total: BigInt(0) as bigint }).total);

    const utmBreakdown = {
      totalTracked: utmTotal,
      sources:   utmSourceRaw.map((r) => ({ label: r.source ?? "", views: Number(r.views), pct: utmTotal > 0 ? Math.round((Number(r.views) / utmTotal) * 100) : 0 })),
      mediums:   utmMediumRaw.map((r) => ({ label: r.medium ?? "", views: Number(r.views), pct: utmTotal > 0 ? Math.round((Number(r.views) / utmTotal) * 100) : 0 })),
      campaigns: utmCampaignRaw.map((r) => ({ label: r.campaign ?? "", views: Number(r.views), pct: utmTotal > 0 ? Math.round((Number(r.views) / utmTotal) * 100) : 0 })),
    };

    /* ── 11. Geographic breakdown ────────────────────────────────────── */
    const geoCountryRaw = await prisma.$queryRaw<Array<{ country: string | null; views: bigint }>>`
      SELECT country, COUNT(*) as views
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
        AND country IS NOT NULL AND country <> ''
      GROUP BY country
      ORDER BY views DESC
      LIMIT 15
    `;

    const geoCityRaw = await prisma.$queryRaw<Array<{ city: string | null; country: string | null; views: bigint }>>`
      SELECT city, country, COUNT(*) as views
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
        AND city IS NOT NULL AND city <> ''
      GROUP BY city, country
      ORDER BY views DESC
      LIMIT 10
    `;

    const geoTotalRaw = await prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT COUNT(*) as total FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
        AND country IS NOT NULL AND country <> ''
    `;
    const geoTotal = Number((geoTotalRaw[0] || { total: BigInt(0) as bigint }).total);

    const geoBreakdown = {
      totalTracked: geoTotal,
      countries: geoCountryRaw.map((r) => ({
        code:  r.country ?? "",
        views: Number(r.views),
        pct:   geoTotal > 0 ? Math.round((Number(r.views) / geoTotal) * 100) : 0,
      })),
      cities: geoCityRaw.map((r) => ({
        city:    r.city ?? "",
        country: r.country ?? "",
        views:   Number(r.views),
        pct:     geoTotal > 0 ? Math.round((Number(r.views) / geoTotal) * 100) : 0,
      })),
    };

    /* ── 12. Scroll depth distribution ──────────────────────────────── */
    // Counts pageviews (with recorded scroll depth) that reached each
    // threshold. Threshold buckets are cumulative — a 75% reader is also
    // counted in the 25% and 50% buckets.
    const scrollRaw = await prisma.$queryRaw<
      Array<{ avg_depth: number | null; reached_25: bigint; reached_50: bigint; reached_75: bigint; reached_100: bigint; total: bigint }>
    >`
      SELECT
        AVG("maxScrollDepth")                                              AS avg_depth,
        COUNT(CASE WHEN "maxScrollDepth" >= 25  THEN 1 END)               AS reached_25,
        COUNT(CASE WHEN "maxScrollDepth" >= 50  THEN 1 END)               AS reached_50,
        COUNT(CASE WHEN "maxScrollDepth" >= 75  THEN 1 END)               AS reached_75,
        COUNT(CASE WHEN "maxScrollDepth" >= 100 THEN 1 END)               AS reached_100,
        COUNT(*)                                                           AS total
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
        AND "maxScrollDepth" IS NOT NULL
    `;

    const sd      = scrollRaw[0];
    const sdTotal = Number(sd?.total ?? BigInt(0));
    const scrollDepthStats = {
      avgDepth:    sd?.avg_depth != null ? Math.round(Number(sd.avg_depth)) : null,
      totalWithData: sdTotal,
      thresholds: {
        pct25:  sdTotal > 0 ? Math.round((Number(sd?.reached_25  ?? BigInt(0)) / sdTotal) * 100) : 0,
        pct50:  sdTotal > 0 ? Math.round((Number(sd?.reached_50  ?? BigInt(0)) / sdTotal) * 100) : 0,
        pct75:  sdTotal > 0 ? Math.round((Number(sd?.reached_75  ?? BigInt(0)) / sdTotal) * 100) : 0,
        pct100: sdTotal > 0 ? Math.round((Number(sd?.reached_100 ?? BigInt(0)) / sdTotal) * 100) : 0,
      },
    };

    /* ── 13. New vs returning visitor breakdown ──────────────────────── */
    const visitorTypeRaw = await prisma.$queryRaw<
      Array<{ is_new: boolean | null; sessions: bigint }>
    >`
      SELECT "isNewVisitor" as is_new, COUNT(DISTINCT "sessionId") as sessions
      FROM "PageView"
      WHERE "createdAt" >= ${cutoff} AND "createdAt" <= ${toDate}
        AND "sessionId" IS NOT NULL
        AND "isNewVisitor" IS NOT NULL
      GROUP BY "isNewVisitor"
    `;

    let newSessions       = 0;
    let returningSessions = 0;
    for (const r of visitorTypeRaw) {
      if (r.is_new === true)  newSessions       = Number(r.sessions);
      if (r.is_new === false) returningSessions = Number(r.sessions);
    }
    const visitorTotal = newSessions + returningSessions;
    const visitorBreakdown = {
      new:       newSessions,
      returning: returningSessions,
      newPct:       visitorTotal > 0 ? Math.round((newSessions       / visitorTotal) * 100) : 0,
      returningPct: visitorTotal > 0 ? Math.round((returningSessions / visitorTotal) * 100) : 0,
    };

    /* ── Response ────────────────────────────────────────────────────── */
    return NextResponse.json(
      {
        ok: true,
        days,
        fromDate: cutoff.toISOString().slice(0, 10),
        toDate:   toDate.toISOString().slice(0, 10),
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
          mobile:      mobilePercent,
          desktop:     100 - mobilePercent,
          ios:         iosPercent,
          android:     androidPercent,
          otherMobile: otherMobilePct,
        },
        topReferrers,
        formFunnel,
        utmBreakdown,
        geoBreakdown,
        scrollDepthStats,
        visitorBreakdown,
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
