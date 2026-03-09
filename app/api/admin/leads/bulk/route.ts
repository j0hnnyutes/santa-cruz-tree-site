// app/api/admin/leads/bulk/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCsrf } from "@/lib/adminCsrf";
import { logError } from "@/lib/logError";

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
  const action = toStr(body.action).trim().toUpperCase();

  if (!leadIds.length) {
    return NextResponse.json(
      { ok: false, error: "No leads selected." },
      { status: 400 }
    );
  }

  if (action !== "ARCHIVE") {
    return NextResponse.json(
      { ok: false, error: "Invalid bulk action." },
      { status: 400 }
    );
  }

  try {
    const now = new Date();

    const result = await prisma.lead.updateMany({
      where: { leadId: { in: leadIds } },
      data: { archivedAt: now, status: "ARCHIVED" as any },
    });

    return NextResponse.json(
      { ok: true, updated: result.count },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/admin/leads/bulk error:", err);
    logError(request, {
      severity: "error",
      type: "server_api",
      message: err instanceof Error ? err.message : "Server error performing bulk action",
      stack: err instanceof Error ? err.stack : undefined,
      path: "/api/admin/leads/bulk",
    });
    return NextResponse.json(
      { ok: false, error: "Server error performing bulk action." },
      { status: 500 }
    );
  }
}