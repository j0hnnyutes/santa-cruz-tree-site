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

    // Leads stats
    const totalLeads = await prisma.lead.count();
    const leadsByStatus = await prisma.lead.groupBy({
      by: ["status"],
      _count: true,
    });

    const statusCounts: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      CLOSED: 0,
      ARCHIVED: 0,
    };
    for (const item of leadsByStatus) {
      statusCounts[item.status as string] = item._count;
    }

    const leadsLastNDays = await prisma.lead.count({
      where: { createdAt: { gte: cutoff } },
    });

    // Errors by severity
    const errorsBySeverityRaw = await prisma.$queryRaw<
      Array<{ severity: string; count: bigint }>
    >`
      SELECT "severity", COUNT(*) as count
      FROM "ErrorLog"
      WHERE "createdAt" >= ${cutoff}
      GROUP BY "severity"
    `;

    const severityCounts: Record<string, number> = {
      critical: 0, high: 0, medium: 0, low: 0,
    };
    for (const item of errorsBySeverityRaw) {
      severityCounts[item.severity] = Number(item.count);
    }

    const errorsCountRaw = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "ErrorLog" WHERE "createdAt" >= ${cutoff}
    `;
    const errorsLastNDays = Number(errorsCountRaw[0]?.count ?? BigInt(0));

    // Top recurring errors (grouped by message+type+severity)
    const recentErrorsRaw = await prisma.$queryRaw<
      Array<{ message: string; type: string; severity: string; count: bigint }>
    >`
      SELECT "message", "type", "severity", COUNT(*) as count
      FROM "ErrorLog"
      WHERE "createdAt" >= ${cutoff}
      GROUP BY "message", "type", "severity"
      ORDER BY count DESC
      LIMIT 5
    `;

    const recentErrorsList = recentErrorsRaw.map((e) => ({
      message:  e.message,
      type:     e.type,
      severity: e.severity,
      count:    Number(e.count),
      lastSeen: new Date().toISOString(),
    }));

    // Form funnel
    const formFunnelRaw = await prisma.$queryRaw<
      Array<{ eventType: string; count: bigint }>
    >`
      SELECT "eventType", COUNT(*) as count
      FROM "FormEvent"
      WHERE "createdAt" >= ${cutoff}
      GROUP BY "eventType"
    `;

    const funnelCounts: Record<string, number> = {
      STARTED: 0, FIELD_ERROR: 0, ABANDONED: 0, SUBMITTED: 0,
    };
    for (const item of formFunnelRaw) {
      if (item.eventType in funnelCounts) funnelCounts[item.eventType] = Number(item.count);
    }

    const started = funnelCounts.STARTED || 0;
    const submitted = funnelCounts.SUBMITTED || 0;
    const conversionRate = started > 0 ? Math.round((submitted / started) * 1000) / 10 : null;

    // Top pages (all-time, by view count + avg duration)
    const topPagesRaw = await prisma.$queryRaw<
      Array<{ path: string; views: bigint; avg_duration: number | null }>
    >`
      SELECT "path", COUNT(*) as views,
             AVG(CASE WHEN duration > 0 AND duration < 600000 THEN duration END) as avg_duration
      FROM "PageView"
      GROUP BY "path"
      ORDER BY views DESC
      LIMIT 5
    `;

    const topPages = topPagesRaw.map((p) => ({
      path:        p.path,
      views:       Number(p.views),
      avgDuration: Math.round(Number(p.avg_duration) || 0),
    }));

    return NextResponse.json(
      {
        ok: true,
        leads: {
          total: totalLeads,
          byStatus: statusCounts,
          lastNDays: leadsLastNDays,
        },
        errors: {
          lastNDays: errorsLastNDays,
          bySeverity: severityCounts,
          recent: recentErrorsList,
        },
        formFunnel: {
          started,
          fieldError: funnelCounts.FIELD_ERROR,
          abandoned: funnelCounts.ABANDONED,
          submitted,
          conversionRate,
        },
        topPages,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("GET /api/admin/stats error:", err);
    logError(request, {
      severity: "high",
      type: "server_api",
      message: err instanceof Error ? err.message : "Server error fetching stats",
      stack: err instanceof Error ? err.stack : undefined,
      path: "/api/admin/stats",
    });
    return NextResponse.json(
      { ok: false, error: "Server error fetching stats" },
      { status: 500 }
    );
  }
}
