"use client";

// components/AdminForwardPanel.tsx
//
// Displays on the lead detail page. Shows:
//   - A "Forward to Partner" button with a partner dropdown
//   - History of all forwards for this lead (time, partner, status, SID)

import { useEffect, useState, useCallback } from "react";

interface Partner {
  id: string;
  name: string;
  company: string;
  phone: string;
  active: boolean;
  cities: string[];
}

interface ForwardRecord {
  id: number;
  createdAt: string;
  partnerId: string;
  method: string;
  status: string;
  twilioSid: string | null;
  isAuto: boolean;
  error: string | null;
  partner: { name: string; company: string };
}

interface Props {
  leadId: string;
  leadCity: string;
}

function formatPhone(digits: string) {
  const d = digits.replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return digits;
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 30 ? `${days}d ago` : new Date(iso).toLocaleDateString();
}

export default function AdminForwardPanel({ leadId, leadCity }: Props) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [forwards, setForwards] = useState<ForwardRecord[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [loadingForwards, setLoadingForwards] = useState(true);

  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const loadPartners = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/partners");
      if (!res.ok) return;
      const data = await res.json();
      const active = (data.partners as Partner[]).filter((p) => p.active);
      setPartners(active);
      // Pre-select partner whose cities match this lead's city (if any)
      const cityLower = leadCity.toLowerCase();
      const match = active.find((p) =>
        p.cities.some((c) => c.toLowerCase() === cityLower)
      );
      if (match) setSelectedPartnerId(match.id);
    } finally {
      setLoadingPartners(false);
    }
  }, [leadCity]);

  const loadForwards = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/forwards`);
      if (!res.ok) return;
      const data = await res.json();
      setForwards(data.forwards);
    } finally {
      setLoadingForwards(false);
    }
  }, [leadId]);

  useEffect(() => {
    loadPartners();
    loadForwards();
  }, [loadPartners, loadForwards]);

  async function handleForward() {
    if (!selectedPartnerId) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/admin/leads/forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, partnerId: selectedPartnerId }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSendResult({ ok: true, message: "SMS sent successfully." });
        await loadForwards();
      } else {
        setSendResult({ ok: false, message: data.error || "Failed to send SMS." });
      }
    } catch {
      setSendResult({ ok: false, message: "Network error. Try again." });
    } finally {
      setSending(false);
    }
  }

  const isLoading = loadingPartners || loadingForwards;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-base">📤</span>
        <span className="text-sm font-semibold text-neutral-700">
          Forward to Partner
        </span>
      </div>

      {isLoading ? (
        <div className="text-sm text-neutral-400">Loading…</div>
      ) : partners.length === 0 ? (
        <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-3 text-sm text-neutral-500">
          No active partners configured.{" "}
          <a href="/admin/partners" className="underline text-neutral-700">
            Add a partner →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-1">
                Select Partner
              </label>
              <select
                value={selectedPartnerId}
                onChange={(e) => setSelectedPartnerId(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">— Choose partner —</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.company} · {formatPhone(p.phone)}
                    {p.cities.some(
                      (c) => c.toLowerCase() === leadCity.toLowerCase()
                    )
                      ? " ✓ covers this city"
                      : ""}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleForward}
              disabled={!selectedPartnerId || sending}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 whitespace-nowrap"
              style={{ backgroundColor: "var(--brand-green, #1b5e35)" }}
            >
              {sending ? "Sending…" : "Send SMS"}
            </button>
          </div>

          {sendResult && (
            <div
              className={[
                "rounded-lg px-3 py-2 text-sm",
                sendResult.ok
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-700",
              ].join(" ")}
            >
              {sendResult.ok ? "✓ " : "✗ "}
              {sendResult.message}
            </div>
          )}
        </div>
      )}

      {/* Forward history */}
      {!isLoading && forwards.length > 0 && (
        <div className="mt-6 pt-5 border-t border-neutral-100">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
            Forward History
          </div>
          <div className="space-y-2">
            {forwards.map((f) => (
              <div
                key={f.id}
                className={[
                  "rounded-lg border px-3 py-2.5 flex flex-wrap items-start gap-x-3 gap-y-1 text-sm",
                  f.status === "SENT"
                    ? "border-emerald-100 bg-emerald-50"
                    : "border-red-100 bg-red-50",
                ].join(" ")}
              >
                <span
                  className={
                    f.status === "SENT" ? "text-emerald-700" : "text-red-600"
                  }
                >
                  {f.status === "SENT" ? "✓" : "✗"}{" "}
                  <strong>{f.partner.name}</strong> · {f.partner.company}
                </span>
                <span className="text-neutral-400 text-xs self-center">
                  {formatRelative(f.createdAt)}
                </span>
                {f.isAuto && (
                  <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-medium">
                    auto
                  </span>
                )}
                {f.twilioSid && (
                  <span className="text-xs text-neutral-400 font-mono break-all">
                    {f.twilioSid}
                  </span>
                )}
                {f.error && (
                  <span className="w-full text-xs text-red-600 mt-0.5">
                    {f.error}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
