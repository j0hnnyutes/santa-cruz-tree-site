// app/api/admin/leads/export/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

function csvEscape(v: unknown) {
  const s = String(v ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatISO(dt: Date) {
  // keep it simple + stable for spreadsheets
  return dt.toISOString();
}

export async function GET() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      leadId: true,
      createdAt: true,
      fullName: true,
      phoneDigits: true,
      email: true,
      address: true,
      city: true,
      service: true,
      status: true,
      contactedAt: true,
      archivedAt: true,
      adminNotes: true,
      details: true,
    },
  });

  const headers = [
    "leadId",
    "createdAt",
    "fullName",
    "phoneDigits",
    "email",
    "address",
    "city",
    "service",
    "status",
    "contactedAt",
    "archivedAt",
    "adminNotes",
    "details",
  ];

  const lines: string[] = [];
  lines.push(headers.join(","));

  for (const l of leads) {
    const row = [
      l.leadId,
      formatISO(l.createdAt),
      l.fullName,
      l.phoneDigits,
      l.email,
      l.address,
      l.city,
      l.service,
      l.status,
      l.contactedAt ? formatISO(l.contactedAt) : "",
      l.archivedAt ? formatISO(l.archivedAt) : "",
      l.adminNotes ?? "",
      l.details ?? "",
    ].map(csvEscape);

    lines.push(row.join(","));
  }

  const csv = lines.join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="leads.csv"`,
      "cache-control": "no-store",
    },
  });
}