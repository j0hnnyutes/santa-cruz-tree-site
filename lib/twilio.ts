/**
 * lib/twilio.ts
 *
 * Thin wrapper around the Twilio REST API for sending SMS lead forwarding
 * notifications to partner tree service companies.
 *
 * Required environment variables:
 *   TWILIO_ACCOUNT_SID   — from console.twilio.com → Account Info
 *   TWILIO_AUTH_TOKEN    — from console.twilio.com → Account Info
 *   TWILIO_FROM_NUMBER   — your Twilio phone number in E.164 format, e.g. +18315551234
 *   NEXT_PUBLIC_SITE_URL — your production URL, e.g. https://santacruztreepros.com
 *
 * Uses the Twilio REST API directly (fetch) to avoid a heavy SDK dependency.
 */

const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01";

function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return digits;
}

export interface LeadSmsPayload {
  leadId: string;
  fullName: string;
  phoneDigits: string;
  email: string;
  address: string;
  city: string;
  service: string;
  details?: string | null;
}

/**
 * Sends a lead forwarding SMS to a partner phone number.
 * Returns the Twilio message SID on success.
 * Throws on failure — callers should catch and log.
 */
export async function sendLeadSms(
  toPhone: string,
  lead: LeadSmsPayload,
): Promise<string> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    throw new Error(
      "Missing Twilio env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER",
    );
  }

  // Normalise destination number to E.164
  const toNormalized = normalizeE164(toPhone);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://santacruztreepros.com";

  const adminUrl = `${siteUrl}/admin/leads/${lead.leadId}`;

  const detailsLine =
    lead.details && lead.details.trim()
      ? `\nDetails: ${lead.details.trim().slice(0, 200)}`
      : "";

  const body = [
    `🌲 New Lead — Santa Cruz Tree Pros`,
    `Name: ${lead.fullName}`,
    `Phone: ${formatPhone(lead.phoneDigits)}`,
    `Email: ${lead.email}`,
    `City: ${lead.city}`,
    `Address: ${lead.address}`,
    `Service: ${lead.service}`,
    detailsLine,
    ``,
    `Admin: ${adminUrl}`,
  ]
    .filter((line) => line !== null)
    .join("\n")
    .trim();

  const res = await fetch(
    `${TWILIO_API_BASE}/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: toNormalized,
        Body: body,
      }),
    },
  );

  const data = (await res.json()) as { sid?: string; message?: string; code?: number };

  if (!res.ok || !data.sid) {
    throw new Error(
      `Twilio error ${res.status}: ${data.message ?? JSON.stringify(data)}`,
    );
  }

  return data.sid;
}

/**
 * Converts a 10-digit US number or E.164 number to E.164 format.
 * e.g. "8315551234" → "+18315551234"
 */
function normalizeE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) return phone; // already E.164
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`; // best-effort
}
