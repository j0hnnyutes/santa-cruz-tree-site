// app/admin/leads/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import AdminLeadsTableClient from "@/components/AdminLeadsTableClient";

export const metadata = {
  title: "Leads",
  robots: { index: false, follow: false },
};

export default async function AdminLeadsPage() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) redirect("/admin?next=/admin/leads");

  const leads = await prisma.lead.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      leadId: true,
      createdAt: true,
      fullName: true,
      phoneDigits: true,
      email: true,
      // address intentionally NOT selected for the table view
      city: true,
      service: true,
      status: true,
      events: {
        where: { action: { in: ["CREATED", "CREATED_DUPLICATE"] } },
        select: { detail: true },
        take: 1,
      },
    },
  });

  // Parse photo count from the CREATED event detail string ("... · 2 photos")
  const leadsWithPhotos = leads.map((l) => {
    const detail = l.events[0]?.detail ?? "";
    const match = detail.match(/·\s*(\d+)\s*photo/);
    return { ...l, photoCount: match ? parseInt(match[1], 10) : 0 };
  });

  return (
    <main className="site-container py-10 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">
            Leads
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Click a lead to view full details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/api/admin/leads/export"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand-green)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-green-dark)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
          >
            Export CSV
          </Link>
        </div>
      </div>

      <AdminLeadsTableClient initialLeads={leadsWithPhotos as any} />
    </main>
  );
}