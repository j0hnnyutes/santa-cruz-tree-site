// app/admin/leads/page.tsx

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import AdminLeadsTableClient from "@/components/AdminLeadsTableClient";
import { LeadStatus } from "@prisma/client";

export const metadata = {
  title: "Admin Leads",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 25;

function toStr(v: unknown) {
  return typeof v === "string" ? v : "";
}

function parseBool(v: unknown) {
  return v === "1" || v === "true";
}

function parsePage(v: unknown) {
  const n = Number(toStr(v));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

function isLeadStatus(v: string): v is LeadStatus {
  return (
    v === "NEW" ||
    v === "CONTACTED" ||
    v === "CLOSED" ||
    v === "ARCHIVED"
  );
}

function parseDateYYYYMMDD(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00.000-08:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    redirect(`/admin?next=${encodeURIComponent("/admin/leads")}`);
  }

  const sp = await searchParams;

  const q = toStr(sp.q).trim();
  const statusRaw = toStr(sp.status).trim();
  const fromRaw = toStr(sp.from).trim();
  const toRaw = toStr(sp.to).trim();
  const archived = parseBool(sp.archived);
  const page = parsePage(sp.page);

  const status: "ALL" | LeadStatus =
    statusRaw === "ALL" || statusRaw === ""
      ? "ALL"
      : isLeadStatus(statusRaw)
      ? statusRaw
      : "ALL";

  const where: any = {};

  if (status === "ARCHIVED") {
    where.status = LeadStatus.ARCHIVED;
  } else if (status !== "ALL") {
    where.status = status;
    if (!archived) {
      where.status = { equals: status, not: LeadStatus.ARCHIVED };
    }
  } else {
    if (!archived) {
      where.status = { not: LeadStatus.ARCHIVED };
    }
  }

  if (q) {
    where.OR = [
      { leadId: { contains: q } },
      { fullName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phoneDigits: { contains: q } },
      { service: { contains: q, mode: "insensitive" } },
      { details: { contains: q, mode: "insensitive" } },
    ];
  }

  const fromDate = parseDateYYYYMMDD(fromRaw);
  const toDate = parseDateYYYYMMDD(toRaw);

  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = fromDate;
    if (toDate) {
      const end = new Date(
        toDate.getTime() + 24 * 60 * 60 * 1000
      );
      where.createdAt.lt = end;
    }
  }

  const totalCount = await prisma.lead.count({ where });

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE)
  );

  const safePage = Math.min(Math.max(1, page), totalPages);
  const skip = (safePage - 1) * PAGE_SIZE;

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: PAGE_SIZE,
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
      archivedAt: true,
    },
  });

  const initialFilters = {
    q,
    status,
    from: fromRaw || "",
    to: toRaw || "",
    archived,
  };

  const pagination = {
    page: safePage,
    pageSize: PAGE_SIZE,
    totalCount,
    totalPages,
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Leads
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Manage lead status and archive old leads.
          </p>
        </div>

        <a
          href="/api/admin/logout?next=%2Fadmin%3FloggedOut%3D1"
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
        >
          Logout
        </a>
      </div>

      <div className="mt-6">
        <AdminLeadsTableClient
          leads={leads}
          initialFilters={initialFilters}
          pagination={pagination}
        />
      </div>
    </main>
  );
}