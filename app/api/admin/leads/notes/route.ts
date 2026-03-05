// app/api/admin/leads/notes/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCsrf } from "@/lib/adminCsrf";

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

  const leadId = typeof body.leadId === "string" ? body.leadId.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (!leadId) {
    return NextResponse.json(
      { ok: false, error: "Missing leadId." },
      { status: 400 }
    );
  }

  try {
    // Get current notes for audit trail
    const existing = await prisma.lead.findUnique({
      where: { leadId },
      select: { adminNotes: true },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Lead not found." },
        { status: 404 }
      );
    }

    // Update notes
    await prisma.lead.update({
      where: { leadId },
      data: { adminNotes: notes || null },
    });

    // Log the event
    const oldNotes = existing.adminNotes || "(empty)";
    const newNotes = notes || "(empty)";
    await prisma.leadEvent.create({
      data: {
        leadId,
        action: "NOTES_UPDATED",
        detail: `Changed from: ${oldNotes.slice(0, 100)}${oldNotes.length > 100 ? "..." : ""}`,
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("POST /api/admin/leads/notes error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error saving notes." },
      { status: 500 }
    );
  }
}
