import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const metadata = {
  title: "Admin Leads",
  robots: { index: false, follow: false },
};

export default async function AdminLeadsPage() {
  if (!isAdminAuthenticated()) redirect("/admin?next=/admin/leads");

  const rows = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      leadId: true,
      createdAt: true,
      fullName: true,
      email: true,
      phoneDigits: true,
      service: true,
    },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-neutral-600">Showing newest 50 leads</p>
        </div>

        <form method="POST" action="/api/admin/logout">
          <button className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-neutral-800">
            Logout
          </button>
        </form>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-neutral-200">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="text-left">
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Lead ID</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-neutral-600" colSpan={6}>
                  No leads yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.leadId} className="border-t border-neutral-200">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <Link className="underline" href={`/admin/leads/${r.leadId}`}>
                      {r.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.service}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.phoneDigits}</td>
                  <td className="px-4 py-3">
                    <a className="underline" href={`mailto:${r.email}`}>
                      {r.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{r.leadId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
