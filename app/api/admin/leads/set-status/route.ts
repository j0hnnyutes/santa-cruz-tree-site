import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";

const STATUSES = ["NEW", "CONTACTED", "CLOSED", "ARCHIVED"] as const;
type Status = (typeof STATUSES)[number];

function isStatus(v: unknown): v is Status {
  return typeof v === "string" && (STATUSES as readonly string[]).includes(v);
}

export async function POST(req: NextRequest) {
  try {
    const isAuthed = await isAdminAuthenticated();
    if (!isAuthed) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({} as any));
    const leadIds = Array.isArray(body?.leadIds) ? body.leadIds : [];
    const status = body?.status;

    const cleanIds = leadIds
      .filter((x: unknown) => typeof x === "string")
      .map((s: string) => s.trim())
      .filter(Boolean);

    if (cleanIds.length === 0) {
      return Response.json({ ok: false, error: "No leadIds provided." }, { status: 400 });
    }

    if (!isStatus(status)) {
      return Response.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }

    // Archive timestamp rules:
    // - ARCHIVED => archivedAt = now
    // - otherwise => archivedAt = null
    const now = new Date();
    const data =
      status === "ARCHIVED"
        ? { status: "ARCHIVED" as const, archivedAt: now }
        : { status, archivedAt: null };

    const result = await prisma.lead.updateMany({
      where: { leadId: { in: cleanIds } },
      data,
    });

    return Response.json({
      ok: true,
      updatedCount: result.count,
      status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}