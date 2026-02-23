// app/api/admin/leads/export/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

function csvEscape(value: unknown) {
  const s = value == null ? "" : String(value);
  // Quote if contains comma, quote, newline
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function iso(d: Date) {
  try {
    return d.toISOString();
  } catch {
    return "";
  }
}

export async function GET() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      leadId: true,
      fullName: true,
      phoneDigits: true,
      email: true,
      address: true,
      city: true,
      service: true,
      details: true,
      status: true,
      contactedAt: true,
      adminNotes: true,
    },
  });

  const headers = [
    "createdAt",
    "leadId",
    "fullName",
    "phoneDigits",
    "email",
    "address",
    "city",
    "service",
    "details",
    "status",
    "contactedAt",
    "adminNotes",
  ];

  const lines: string[] = [];
  lines.push(headers.join(","));

  for (const l of leads) {
    const row = [
      iso(l.createdAt),
      l.leadId,
      l.fullName,
      l.phoneDigits,
      l.email,
      l.address,
      l.city,
      l.service,
      l.details ?? "",
      l.status,
      l.contactedAt ? iso(l.contactedAt) : "",
      l.adminNotes ?? "",
    ].map(csvEscape);

    lines.push(row.join(","));
  }

  const csv = lines.join("\n");
  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}