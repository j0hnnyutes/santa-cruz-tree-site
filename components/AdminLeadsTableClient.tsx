"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type LeadStatus = "NEW" | "CONTACTED" | "CLOSED" | "ARCHIVED";

type LeadRow = {
  leadId: string;
  createdAt: string | Date;
  fullName: string;
  phoneDigits: string;
  email: string;
  service: string;
  status: LeadStatus;
};

type Toast = {
  kind: "success" | "error";
  text: string;
};

function digitsOnly(v: unknown) {
  return String(v ?? "").replace(/\D/g, "");
}

function formatPhoneUS10(digits: string) {
  const d = digitsOnly(digits).slice(0, 10);
  if (d.length !== 10) return digits ?? "";
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function formatDateShort(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  const yy = String(dt.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function normalizeServiceLabel(s: string) {
  const v = String(s || "").trim();
  const up = v.toUpperCase();

  if (
    up === "STUMP_GRINDING" ||
    up === "STUMP_GRINDING_ROOT_REMOVAL" ||
    up === "STUMP_GRINDING_&_ROOT_REMOVAL"
  ) {
    return "Stump Grinding / Removal";
  }
  if (
    up === "TREE_TRIMMING" ||
    up === "TREE_TRIMMING_PRUNING" ||
    up === "TREE_TRIMMING_&_PRUNING"
  ) {
    return "Tree Trimming / Pruning";
  }
  if (up === "TREE_REMOVAL") return "Tree Removal";
  if (up === "EMERGENCY_TREE_SERVICE") return "Emergency Tree Service";
  if (up === "ARBORIST_CONSULTING") return "Arborist Consulting";

  // If it's already human readable, keep it
  // Otherwise convert SNAKE_CASE -> Title Case
  if (!v.includes("_")) return v;

  return v
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error || "Something went wrong.";
    throw new Error(msg);
  }
  return json as T;
}

export default function AdminLeadsTableClient({
  initialLeads,
}: {
  initialLeads: LeadRow[];
}) {
  const [allLeads, setAllLeads] = useState<LeadRow[]>(
    (initialLeads || []).map((l) => ({
      ...l,
      createdAt: typeof l.createdAt === "string" ? l.createdAt : l.createdAt,
    }))
  );

  // Filters
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | LeadStatus>("ALL");
  const [start, setStart] = useState<string>(""); // YYYY-MM-DD
  const [end, setEnd] = useState<string>(""); // YYYY-MM-DD

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Selection + bulk actions
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // Toast
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | null>(null);

  const filterCardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(t: Toast) {
    setToast(t);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const startTs = start ? new Date(start + "T00:00:00").getTime() : null;
    const endTs = end ? new Date(end + "T23:59:59").getTime() : null;

    return allLeads.filter((l) => {
      const createdTs = new Date(l.createdAt).getTime();

      if (status !== "ALL" && l.status !== status) return false;
      if (startTs != null && createdTs < startTs) return false;
      if (endTs != null && createdTs > endTs) return false;

      if (!q) return true;

      const hay = [
        l.fullName,
        l.email,
        l.phoneDigits,
        normalizeServiceLabel(l.service),
        l.status,
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [allLeads, query, status, start, end]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pageItems = useMemo(() => {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const from = (safePage - 1) * pageSize;
    return filtered.slice(from, from + pageSize);
  }, [filtered, page, totalPages]);

  useEffect(() => {
    setPage(1);
    setSelected({});
  }, [query, status, start, end]);

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const allOnPageSelected = useMemo(() => {
    if (pageItems.length === 0) return false;
    return pageItems.every((l) => selected[l.leadId]);
  }, [pageItems, selected]);

  function toggleAllOnPage(v: boolean) {
    const next = { ...selected };
    for (const l of pageItems) next[l.leadId] = v;
    setSelected(next);
  }

  function toggleOne(id: string, v: boolean) {
    setSelected((prev) => ({ ...prev, [id]: v }));
  }

  async function bulkSetStatus(nextStatus: LeadStatus) {
    const ids = selectedIds;
    if (ids.length === 0) return;

    try {
      await postJSON("/api/admin/leads/set-status", {
        leadIds: ids,
        status: nextStatus,
      });

      setAllLeads((prev) =>
        prev.map((l) =>
          ids.includes(l.leadId) ? { ...l, status: nextStatus } : l
        )
      );

      setSelected({});
      showToast({
        kind: "success",
        text: `Saved: Updated ${ids.length} lead(s) → ${nextStatus}`,
      });
    } catch (e: any) {
      showToast({ kind: "error", text: `Error: ${e?.message || "Failed."}` });
    }
  }

  async function bulkArchive() {
    const ids = selectedIds;
    if (ids.length === 0) return;

    try {
      await postJSON("/api/admin/leads/bulk", {
        leadIds: ids,
        action: "ARCHIVE",
      });

      // Remove from view (client-side "archivedAt null" mimic)
      setAllLeads((prev) => prev.filter((l) => !ids.includes(l.leadId)));
      setSelected({});
      showToast({
        kind: "success",
        text: `Saved: Archived ${ids.length} lead(s).`,
      });
    } catch (e: any) {
      showToast({ kind: "error", text: `Error: ${e?.message || "Failed."}` });
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Card Wrapper (relative so toast centers to this card width) */}
      <div ref={filterCardRef} className="relative">
        {/* Toast (centered above the filter card, no layout pushdown) */}
        {toast ? (
          <div className="pointer-events-none absolute -top-4 left-0 w-full flex justify-center z-10">
            <div
              className={[
                "px-2 py-1 text-sm font-semibold",
                toast.kind === "success" ? "text-emerald-700" : "text-rose-700",
              ].join(" ")}
            >
              {toast.text}
            </div>
          </div>
        ) : null}

        {/* FILTER CARD — NO HOVER EFFECTS */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-12 items-end">
            <div className="lg:col-span-6">
              <label className="block text-xs font-semibold text-[var(--text)]">
                Search
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, email, phone, service…"
                className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent)]/20"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-[var(--text)]">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm outline-none focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent)]/20"
              >
                <option value="ALL">All</option>
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-[var(--text)]">
                Start
              </label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--text)] text-black opacity-100 outline-none focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent)]/20"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-[var(--text)]">
                End
              </label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--text)] text-black opacity-100 outline-none focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent)]/20"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-[var(--muted)]">
              Showing{" "}
              <span className="font-semibold text-[var(--text)]">
                {filtered.length}
              </span>{" "}
              leads
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => bulkSetStatus("CONTACTED")}
                disabled={selectedIds.length === 0}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-700 px-4 text-sm font-semibold text-white disabled:opacity-40"
              >
                Mark Contacted
              </button>
              <button
                onClick={() => bulkSetStatus("CLOSED")}
                disabled={selectedIds.length === 0}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-neutral-700 px-4 text-sm font-semibold text-white disabled:opacity-40"
              >
                Close
              </button>
              <button
                onClick={() => bulkArchive()}
                disabled={selectedIds.length === 0}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--text)] disabled:opacity-40"
              >
                Archive
              </button>
              <button
                onClick={() => bulkSetStatus("NEW")}
                disabled={selectedIds.length === 0}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--text)] disabled:opacity-40"
              >
                Reset to New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LEADS TABLE CARD — NO HOVER EFFECTS */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-white">
              <tr className="border-b border-[var(--border)]">
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={(e) => toggleAllOnPage(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Phone</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Service</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((l) => (
                <tr
                  key={l.leadId}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <td className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!selected[l.leadId]}
                      onChange={(e) => toggleOne(l.leadId, e.target.checked)}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDateShort(l.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${l.leadId}`}
                      className="font-semibold text-[var(--brand-accent)] hover:underline"
                    >
                      {l.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatPhoneUS10(l.phoneDigits)}
                  </td>
                  <td className="px-4 py-3">{l.email}</td>
                  <td className="px-4 py-3">
                    {normalizeServiceLabel(l.service)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{l.status}</td>
                </tr>
              ))}

              {pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-[var(--muted)]"
                  >
                    No leads found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="text-sm text-[var(--muted)]">
            Page{" "}
            <span className="font-semibold text-[var(--text)]">{page}</span> of{" "}
            <span className="font-semibold text-[var(--text)]">
              {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="h-9 rounded-xl border border-[var(--border)] bg-white px-3 text-sm font-semibold disabled:opacity-40"
            >
              First
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-9 rounded-xl border border-[var(--border)] bg-white px-3 text-sm font-semibold disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-9 rounded-xl border border-[var(--border)] bg-white px-3 text-sm font-semibold disabled:opacity-40"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="h-9 rounded-xl border border-[var(--border)] bg-white px-3 text-sm font-semibold disabled:opacity-40"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}