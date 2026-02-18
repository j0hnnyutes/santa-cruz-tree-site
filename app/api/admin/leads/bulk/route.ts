import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const isAuthed = await isAdminAuthenticated();

  if (!isAuthed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { leadIds, status } = body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No lead IDs provided" },
        { status: 400 }
      );
    }

    if (!["NEW", "CONTACTED", "CLOSED"].includes(status)) {
      return NextResponse.json(
        { ok: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    const result = await prisma.lead.updateMany({
      where: {
        leadId: { in: leadIds },
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      ok: true,
      updatedCount: result.count,
    });
  } catch (err) {
    console.error("Bulk update error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}