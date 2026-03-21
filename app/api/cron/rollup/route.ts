/**
 * Nightly data retention cron — called by Vercel Cron (see vercel.json).
 *
 * What it does:
 *   1. Finds every calendar day older than RAW_RETENTION_DAYS that still has
 *      raw PageView rows and has NOT yet been rolled up into DailyRollup.
 *   2. For each such day, computes aggregate stats and upserts a DailyRollup row.
 *   3. Deletes all raw PageView rows for that day (storage freed).
 *   4. Deletes ErrorLog rows older than ERROR_RETENTION_DAYS (errors have no
 *      long-term value once resolved).
 *
 * FormEvent rows are kept indefinitely — they represent conversion funnel data
 * that has ongoing business value.
 *
 * Auth: Vercel sets the Authorization header to "Bearer <CRON_SECRET>" when
 * invoking cron routes. Any other caller without the secret gets 401.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logError";

const RAW_RETENTION_DAYS  = 730; // PageView raw rows kept for this many days (~2 years)
const ERROR_RETENTION_DAYS = 30; // ErrorLog rows kept for this many days
const REPORT_TZ = "America/Los_Angeles";

export const maxDuration = 60; // Vercel max for hobby plan

function localDateStr(d: Date): string {
  // Returns YYYY-MM-DD in America/Los_Angeles
  return d.toLocaleDateString("en-CA", { timeZone: REPORT_TZ });
}

export async function GET(request: Request) {
  // Verify Vercel cron secret (or CRON_SECRET env for manual calls)
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const results: string[] = [];

    /* ── 1. Find days that need to be rolled up ─────────────────────── */
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RAW_RETENTION_DAYS);
    // Zero out time so we only delete complete days
    cutoffDate.setHours(0, 0, 0, 0);

    // Distinct local dates (in report timezone) that have raw rows older than cutoff
    const pendingDays = await prisma.$queryRaw<Array<{ local_date: string }>>`
      SELECT DISTINCT
        TO_CHAR("createdAt" AT TIME ZONE ${REPORT_TZ}, 'YYYY-MM-DD') as local_date
      FROM "PageView"
      WHERE "createdAt" < ${cutoffDate}
      ORDER BY local_date ASC
    `;

    results.push(`Found ${pendingDays.length} days to roll up`);

    /* ── 2. Roll up each day ─────────────────────────────────────────── */
    for (const { local_date } of pendingDays) {
      try {
        // Skip if already rolled up (idempotent)
        const existing = await prisma.dailyRollup.findUnique({ where: { date: local_date } });
        if (existing) {
          // Day already rolled up — just delete the raw rows
          await prisma.$executeRaw`
            DELETE FROM "PageView"
            WHERE TO_CHAR("createdAt" AT TIME ZONE ${REPORT_TZ}, 'YYYY-MM-DD') = ${local_date}
              AND "createdAt" < ${cutoffDate}
          `;
          results.push(`${local_date}: already rolled up, raw rows deleted`);
          continue;
        }

        // Aggregate core metrics for this day
        const [coreRaw] = await prisma.$queryRaw<Array<{
          views: bigint;
          sessions: bigint;
          avg_duration: number | null;
          bounce_count: bigint;
          new_sessions: bigint;
          return_sessions: bigint;
          mobile_views: bigint;
          desktop_views: bigint;
        }>>`
          SELECT
            COUNT(*)                                                          AS views,
            COUNT(DISTINCT "sessionId")                                       AS sessions,
            AVG(CASE WHEN duration > 0 AND duration < 600000 THEN duration END)::int AS avg_duration,
            COUNT(DISTINCT CASE
              WHEN "sessionId" IN (
                SELECT "sessionId" FROM "PageView" p2
                WHERE p2."sessionId" = "PageView"."sessionId"
                  AND TO_CHAR(p2."createdAt" AT TIME ZONE ${REPORT_TZ}, 'YYYY-MM-DD') = ${local_date}
                GROUP BY p2."sessionId"
                HAVING COUNT(*) = 1
              ) THEN "sessionId" END)                                         AS bounce_count,
            COUNT(DISTINCT CASE WHEN "isNewVisitor" = true  THEN "sessionId" END) AS new_sessions,
            COUNT(DISTINCT CASE WHEN "isNewVisitor" = false THEN "sessionId" END) AS return_sessions,
            COUNT(CASE WHEN LOWER("userAgent") ~ 'mobile|android|iphone|ipad' THEN 1 END) AS mobile_views,
            COUNT(CASE WHEN LOWER("userAgent") !~ 'mobile|android|iphone|ipad' THEN 1 END) AS desktop_views
          FROM "PageView"
          WHERE TO_CHAR("createdAt" AT TIME ZONE ${REPORT_TZ}, 'YYYY-MM-DD') = ${local_date}
        `;

        // Top 10 pages
        const topPagesRaw = await prisma.$queryRaw<Array<{ path: string; views: bigint }>>`
          SELECT "path", COUNT(*) as views
          FROM "PageView"
          WHERE TO_CHAR("createdAt" AT TIME ZONE ${REPORT_TZ}, 'YYYY-MM-DD') = ${local_date}
          GROUP BY "path"
          ORDER BY views DESC
          LIMIT 10
        `;

        // Top 10 referrers (external only)
        const siteHostname = (() => {
          try { return new URL(process.env.SITE_URL || "https://santacruztreepros.com").hostname; }
          catch { return "santacruztreepros.com"; }
        })();
        const topReferrersRaw = await prisma.$queryRaw<Array<{ referrer: string | null; views: bigint }>>`
          SELECT "referrer", COUNT(*) as views
          FROM "PageView"
          WHERE TO_CHAR("createdAt" AT TIME ZONE ${REPORT_TZ}, 'YYYY-MM-DD') = ${local_date}
            AND ("referrer" IS NULL OR "referrer" NOT LIKE ${'%' + siteHostname + '%'})
          GROUP BY "referrer"
          ORDER BY views DESC
          LIMIT 10
        `;

        // Top UTM sources
        const utmRaw = await prisma.$queryRaw<Array<{
          source: string | null; medium: string | null; campaign: string | null; views: bigint;
        }>>`
          SELECT "utmSource" as source, "utmMedium" as medium, "utmCampaign" as campaign, COUNT(*) as views
          FROM "PageView"
          WHERE TO_CHAR("createdAt" AT TIME ZONE ${REPORT_TZ}, 'YYYY-MM-DD') = ${local_date}
            AND "utmSource" IS NOT NULL
          GROUP BY "utmSource", "utmMedium", "utmCampaign"
          ORDER BY views DESC
          LIMIT 10
        `;

        // Upsert rollup row
        await prisma.dailyRollup.upsert({
          where: { date: local_date },
          create: {
            date:          local_date,
            views:         Number(coreRaw.views),
            sessions:      Number(coreRaw.sessions),
            avgDuration:   coreRaw.avg_duration ?? null,
            bounceCount:   Number(coreRaw.bounce_count),
            newSessions:   Number(coreRaw.new_sessions),
            returnSessions: Number(coreRaw.return_sessions),
            mobileViews:   Number(coreRaw.mobile_views),
            desktopViews:  Number(coreRaw.desktop_views),
            topPages:      JSON.stringify(topPagesRaw.map(r => ({ path: r.path, views: Number(r.views) }))),
            topReferrers:  JSON.stringify(topReferrersRaw.map(r => ({
              referrer: r.referrer ?? null, views: Number(r.views),
            }))),
            utmSources:    JSON.stringify(utmRaw.map(r => ({
              source: r.source, medium: r.medium, campaign: r.campaign, views: Number(r.views),
            }))),
          },
          update: {
            // Re-compute if called again (shouldn't happen, but safe)
            views:         Number(coreRaw.views),
            sessions:      Number(coreRaw.sessions),
            avgDuration:   coreRaw.avg_duration ?? null,
            bounceCount:   Number(coreRaw.bounce_count),
            newSessions:   Number(coreRaw.new_sessions),
            returnSessions: Number(coreRaw.return_sessions),
            mobileViews:   Number(coreRaw.mobile_views),
            desktopViews:  Number(coreRaw.desktop_views),
            topPages:      JSON.stringify(topPagesRaw.map(r => ({ path: r.path, views: Number(r.views) }))),
            topReferrers:  JSON.stringify(topReferrersRaw.map(r => ({
              referrer: r.referrer ?? null, views: Number(r.views),
            }))),
            utmSources:    JSON.stringify(utmRaw.map(r => ({
              source: r.source, medium: r.medium, campaign: r.campaign, views: Number(r.views),
            }))),
          },
        });

        // Delete raw rows for this day
        const deleted = await prisma.$executeRaw`
          DELETE FROM "PageView"
          WHERE TO_CHAR("createdAt" AT TIME ZONE ${REPORT_TZ}, 'YYYY-MM-DD') = ${local_date}
            AND "createdAt" < ${cutoffDate}
        `;

        results.push(`${local_date}: rolled up (${Number(coreRaw.views)} views, ${deleted} rows deleted)`);
      } catch (dayErr) {
        const msg = dayErr instanceof Error ? dayErr.message : String(dayErr);
        results.push(`${local_date}: ERROR — ${msg}`);
        logError(null, {
          severity: "high",
          type: "server_api",
          message: `Daily rollup failed for ${local_date}: ${msg}`,
          path: "/api/cron/rollup",
        });
      }
    }

    /* ── 3. Purge old ErrorLog rows ──────────────────────────────────── */
    const errorCutoff = new Date();
    errorCutoff.setDate(errorCutoff.getDate() - ERROR_RETENTION_DAYS);

    const errorDeleted = await prisma.$executeRaw`
      DELETE FROM "ErrorLog" WHERE "createdAt" < ${errorCutoff}
    `;
    results.push(`ErrorLog: deleted ${errorDeleted} rows older than ${ERROR_RETENTION_DAYS} days`);

    return NextResponse.json({ ok: true, results }, { status: 200 });
  } catch (err) {
    console.error("Cron rollup error:", err);
    logError(null, {
      severity: "critical",
      type: "server_api",
      message: err instanceof Error ? err.message : "Cron rollup threw unexpectedly",
      stack: err instanceof Error ? err.stack : undefined,
      path: "/api/cron/rollup",
    });
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
