"use client";

// app/admin/partners/PartnersClient.tsx
//
// Client UI for the Partners management page — list, add, edit, and delete
// partner companies. Rendered by the server component page.tsx which
// enforces admin auth before this component is ever served.

import { useEffect, useState, useCallback } from "react";
import AdminNav from "@/components/AdminNav";

interface Partner {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string | null;
  cities: string[];
  active: boolean;
  notes: string | null;
  createdAt: string;
  _count: { forwards: number };
}

function formatPhone(digits: string) {
  const d = digits.replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return digits;
}

const BLANK_FORM = {
  name: "",
  company: "",
  phone: "",
  email: "",
  cities: "",
  notes: "",
  active: true,
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/partners");
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setPartners(data.partners);
    } catch (e) {
      setError("Failed to load partners.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditing(null);
    setForm(BLANK_FORM);
    setSaveError(null);
    setModalOpen(true);
  }

  function openEdit(p: Partner) {
    setEditing(p);
    setForm({
      name: p.name,
      company: p.company,
      phone: p.phone,
      email: p.email ?? "",
      cities: p.cities.join(", "),
      notes: p.notes ?? "",
      active: p.active,
    });
    setSaveError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        name: form.name.trim(),
        company: form.company.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        cities: form.cities
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        notes: form.notes.trim() || null,
        active: form.active,
      };

      const url = editing
        ? `/api/admin/partners/${editing.id}`
        : "/api/admin/partners";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Save failed.");
        return;
      }

      setModalOpen(false);
      await load();
    } catch (e) {
      setSaveError("Network error. Try again.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/partners/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      console.error("Delete failed:", e);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Partners</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Manage partner companies that receive forwarded leads via SMS.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--brand-green, #1b5e35)" }}
          >
            <span className="text-lg leading-none">+</span> Add Partner
          </button>
        </div>

        {loading && (
          <div className="text-sm text-neutral-400 py-12 text-center">
            Loading partners…
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && partners.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
            <div className="text-3xl mb-3">🌲</div>
            <p className="text-sm font-medium text-neutral-600">No partners yet</p>
            <p className="mt-1 text-xs text-neutral-400">
              Add your first partner to start forwarding leads via SMS.
            </p>
            <button
              onClick={openAdd}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--brand-green, #1b5e35)" }}
            >
              Add Partner
            </button>
          </div>
        )}

        {!loading && partners.length > 0 && (
          <div className="space-y-3">
            {partners.map((p) => (
              <div
                key={p.id}
                className={[
                  "rounded-xl border bg-white p-5 flex flex-wrap gap-4 items-start",
                  p.active ? "border-neutral-200" : "border-neutral-100 opacity-60",
                ].join(" ")}
              >
                {/* Status dot */}
                <div className="mt-1">
                  <span
                    className={[
                      "inline-block w-2.5 h-2.5 rounded-full",
                      p.active ? "bg-emerald-500" : "bg-neutral-300",
                    ].join(" ")}
                    title={p.active ? "Active" : "Inactive"}
                  />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold text-neutral-900">{p.name}</span>
                    <span className="text-sm text-neutral-500">{p.company}</span>
                    {!p.active && (
                      <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full font-medium">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    <a
                      href={`tel:${p.phone}`}
                      className="text-neutral-700 hover:text-blue-600"
                    >
                      📞 {formatPhone(p.phone)}
                    </a>
                    {p.email && (
                      <a
                        href={`mailto:${p.email}`}
                        className="text-neutral-700 hover:text-blue-600 break-all"
                      >
                        ✉️ {p.email}
                      </a>
                    )}
                  </div>

                  {p.cities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.cities.map((c) => (
                        <span
                          key={c}
                          className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium"
                        >
                          📍 {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {p.notes && (
                    <p className="mt-2 text-xs text-neutral-400 italic">{p.notes}</p>
                  )}
                </div>

                {/* Stats + actions */}
                <div className="flex flex-col items-end gap-3 text-right">
                  <div className="text-xs text-neutral-400">
                    <span className="font-semibold text-neutral-700 text-sm">
                      {p._count.forwards}
                    </span>{" "}
                    forward{p._count.forwards !== 1 ? "s" : ""} sent
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 font-medium text-neutral-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 font-medium text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100">
              <h2 className="text-lg font-semibold">
                {editing ? "Edit Partner" : "Add Partner"}
              </h2>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Mike Johnson"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g. Johnson Tree Service"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                  Phone (receives SMS) *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(831) 555-1234"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="mike@johnsontrees.com"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Cities */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                  Covered Cities (auto-forward trigger)
                </label>
                <input
                  type="text"
                  value={form.cities}
                  onChange={(e) => setForm({ ...form, cities: e.target.value })}
                  placeholder="Santa Cruz, Scotts Valley, Capitola"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="mt-1 text-xs text-neutral-400">
                  Comma-separated. When a new lead arrives from one of these cities,
                  this partner automatically receives an SMS.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                  Internal Notes (optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="e.g. Pays $50/lead, prefers removal jobs only"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  <div
                    className={[
                      "w-10 h-6 rounded-full transition-colors",
                      form.active ? "bg-emerald-500" : "bg-neutral-300",
                    ].join(" ")}
                  />
                  <div
                    className={[
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                      form.active ? "left-5" : "left-1",
                    ].join(" ")}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  Active — receives auto-forwarded leads
                </span>
              </label>

              {saveError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {saveError}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: "var(--brand-green, #1b5e35)" }}
              >
                {saving ? "Saving…" : editing ? "Save Changes" : "Add Partner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Delete Partner?</h2>
            <p className="mt-2 text-sm text-neutral-600">
              This will permanently remove{" "}
              <strong>{deleteTarget.name}</strong> ({deleteTarget.company}).
              Forward history will be preserved.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
