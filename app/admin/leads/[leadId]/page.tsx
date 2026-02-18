import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const metadata = {
  title: "Lead Detail",
  robots: { index: false, follow: false },
};

function formatPhoneUS10(digits: string) {
  const d = (digits ?? "").replace(/\D/g, "").slice(0, 10);
  if (d.length !== 10) return digits ?? "";
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const isAuthed = await isAdminAuthenticated();
  const p = await params;

  if (!isAuthed) {
    redirect(`/admin?next=${encodeURIComponent(`/admin/leads/${p.leadId}`)}`);
  }

  const lead = await prisma.lead.findUnique({
    where: { leadId: p.leadId },
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

  if (!lead) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <a className="text-sm underline" href="/admin/leads">
          ← Back to leads
        </a>
        <h1 className="mt-4 text-2xl font-semibold">Lead not found</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <a className="text-sm underline" href="/admin/leads">
        ← Back to leads
      </a>

      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{lead.fullName}</h1>
            <p className="mt-1 text-sm text-neutral-600">
              Lead ID: <span className="font-mono">{lead.leadId}</span>
            </p>
          </div>

          <div className="text-right text-sm text-neutral-600">
            <div>Created: {lead.createdAt.toLocaleString()}</div>
            <div>Status: <span className="font-medium text-black">{lead.status}</span></div>
            {lead.archivedAt ? <div>Archived: {lead.archivedAt.toLocaleString()}</div> : null}
          </div>
        </div>

        <div className="mt-6 grid gap-3 text-sm">
          <div><span className="font-medium">Phone:</span> {formatPhoneUS10(lead.phoneDigits)}</div>
          <div><span className="font-medium">Email:</span> {lead.email}</div>
          <div><span className="font-medium">Service:</span> {lead.service}</div>
        </div>

        <div className="mt-6">
          <div className="text-sm font-medium">Details</div>
          <div className="mt-2 whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
            {lead.details || "(none)"}
          </div>
        </div>
      </div>
    </main>
  );
}