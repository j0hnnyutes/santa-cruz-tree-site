"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// ✅ Use string-literal statuses (avoid Prisma enum import issues)
const STATUSES = ["NEW", "CONTACTED", "CLOSED", "ARCHIVED"] as const;
type Status = (typeof STATUSES)[number];

type LeadRow = {
  leadId: string;
  createdAt: Date | string;
  fullName: string;
  phoneDigits: string;
  email: string;
  service: string;
  details: string | null;
  status: Status; // ✅
  contactedAt: Date | string | null;
  adminNotes: string | null;
  archivedAt: Date | string | null;
};

type Props = {
  leads: LeadRow[];
  initialFilters: {
    q: string;
    status: string; // "ALL" | Status
    from: string; // YYYY-MM-DD or ""
    to: string; // YYYY-MM-DD or ""
    archived: boolean;
  };
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
};

const TIME_ZONE = "America/Los_Angeles";

function toDate(d: Date | string | null | undefined): Date | null {
  if (!d) return null;
  const dt = d instanceof Date ? d : new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatDateTimeInTZ(d: Date | string | null | undefined) {
  const dt = toDate(d);
  if (!dt) return "";
  return dt.toLocaleString("en-US", { timeZone: TIME_ZONE });
}

function digitsOnly(input: string) {
  return (input ?? "").replace(/\D/g, "");
}

function formatPhoneUS10(digits: string) {
  const d = digitsOnly(digits).slice(0, 10);
  if (d.length !== 10) return digits ?? "";
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function clsx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isStatus(v: string): v is Status {
  return (STATUSES as readonly string[]).includes(v);
}

export default function AdminLeadsTableClient({
  leads,
  initialFilters,
  pagination,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Selection
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const allOnPageSelected = leads.length > 0 && selected.size === leads.length;

  // Local controlled filter UI
  const [q, setQ] = React.useState(initialFilters.q ?? "");
  const [status, setStatus] = React.useState(initialFilters.status ?? "ALL");
  const [from, setFrom] = React.useState(initialFilters.from ?? "");
  const [to, setTo] = React.useState(initialFilters.to ?? "");
  const [archived, setArchived] = React.useState<boolean>(
    Boolean(initialFilters.archived)
  );

  const [busy, setBusy] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  const page = pagination.page;
  const totalPages = pagination.totalPages;

  function buildUrl(next: Partial<Record<string, string | null>>) {
    const params = new URLSearchParams(sp?.toString() ?? "");
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "" || v === undefined) params.delete(k);
      else params.set(k, v);
    }
    if (!("page" in next)) params.delete("page");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function applyFilters() {
    const url = buildUrl({
      q: q.trim() || null,
      status: status || "ALL",
      from: from || null,
      to: to || null,
      archived: archived ? "1" : null,
      page: "1",
    });
    router.push(url);
  }

  function clearFilters() {
    setQ("");
    setStatus("ALL");
    setFrom("");
    setTo("");
    setArchived(false);
    router.push(pathname);
  }

  function goToPage(p: number) {
    const clamped = Math.max(1, Math.min(totalPages, p));
    const url = buildUrl({ page: String(clamped) });
    router.push(url);
  }

  function toggleAllOnPage() {
    if (allOnPageSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(leads.map((l) => l.leadId)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function setStatusFor(ids: string[], nextStatus: Status) {
    if (ids.length === 0) return;
    setBusy(true);
    setToast(null);

    try {
      const res = await fetch("/api/admin/leads/set-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: ids, status: nextStatus }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to update status.");
      }

      setSelected(new Set());
      setToast(
        ids.length === 1
          ? `Updated lead status → ${nextStatus}`
          : `Updated ${ids.length} leads → ${nextStatus}`
      );

      router.refresh();
    } catch (e: any) {
      setToast(e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  // Bulk actions
  const selectedIds = Array.from(selected);

  // Pagination controls visibility
  const showPagination = totalPages > 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Page buttons: show first/last/current/neighbor pages only
  const pageButtons = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="space-y-4">
      {toast && (
        <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm">
          {toast}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600">Status</span>
            <select
              className="rounded-lg border border-neutral-300 bg-white px-2 py-1"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CLOSED">Closed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
            />
            <span className="text-neutral-700">Show archived</span>
          </label>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600">From</span>
            <input
              type="date"
              className="rounded-lg border border-neutral-300 px-2 py-1"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <span className="text-neutral-600">To</span>
            <input
              type="date"
              className="rounded-lg border border-neutral-300 px-2 py-1"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <input
              className="w-64 max-w-full rounded-lg border border-neutral-300 px-3 py-1.5"
              placeholder="Search name, email, phone, service, leadId"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
            />
            <button
              className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:bg-neutral-800"
              onClick={applyFilters}
              type="button"
            >
              Search
            </button>
            <button
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
              onClick={clearFilters}
              type="button"
            >
              Clear
            </button>
          </div>

          <div className="ml-auto text-sm text-neutral-600">
            Page {pagination.page} of {pagination.totalPages} •{" "}
            {pagination.totalCount.toLocaleString()} total
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            className={clsx(
              "rounded-lg border px-3 py-2 text-sm",
              selectedIds.length === 0 || busy
                ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                : "border-neutral-300 bg-white hover:bg-neutral-50"
            )}
            disabled={selectedIds.length === 0 || busy}
            onClick={() => setStatusFor(selectedIds, "CONTACTED")}
            type="button"
          >
            Mark Contacted
          </button>

          <button
            className={clsx(
              "rounded-lg border px-3 py-2 text-sm",
              selectedIds.length === 0 || busy
                ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                : "border-neutral-300 bg-white hover:bg-neutral-50"
            )}
            disabled={selectedIds.length === 0 || busy}
            onClick={() => setStatusFor(selectedIds, "CLOSED")}
            type="button"
          >
            Mark Closed
          </button>

          <button
            className={clsx(
              "rounded-lg border px-3 py-2 text-sm",
              selectedIds.length === 0 || busy
                ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                : "border-neutral-300 bg-white hover:bg-neutral-50"
            )}
            disabled={selectedIds.length === 0 || busy}
            onClick={() => setStatusFor(selectedIds, "ARCHIVED")}
            type="button"
          >
            Archive
          </button>

          <button
            className={clsx(
              "rounded-lg border px-3 py-2 text-sm",
              selectedIds.length === 0 || busy
                ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                : "border-neutral-300 bg-white hover:bg-neutral-50"
            )}
            disabled={selectedIds.length === 0 || busy}
            onClick={() => setStatusFor(selectedIds, "NEW")}
            type="button"
          >
            Unarchive (→ New)
          </button>

          {busy && <span className="text-sm text-neutral-500">Working…</span>}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-700">
            <tr>
              <th className="w-10 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={allOnPageSelected}
                  onChange={toggleAllOnPage}
                />
              </th>
              <th className="px-3 py-3 text-left">Created (Santa Cruz)</th>
              <th className="px-3 py-3 text-left">Name</th>
              <th className="px-3 py-3 text-left">Phone</th>
              <th className="px-3 py-3 text-left">Email</th>
              <th className="px-3 py-3 text-left">Service</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-10 text-center text-neutral-500"
                >
                  No leads found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const created = formatDateTimeInTZ(lead.createdAt);
                const phonePretty = formatPhoneUS10(lead.phoneDigits);

                return (
                  <tr key={lead.leadId} className="border-t border-neutral-100">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selected.has(lead.leadId)}
                        onChange={() => toggleOne(lead.leadId)}
                      />
                    </td>

                    <td className="px-3 py-3 text-neutral-700">{created}</td>

                    <td className="px-3 py-3 font-medium text-neutral-900">
                      {lead.fullName}
                    </td>

                    <td className="px-3 py-3 text-neutral-700">
                      {phonePretty}
                    </td>

                    <td className="px-3 py-3 text-neutral-700">{lead.email}</td>

                    <td className="px-3 py-3 text-neutral-700">
                      {lead.service}
                    </td>

                    <td className="px-3 py-3">
                      <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-700">
                        {lead.status}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/leads/${lead.leadId}`}
                          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs hover:bg-neutral-50"
                        >
                          View
                        </Link>

                        {lead.status !== "ARCHIVED" ? (
                          <button
                            className={clsx(
                              "rounded-lg border px-3 py-1.5 text-xs",
                              busy
                                ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                                : "border-neutral-300 bg-white hover:bg-neutral-50"
                            )}
                            disabled={busy}
                            onClick={() => setStatusFor([lead.leadId], "ARCHIVED")}
                            type="button"
                          >
                            Archive
                          </button>
                        ) : (
                          <button
                            className={clsx(
                              "rounded-lg border px-3 py-1.5 text-xs",
                              busy
                                ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                                : "border-neutral-300 bg-white hover:bg-neutral-50"
                            )}
                            disabled={busy}
                            onClick={() => setStatusFor([lead.leadId], "NEW")}
                            type="button"
                          >
                            Unarchive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {showPagination && (
          <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-3">
            <div className="text-sm text-neutral-600">
              Showing{" "}
              <span className="font-medium">
                {(page - 1) * pagination.pageSize + 1}
              </span>{" "}
              –{" "}
              <span className="font-medium">
                {Math.min(page * pagination.pageSize, pagination.totalCount)}
              </span>{" "}
              of <span className="font-medium">{pagination.totalCount}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={!hasPrev}
                className={clsx(
                  "rounded-lg border px-3 py-2 text-sm",
                  !hasPrev
                    ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                    : "border-neutral-300 bg-white hover:bg-neutral-50"
                )}
              >
                Prev
              </button>

              {pageButtons.map((p) => {
                const active = p === page;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goToPage(p)}
                    className={clsx(
                      "rounded-lg border px-3 py-2 text-sm",
                      active
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 bg-white hover:bg-neutral-50"
                    )}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={!hasNext}
                className={clsx(
                  "rounded-lg border px-3 py-2 text-sm",
                  !hasNext
                    ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                    : "border-neutral-300 bg-white hover:bg-neutral-50"
                )}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}