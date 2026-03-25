import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/adminAuth";
import { logError } from "@/lib/logError";
import { del } from "@vercel/blob";

// ── Helpers ───────────────────────────────────────────────────────────────────

function normaliseEmail(raw: string) {
  return raw.trim().toLowerCase();
}

// ── GET /api/admin/privacy?email=... ─────────────────────────────────────────
// Returns a preview of all data we hold for the given email address.
// Does NOT mutate anything.

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = req.nextUrl.searchParams.get("email")?.trim();
  if (!email) {
    return NextResponse.json({ error: "email query param required" }, { status: 400 });
  }

  try {
    const normalised = normaliseEmail(email);

    const leads = await prisma.lead.findMany({
      where: { email: { equals: normalised, mode: "insensitive" } },
      select: {
        leadId: true,
        createdAt: true,
        fullName: true,
        email: true,
        phoneDigits: true,
        address: true,
        city: true,
        service: true,
        photoUrls: true,
        sessionId: true,
        _count: { select: { events: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Count linked analytics records
    const sessionIds = leads.map((l) => l.sessionId).filter(Boolean) as string[];
    const [pageViewCount, formEventCount] = await Promise.all([
      sessionIds.length
        ? prisma.pageView.count({ where: { sessionId: { in: sessionIds } } })
        : Promise.resolve(0),
      sessionIds.length
        ? prisma.formEvent.count({ where: { sessionId: { in: sessionIds } } })
        : Promise.resolve(0),
    ]);

    const summary = leads.map((l) => ({
      leadId: l.leadId,
      createdAt: l.createdAt,
      fullName: l.fullName,
      email: l.email,
      phone: l.phoneDigits,
      address: l.address,
      city: l.city,
      service: l.service,
      photoCount: l.photoUrls.length,
      eventCount: l._count.events,
      sessionId: l.sessionId ?? null,
    }));

    return NextResponse.json({
      email: normalised,
      leadCount: leads.length,
      leads: summary,
      sessionIds,
      pageViewCount,
      formEventCount,
      totalPhotoCount: leads.reduce((n, l) => n + l.photoUrls.length, 0),
    });
  } catch (err) {
    logError(req, {
      severity: "high",
      type: "server_api",
      message: `Privacy lookup failed for ${email}: ${String(err)}`,
    });
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}

// ── DELETE /api/admin/privacy ─────────────────────────────────────────────────
// Permanently removes all data for the given email:
//   • Lead rows (LeadEvent rows cascade automatically)
//   • PageView + FormEvent rows linked via sessionId
//   • Vercel Blob photos attached to each lead
//
// Body: { email: string }

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminAuth({ enforceCsrf: true });
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "email required in request body" }, { status: 400 });
  }

  try {
    const normalised = normaliseEmail(email);

    // 1. Fetch leads to collect photo URLs and session IDs before deleting
    const leads = await prisma.lead.findMany({
      where: { email: { equals: normalised, mode: "insensitive" } },
      select: { leadId: true, photoUrls: true, sessionId: true, fullName: true, createdAt: true },
    });

    if (leads.length === 0) {
      return NextResponse.json({ ok: true, message: "No records found for that email.", deletedLeads: 0 });
    }

    const allPhotoUrls = leads.flatMap((l) => l.photoUrls);
    const sessionIds = leads.map((l) => l.sessionId).filter(Boolean) as string[];
    const leadIds = leads.map((l) => l.leadId);

    // 2. Delete Vercel Blob photos (best-effort — don't fail the whole request if a URL is gone)
    let photosDeleted = 0;
    let photosFailedCount = 0;
    if (allPhotoUrls.length > 0) {
      const blobToken = process.env.BLOB2_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
      if (blobToken) {
        const results = await Promise.allSettled(
          allPhotoUrls.map((url) => del(url, { token: blobToken }))
        );
        results.forEach((r) => {
          if (r.status === "fulfilled") photosDeleted++;
          else photosFailedCount++;
        });
      }
    }

    // 3. Delete analytics records linked by sessionId
    const [pageViewsDeleted, formEventsDeleted] = await Promise.all([
      sessionIds.length
        ? prisma.pageView.deleteMany({ where: { sessionId: { in: sessionIds } } })
        : Promise.resolve({ count: 0 }),
      sessionIds.length
        ? prisma.formEvent.deleteMany({ where: { sessionId: { in: sessionIds } } })
        : Promise.resolve({ count: 0 }),
    ]);

    // 4. Delete Lead rows (LeadEvent rows cascade automatically via onDelete: Cascade)
    const { count: deletedLeads } = await prisma.lead.deleteMany({
      where: { leadId: { in: leadIds } },
    });

    const receipt = {
      ok: true,
      processedAt: new Date().toISOString(),
      email: normalised,
      deletedLeads,
      deletedPageViews: pageViewsDeleted.count,
      deletedFormEvents: formEventsDeleted.count,
      photosDeleted,
      photosFailedToDelete: photosFailedCount,
      message: `All data for ${normalised} has been permanently removed.`,
    };

    return NextResponse.json(receipt);
  } catch (err) {
    logError(req, {
      severity: "high",
      type: "server_api",
      message: `Privacy deletion failed for ${email}: ${String(err)}`,
    });
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
