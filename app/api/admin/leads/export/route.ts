import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticatedRequest } from "@/lib/adminAuth";

const TIME_ZONE = "America/Los_Angeles";

function isYYYYMMDD(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function getTimeZoneOffsetMinutes(timeZone: string, date: Date) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }

  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );

  return (asUTC - date.getTime()) / 60000;
}

function zonedDateTimeToUtc(timeZone: string, y: number, m: number, d: number, hh: number, mm: number, ss: number, ms = 0) {
  const localAsUTC = new Date(Date.UTC(y, m - 1, d, hh, mm, ss, ms));
  const offsetMin = getTimeZoneOffsetMinutes(timeZone, localAsUTC);
  return new Date(localAsUTC.getTime() - offsetMin * 60000);
}

function createdAtFilterLA(from?: string | null, to?: string | null) {
  const createdAt: { gte?: Date; lte?: Date } = {};

  if (from && isYYYYMMDD(from)) {
    const [yy, mm, dd] = from.split("-").map(Number);
    createdAt.gte = zonedDateTimeToUtc(TIME_ZONE, yy, mm, dd, 0, 0, 0, 0);
  }

  if (to && isYYYYMMDD(to)) {
    const [yy, mm, dd] = to.split("-").map(Number);
    createdAt.lte = zonedDateTimeToUtc(TIME_ZONE, yy, mm, dd, 23, 59, 59, 999);
  }

  return Object.keys(createdAt).length ? createdAt : undefined;
}

function csvEscape(value: unknown) {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticatedRequest(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const status = (url.searchParams.get("status") ?? "ALL").toUpperCase();
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const where: any = {};

  const ca = createdAtFilterLA(from, to);
  if (ca) where.createdAt = ca;

  if (status !== "ALL") where.status = status;

  if (q) {
    where.OR = [
      { leadId: { contains: q, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phoneDigits: { contains: q } },
      { service: { contains: q, mode: "insensitive" } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 5000,
    select: {
      leadId: true,
      createdAt: true,
      fullName: true,
      phoneDigits: true,
      email: true,
      service: true,
      details: true,
      status: true,
      contactedAt: true,
      adminNotes: true,
    },
  });

  const header = [
    "leadId",
    "createdAt_UTC",
    "createdAt_SantaCruz",
    "fullName",
    "phoneDigits",
    "email",
    "service",
    "details",
    "status",
    "contactedAt",
    "adminNotes",
  ];

  const rows = leads.map((l) => [
    l.leadId,
    l.createdAt?.toISOString?.() ?? "",
    new Date(l.createdAt).toLocaleString("en-US", { timeZone: TIME_ZONE }),
    l.fullName,
    l.phoneDigits,
    l.email,
    l.service,
    l.details ?? "",
    l.status,
    l.contactedAt ? new Date(l.contactedAt).toISOString() : "",
    l.adminNotes ?? "",
  ]);

  const csv = [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

  const filenameParts = ["leads"];
  if (status !== "ALL") filenameParts.push(status.toLowerCase());
  if (from) filenameParts.push(`from-${from}`);
  if (to) filenameParts.push(`to-${to}`);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filenameParts.join("_")}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}