// app/api/admin/leads/set-status/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCsrf } from "@/lib/adminCsrf";

function toStr(v: unknown) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

export async function POST(request: NextRequest) {
  const csrf = verifyAdminCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json(
      { ok: false, error: csrf.error },
      { status: csrf.status }
    );
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const leadIds = Array.isArray(body.leadIds) ? body.leadIds : [];
  const status = toStr(body.status).trim().toUpperCase();

  if (!leadIds.length) {
    return NextResponse.json(
      { ok: false, error: "No leads selected." },
      { status: 400 }
    );
  }

  const allowed = new Set(["NEW", "CONTACTED", "CLOSED", "ARCHIVED"]);
  if (!allowed.has(status)) {
    return NextResponse.json(
      { ok: false, error: "Invalid status." },
      { status: 400 }
    );
  }

  try {
    const now = new Date();

    const result = await prisma.lead.updateMany({
      where: { leadId: { in: leadIds } },
      data: {
        status: status as any,

        // If marking CONTACTED, set contactedAt to now (otherwise clear when returning to NEW).
        contactedAt: status === "CONTACTED" ? now : status === "NEW" ? null : undefined,

        // ARCHIVED status uses archivedAt; otherwise clear it.
        archivedAt: status === "ARCHIVED" ? now : null,
      },
    });

    return NextResponse.json(
      { ok: true, updated: result.count },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/admin/leads/set-status error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error updating status." },
      { status: 500 }
    );
  }
}