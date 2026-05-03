import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import AdminNotesEditor from "@/components/AdminNotesEditor";
import AdminForwardPanel from "@/components/AdminForwardPanel";
import AdminNav from "@/components/AdminNav";

export const metadata = {
  title: "Lead Detail",
  robots: { index: false, follow: false },
};

function formatPhoneUS10(digits: string) {
  const d = (digits ?? "").replace(/\D/g, "").slice(0, 10);
  if (d.length !== 10) return digits ?? "";
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function formatDateTime(d: Date) {
  return d.toLocaleString();
}

function formatRelative(d: Date) {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-amber-100 text-amber-800",
  CLOSED: "bg-emerald-100 text-emerald-800",
  ARCHIVED: "bg-neutral-100 text-neutral-600",
};

const EVENT_ICONS: Record<string, string> = {
  CREATED: "🟢",
  CREATED_DUPLICATE: "⚠️",
  STATUS_CHANGE: "🔄",
  NOTES_UPDATED: "📝",
  DUPLICATE_FLAGGED: "⚠️",
  FORWARDED: "📤",
  FORWARD_FAILED: "❌",
};

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
      address: true,
      city: true,
      photoUrls: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      sessionId: true,
    },
  });

  if (!lead) {
    return (
      <>
        <AdminNav />
        <main className="mx-auto max-w-3xl px-6 py-10">
          <a className="text-sm underline" href="/admin/leads">
            &larr; Back to leads
          </a>
          <h1 className="mt-4 text-2xl font-semibold">Lead not found</h1>
        </main>
      </>
    );
  }

  // Fetch event history
  const events = await prisma.leadEvent.findMany({
    where: { leadId: p.leadId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const photoUrls = lead.photoUrls ?? [];

  // Session journey — pages the lead visited before converting
  type PageViewRow = { path: string; createdAt: Date; duration: number | null; referrer: string | null };
  let sessionJourney: PageViewRow[] = [];
  if (lead.sessionId) {
    sessionJourney = await prisma.$queryRaw<PageViewRow[]>`
      SELECT path, "createdAt", duration, referrer
      FROM "PageView"
      WHERE "sessionId" = ${lead.sessionId}
        AND duration IS NOT NULL
      ORDER BY "createdAt" ASC
      LIMIT 50
    `;
  }

  const statusColor = STATUS_COLORS[lead.status] || "bg-neutral-100 text-neutral-600";

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        <a className="text-sm underline text-neutral-500 hover:text-neutral-800" href="/admin/leads">
          &larr; Back to leads
        </a>

      {/* Lead header */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {lead.fullName}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Lead ID: <span className="font-mono text-xs">{lead.leadId}</span>
            </p>
          </div>

          <div className="text-right text-sm space-y-1">
            <div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}>
                {lead.status}
              </span>
            </div>
            <div className="text-neutral-500">Created: {formatDateTime(lead.createdAt)}</div>
            {lead.contactedAt ? (
              <div className="text-neutral-500">Contacted: {formatDateTime(lead.contactedAt)}</div>
            ) : null}
            {lead.archivedAt ? (
              <div className="text-neutral-500">Archived: {formatDateTime(lead.archivedAt)}</div>
            ) : null}
          </div>
        </div>

        {/* Contact info grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-neutral-50 p-3">
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Phone</div>
            <a href={`tel:${lead.phoneDigits}`} className="mt-1 block font-semibold text-neutral-900 hover:text-blue-600">
              {formatPhoneUS10(lead.phoneDigits)}
            </a>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Email</div>
            <a href={`mailto:${lead.email}`} className="mt-1 block font-semibold text-neutral-900 hover:text-blue-600 break-all">
              {lead.email}
            </a>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Address</div>
            <div className="mt-1 font-semibold text-neutral-900">{lead.address}</div>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3">
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">City</div>
            <div className="mt-1 font-semibold text-neutral-900">{lead.city}</div>
          </div>
          <div className="rounded-xl bg-neutral-50 p-3 sm:col-span-2">
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Service</div>
            <div className="mt-1 font-semibold text-neutral-900">{lead.service}</div>
          </div>
        </div>

        {/* UTM Attribution */}
        {(lead.utmSource || lead.utmMedium || lead.utmCampaign) && (
          <div className="mt-6 rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400 self-center mr-1">Source</span>
            {lead.utmSource && (
              <span className="text-neutral-700"><span className="text-neutral-400">utm_source: </span>{lead.utmSource}</span>
            )}
            {lead.utmMedium && (
              <span className="text-neutral-700"><span className="text-neutral-400">utm_medium: </span>{lead.utmMedium}</span>
            )}
            {lead.utmCampaign && (
              <span className="text-neutral-700"><span className="text-neutral-400">utm_campaign: </span>{lead.utmCampaign}</span>
            )}
          </div>
        )}

        {/* Customer details */}
        <div className="mt-6">
          <div className="text-sm font-medium text-neutral-700">Customer Details</div>
          <div className="mt-2 whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
            {lead.details || "(none provided)"}
          </div>
        </div>
      </div>

      {/* Session Journey */}
      {sessionJourney.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-4 w-4 text-violet-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-neutral-700">
              Session Journey
            </span>
            <span className="text-xs text-neutral-400 ml-1">
              {sessionJourney.length} page{sessionJourney.length !== 1 ? "s" : ""} visited before submitting
            </span>
          </div>
          <ol className="relative border-l border-neutral-200 ml-2 space-y-0">
            {sessionJourney.map((pv, i) => {
              const isLast = i === sessionJourney.length - 1;
              const durationSec = pv.duration ? Math.round(pv.duration / 1000) : null;
              return (
                <li key={i} className="ml-4 pb-4">
                  <div className={[
                    "absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white",
                    isLast ? "bg-violet-500" : "bg-neutral-300",
                  ].join(" ")} />
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className={[
                      "font-mono text-sm font-medium",
                      isLast ? "text-violet-700" : "text-neutral-800",
                    ].join(" ")}>
                      {pv.path}
                    </span>
                    {isLast && (
                      <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-medium">
                        converted here
                      </span>
                    )}
                    {durationSec !== null && (
                      <span className="text-xs text-neutral-400">
                        {durationSec < 60
                          ? `${durationSec}s`
                          : `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`}
                      </span>
                    )}
                  </div>
                  {i === 0 && pv.referrer && (
                    <div className="mt-0.5 text-xs text-neutral-400">
                      arrived from: {(() => {
                        try { return new URL(pv.referrer).hostname; }
                        catch { return pv.referrer; }
                      })()}
                    </div>
                  )}
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {new Date(pv.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric", minute: "2-digit", second: "2-digit",
                    })}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Photos */}
      {photoUrls.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="h-4 w-4 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-neutral-700">
              Photos ({photoUrls.length})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photoUrls.map((url) => {
              const filename = url.split("/").pop() ?? "photo";
              return (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 aspect-square"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={filename}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{filename}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Admin notes (editable) */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <AdminNotesEditor
          leadId={lead.leadId}
          initialNotes={lead.adminNotes || ""}
        />
      </div>

      {/* Forward to partner (SMS) */}
      <AdminForwardPanel leadId={lead.leadId} leadCity={lead.city} />

      {/* Event history / audit trail */}
      {events.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="text-sm font-medium mb-4">Activity Log</div>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex gap-3 text-sm">
                <div className="mt-0.5 text-base leading-none">
                  {EVENT_ICONS[event.action] || "•"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-medium text-neutral-800">
                      {event.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {formatRelative(event.createdAt)}
                    </span>
                  </div>
                  {event.detail ? (
                    <div className="mt-0.5 text-neutral-500 text-xs break-words">
                      {event.detail}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      </main>
    </>
  );
}
