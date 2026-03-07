import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

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
    const errorsBySeverity = await (prisma as any).errorLog.groupBy({
      by: ["severity"],
      where: { createdAt: { gte: cutoff } },
      _count: true,
    });

    const severityCounts: Record<string, number> = {
      error: 0,
      warning: 0,
      critical: 0,
    };
    for (const item of errorsBySeverity) {
      severityCounts[item.severity] = item._count;
    }

    const errorsLastNDays = await (prisma as any).errorLog.count({
      where: { createdAt: { gte: cutoff } },
    });

    // Recent errors
    const recentErrors = await (prisma as any).errorLog.groupBy({
      by: ["message", "type", "severity"],
      where: { createdAt: { gte: cutoff } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const recentErrorsList = recentErrors.map((e: any) => ({
      message: e.message,
      type: e.type,
      severity: e.severity,
      count: e._count.id,
      lastSeen: new Date().toISOString(),
    }));

    // Form funnel
    const formFunnelRaw = await (prisma as any).formEvent.groupBy({
      by: ["eventType"],
      where: { createdAt: { gte: cutoff } },
      _count: true,
    });

    const funnelCounts: Record<string, number> = {
      STARTED: 0,
      FIELD_ERROR: 0,
      ABANDONED: 0,
      SUBMITTED: 0,
    };
    for (const item of formFunnelRaw) {
      if (item.eventType in funnelCounts) {
        funnelCounts[item.eventType] = item._count;
      }
    }

    const started = funnelCounts.STARTED || 0;
    const submitted = funnelCounts.SUBMITTED || 0;
    const conversionRate = started > 0 ? Math.round((submitted / started) * 1000) / 10 : null;

    // Top pages
    const topPagesRaw = await (prisma as any).pageView.groupBy({
      by: ["path"],
      _count: { id: true },
      _avg: { duration: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    const topPages = topPagesRaw.map((p: any) => ({
      path: p.path,
      views: p._count.id,
      avgDuration: Math.round(p._avg.duration || 0),
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
    return NextResponse.json(
      { ok: false, error: "Server error fetching stats" },
      { status: 500 }
    );
  }
}
