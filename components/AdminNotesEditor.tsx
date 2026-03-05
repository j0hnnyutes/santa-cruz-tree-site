"use client";

import { useRef, useState } from "react";

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const parts = document.cookie.split(";").map((p) => p.trim());
  for (const p of parts) {
    if (p.startsWith(name + "=")) {
      return decodeURIComponent(p.slice(name.length + 1));
    }
  }
  return "";
}

export default function AdminNotesEditor({
  leadId,
  initialNotes,
}: {
  leadId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const savedTimer = useRef<number | null>(null);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const csrf = getCookie("admin_csrf");
      const res = await fetch("/api/admin/leads/notes", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-csrf": csrf,
          "x-admin-csrf-token": csrf,
          "x-csrf-token": csrf,
        },
        credentials: "include",
        body: JSON.stringify({ leadId, notes: notes.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setError(data?.error || "Failed to save.");
        return;
      }

      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = window.setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Admin Notes</div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-emerald-600 font-medium">Saved</span>
          )}
          {error && (
            <span className="text-xs text-rose-600 font-medium">{error}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-neutral-800 px-3 text-xs font-semibold text-white disabled:opacity-50 hover:bg-neutral-700 transition-colors"
          >
            {saving ? "Saving..." : "Save Notes"}
          </button>
        </div>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="Add internal notes about this lead..."
        className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 resize-y"
      />
    </div>
  );
}
