"use client";

import { useState } from "react";
import AdminNav from "@/components/AdminNav";

// ── Types ─────────────────────────────────────────────────────────────────────

type LeadSummary = {
  leadId: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  service: string;
  photoCount: number;
  eventCount: number;
  sessionId: string | null;
};

type LookupResult = {
  email: string;
  leadCount: number;
  leads: LeadSummary[];
  sessionIds: string[];
  pageViewCount: number;
  formEventCount: number;
  totalPhotoCount: number;
};

type DeletionReceipt = {
  ok: boolean;
  processedAt: string;
  email: string;
  deletedLeads: number;
  deletedPageViews: number;
  deletedFormEvents: number;
  photosDeleted: number;
  photosFailedToDelete: number;
  message: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCsrf(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)admin_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const card = { background: "#1a2e1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 };
const inputStyle = { background: "#0f1f0f", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 13px", fontSize: 14, color: "#f0fdf4", outline: "none", width: "100%" };
const btnGreen = { background: "var(--brand-green)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const btnRed = { background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const btnGhost = { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer" };

// ── Component ─────────────────────────────────────────────────────────────────

export default function PrivacyRequestPage() {
  const [email, setEmail] = useState("");
  const [looking, setLooking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [receipt, setReceipt] = useState<DeletionReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setReceipt(null);
    setConfirmOpen(false);
    setLooking(true);
    try {
      const res = await fetch(`/api/admin/privacy?email=${encodeURIComponent(email.trim())}`, {
        headers: { "x-admin-csrf": getCsrf() },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Lookup failed.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLooking(false);
    }
  }

  async function handleDelete() {
    if (!result) return;
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/privacy", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-csrf": getCsrf() },
        body: JSON.stringify({ email: result.email }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Deletion failed.");
      } else {
        setReceipt(data as DeletionReceipt);
        setResult(null);
        setConfirmOpen(false);
        setConfirmInput("");
        setEmail("");
      }
    } catch {
      setError("Network error during deletion. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  const confirmValid = confirmInput.trim().toLowerCase() === result?.email.toLowerCase();

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      <AdminNav />

      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold text-white mb-1">Privacy / CCPA Requests</h1>
        <p className="text-white/50 text-sm mb-8">
          Look up and permanently remove a person&apos;s data in response to a deletion request under CCPA or similar privacy laws.
        </p>

        {/* ── Search card ── */}
        <div style={{ ...card, padding: 24, marginBottom: 16 }}>
          <h2 className="text-base font-semibold text-white mb-4">Look Up Data by Email</h2>
          <form onSubmit={handleLookup} style={{ display: "flex", gap: 10 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setResult(null); setReceipt(null); setConfirmOpen(false); }}
              placeholder="requester@example.com"
              required
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="submit" disabled={looking || !email.trim()} style={{ ...btnGreen, opacity: looking || !email.trim() ? 0.55 : 1 }}>
              {looking ? "Searching…" : "Search"}
            </button>
          </form>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", color: "#fca5a5", fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* ── No results ── */}
        {result && result.leadCount === 0 && (
          <div style={{ ...card, padding: 24, textAlign: "center" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>No records found</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>
              No leads, page views, or form events are associated with <strong style={{ color: "rgba(255,255,255,0.6)" }}>{result.email}</strong>.
            </p>
          </div>
        )}

        {/* ── Lookup result ── */}
        {result && result.leadCount > 0 && !confirmOpen && (
          <div style={{ ...card, padding: 24 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
              <div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Data on file for</p>
                <p style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>{result.email}</p>
              </div>
              <button onClick={() => setConfirmOpen(true)} style={btnRed}>
                🗑 Delete All Data
              </button>
            </div>

            {/* Data summary chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {[
                { label: "Leads", value: result.leadCount, icon: "📋" },
                { label: "Photos", value: result.totalPhotoCount, icon: "📷" },
                { label: "Page Views", value: result.pageViewCount, icon: "👁" },
                { label: "Form Events", value: result.formEventCount, icon: "📝" },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 14px", textAlign: "center", minWidth: 90 }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{value}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{icon} {label}</p>
                </div>
              ))}
            </div>

            {/* Per-lead detail rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {result.leads.map((lead) => (
                <div key={lead.leadId} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                    <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{lead.fullName}</span>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{fmt(lead.createdAt)}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                    {[
                      { k: "Phone", v: lead.phone },
                      { k: "Service", v: lead.service },
                      { k: "Address", v: `${lead.address}, ${lead.city}` },
                      { k: "Photos", v: lead.photoCount },
                      { k: "Audit events", v: lead.eventCount },
                    ].map(({ k, v }) => (
                      <span key={k} style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                        <span style={{ color: "rgba(255,255,255,0.25)" }}>{k}: </span>{v}
                      </span>
                    ))}
                  </div>
                  <p style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>ID: {lead.leadId}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Confirm dialog ── */}
        {confirmOpen && result && (
          <div style={{ ...card, padding: 24, border: "1px solid rgba(239,68,68,0.3)" }}>
            <h3 style={{ color: "#fca5a5", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>⚠️ Confirm Permanent Deletion</h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
              This will permanently and irreversibly delete:
              <br />• <strong style={{ color: "#fff" }}>{result.leadCount}</strong> lead record{result.leadCount !== 1 ? "s" : ""} and all audit events
              <br />• <strong style={{ color: "#fff" }}>{result.totalPhotoCount}</strong> photo{result.totalPhotoCount !== 1 ? "s" : ""} from cloud storage
              <br />• <strong style={{ color: "#fff" }}>{result.pageViewCount}</strong> page view{result.pageViewCount !== 1 ? "s" : ""} and <strong style={{ color: "#fff" }}>{result.formEventCount}</strong> form event{result.formEventCount !== 1 ? "s" : ""} linked by session
            </p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 8 }}>
              Type the email address to confirm: <strong style={{ color: "rgba(255,255,255,0.8)" }}>{result.email}</strong>
            </p>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={result.email}
              autoFocus
              style={{ ...inputStyle, marginBottom: 14 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleDelete}
                disabled={deleting || !confirmValid}
                style={{ ...btnRed, opacity: deleting || !confirmValid ? 0.5 : 1, cursor: deleting || !confirmValid ? "not-allowed" : "pointer" }}
              >
                {deleting ? "Deleting…" : "Permanently Delete"}
              </button>
              <button onClick={() => { setConfirmOpen(false); setConfirmInput(""); }} style={btnGhost}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Deletion receipt ── */}
        {receipt && (
          <div style={{ ...card, padding: 24, border: "1px solid rgba(34,197,94,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>✅</span>
              <div>
                <p style={{ color: "#86efac", fontWeight: 700, fontSize: 16 }}>Data Deleted Successfully</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Processed at {fmt(receipt.processedAt)}</p>
              </div>
            </div>

            {/* Receipt details */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Deletion Receipt</p>
              {[
                { label: "Email", value: receipt.email },
                { label: "Leads removed", value: receipt.deletedLeads },
                { label: "Photos removed", value: receipt.photosDeleted + (receipt.photosFailedToDelete > 0 ? ` (${receipt.photosFailedToDelete} failed — may already be deleted)` : "") },
                { label: "Page views removed", value: receipt.deletedPageViews },
                { label: "Form events removed", value: receipt.deletedFormEvents },
                { label: "Processed at", value: fmt(receipt.processedAt) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13 }}>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                  <span style={{ color: "#fff" }}>{String(value)}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
              Keep a screenshot or copy of this receipt for your records. Under CCPA, you are required to respond to verified deletion requests within 45 days and may retain this confirmation as documentation of compliance.
            </p>

            <button onClick={() => setReceipt(null)} style={{ ...btnGhost, marginTop: 14 }}>
              Submit Another Request
            </button>
          </div>
        )}

        {/* ── Info panel ── */}
        <div className="mt-6 rounded-xl px-5 py-4 text-sm text-white/40" style={{ background: "#1a2e1a", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="font-medium text-white/60 mb-2">📋 About CCPA Deletion Requests</p>
          <p className="leading-6">
            Under CCPA, California residents may request deletion of their personal data. You must respond within <strong className="text-white/60">45 days</strong> (extendable by 45 more with notice). This tool permanently removes all records associated with an email address — lead submissions, photos, and linked analytics — and generates a receipt for your records. Audit log entries (LeadEvents) are automatically removed along with the lead.
          </p>
        </div>
      </div>
    </div>
  );
}
