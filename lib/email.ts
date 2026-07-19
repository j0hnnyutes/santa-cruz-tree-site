// lib/email.ts
//
// Resend-backed email senders. Two audiences:
//   sendLeadNotification — the business owner's copy (LEAD_TO_EMAIL). Always
//     sent for every lead, duplicate or not. Never throws — a failure here
//     is logged via logError and shouldn't block lead creation.
//   sendPartnerLeadEmail — an optional copy to a forwarded partner's own
//     email (Partner.email), alongside the existing SMS forward. Throws on
//     failure, same contract as sendLeadSms, so callers can record the
//     outcome in LeadForward.

import { logError } from "@/lib/logError";

export function formatPhone(digits: string) {
  if (digits.length !== 10) return digits;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function escHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface LeadForEmail {
  fullName: string;
  email: string;
  phoneDigits: string;
  address: string;
  city: string;
  service: string;
  details: string | null;
  leadId: string;
  photoUrls: string[];
}

/* ─── Owner notification (LEAD_TO_EMAIL) ─── */

export async function sendLeadNotification(lead: LeadForEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.LEAD_TO_EMAIL;
  const fromEmail = process.env.LEAD_FROM_EMAIL;
  const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  if (!apiKey || !toEmail || !fromEmail) {
    console.warn("Resend not configured — skipping email notification");
    return;
  }

  const phoneFormatted = lead.phoneDigits ? formatPhone(lead.phoneDigits) : null;
  const photoCount = lead.photoUrls.length;
  const leadUrl = `${siteUrl}/admin/leads/${lead.leadId}`;
  const isDuplicate = lead.details?.includes("⚠️ POSSIBLE DUPLICATE");

  try {
    const payload: Record<string, unknown> = {
      from: fromEmail,
      to: [toEmail],
      subject: `${isDuplicate ? "⚠️ Duplicate — " : ""}New Lead: ${lead.service} — ${lead.fullName} (${lead.city})`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Prevent Apple Mail / iOS Mail dark-mode colour inversion -->
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<style>
  :root { color-scheme: light only; }
  /* Fallback for clients that support prefers-color-scheme but not color-scheme meta */
  @media (prefers-color-scheme: dark) {
    .email-header  { background-color: #1b5e35 !important; }
    .cta-button    { background-color: #1b5e35 !important; color: #ffffff !important; }
    .email-body    { background-color: #ffffff !important; }
    .email-footer  { background-color: #f9fafb !important; }
    .email-wrapper { background-color: #f0f2f5 !important; }
    .field-bg      { background-color: #f9fafb !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" class="email-wrapper" style="background-color:#f0f2f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td class="email-header" style="background-color:#1b5e35;border-radius:12px 12px 0 0;padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.6);">Santa Cruz Tree Pros</p>
                  <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ffffff;">New Estimate Request</h1>
                </td>
                <td align="right" valign="top">
                  <span style="display:inline-block;background-color:rgba(255,255,255,0.15);color:#ffffff;font-size:12px;font-weight:600;padding:5px 12px;border-radius:20px;white-space:nowrap;">${lead.service}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${isDuplicate ? `
        <!-- Duplicate warning -->
        <tr>
          <td style="background-color:#fffbeb;border-left:4px solid #f59e0b;padding:14px 32px;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#92400e;">⚠️ Possible duplicate — same phone or email submitted in the last 24 hours.</p>
          </td>
        </tr>` : ""}

        <!-- Body -->
        <tr>
          <td class="email-body" style="background-color:#ffffff;padding:32px;">

            <!-- Contact info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding-bottom:20px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Customer</p>
                  <p style="margin:0;font-size:20px;font-weight:700;color:#111827;">${lead.fullName}</p>
                </td>
              </tr>
              <tr>
                <td>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="padding:0 8px 16px 0;vertical-align:top;">
                        <div style="background-color:#f9fafb;border-radius:8px;padding:14px 16px;">
                          <p style="margin:0 0 3px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Phone</p>
                          ${phoneFormatted
                            ? `<a href="tel:${lead.phoneDigits}" style="color:#1b5e35;font-size:16px;font-weight:600;text-decoration:none;">${phoneFormatted}</a>`
                            : `<span style="color:#9ca3af;font-size:14px;">Not provided</span>`
                          }
                        </div>
                      </td>
                      <td width="50%" style="padding:0 0 16px 8px;vertical-align:top;">
                        <div style="background-color:#f9fafb;border-radius:8px;padding:14px 16px;">
                          <p style="margin:0 0 3px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Email</p>
                          <a href="mailto:${lead.email}" style="color:#1b5e35;font-size:14px;font-weight:600;text-decoration:none;word-break:break-all;">${lead.email}</a>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2">
                        <div style="background-color:#f9fafb;border-radius:8px;padding:14px 16px;">
                          <p style="margin:0 0 3px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Address</p>
                          <p style="margin:0;font-size:15px;font-weight:500;color:#111827;">${lead.address}, ${lead.city}, CA</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            ${lead.details ? `
            <!-- Details -->
            <div style="border-top:1px solid #f3f4f6;padding-top:20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Details</p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;white-space:pre-line;">${escHtml(lead.details).replace(/\n/g, "<br>")}</p>
            </div>` : ""}

            ${photoCount > 0 ? `
            <!-- Photos -->
            <div style="border-top:1px solid #f3f4f6;padding-top:20px;margin-bottom:24px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Photos (${photoCount})</p>
              ${lead.photoUrls.map((url, i) => `<p style="margin:0 0 4px;font-size:13px;"><a href="${url}" style="color:#1b5e35;">View photo ${i + 1} →</a></p>`).join("")}
            </div>` : ""}

            <!-- CTA Button -->
            <div style="border-top:1px solid #f3f4f6;padding-top:24px;text-align:center;">
              <a href="${leadUrl}" class="cta-button" style="display:inline-block;background-color:#1b5e35;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.01em;">View Lead in Admin →</a>
              <p style="margin:12px 0 0;font-size:12px;color:#9ca3af;">You'll be prompted to log in if your session has expired.</p>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="email-footer" style="background-color:#f9fafb;border-radius:0 0 12px 12px;padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Lead ID: <span style="font-family:monospace;">${lead.leadId}</span></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>
      `,
    };

    // Photos are stored in Vercel Blob — links are in the email body above.
    // No binary attachments needed (and they'd hit Resend's size limits anyway).

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend API error:", res.status, body);
      logError(null, {
        severity: "critical",
        type: "email_delivery",
        message: `Resend API returned ${res.status} — lead notification not delivered`,
        path: "/api/lead",
        metadata: { status: res.status, response: body.slice(0, 500) },
      });
    }
  } catch (err) {
    console.error("Failed to send lead notification email:", err);
    logError(null, {
      severity: "critical",
      type: "email_delivery",
      message: err instanceof Error ? err.message : "Email notification threw unexpectedly",
      stack: err instanceof Error ? err.stack : undefined,
      path: "/api/lead",
    });
    // Don't throw — email failure shouldn't block lead creation
  }
}

/* ─── Partner lead-forward email ─── */

export interface PartnerForEmail {
  name: string;
  company: string;
  email: string;
}

/**
 * Sends a lead-details email to a partner's own address, alongside the SMS
 * forward. Throws on failure — callers should catch and record the outcome
 * in LeadForward, same contract as sendLeadSms.
 */
export async function sendPartnerLeadEmail(partner: PartnerForEmail, lead: LeadForEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.LEAD_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    throw new Error("Resend not configured (RESEND_API_KEY / LEAD_FROM_EMAIL missing)");
  }

  const phoneFormatted = lead.phoneDigits ? formatPhone(lead.phoneDigits) : null;
  const photoCount = lead.photoUrls.length;

  const payload: Record<string, unknown> = {
    from: fromEmail,
    to: [partner.email],
    subject: `New Lead Referral: ${lead.service} — ${lead.fullName} (${lead.city})`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<style>
  :root { color-scheme: light only; }
  @media (prefers-color-scheme: dark) {
    .email-header  { background-color: #1b5e35 !important; }
    .email-body    { background-color: #ffffff !important; }
    .email-footer  { background-color: #f9fafb !important; }
    .email-wrapper { background-color: #f0f2f5 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" class="email-wrapper" style="background-color:#f0f2f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td class="email-header" style="background-color:#1b5e35;border-radius:12px 12px 0 0;padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.6);">Referred by Santa Cruz Tree Pros</p>
                  <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ffffff;">New Lead Referral</h1>
                </td>
                <td align="right" valign="top">
                  <span style="display:inline-block;background-color:rgba(255,255,255,0.15);color:#ffffff;font-size:12px;font-weight:600;padding:5px 12px;border-radius:20px;white-space:nowrap;">${lead.service}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td class="email-body" style="background-color:#ffffff;padding:32px;">

            <p style="margin:0 0 20px;font-size:13px;color:#6b7280;">Hi ${partner.name}, a customer requested a tree service estimate in your coverage area. Please reach out directly to follow up.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding-bottom:20px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Customer</p>
                  <p style="margin:0;font-size:20px;font-weight:700;color:#111827;">${lead.fullName}</p>
                </td>
              </tr>
              <tr>
                <td>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="padding:0 8px 16px 0;vertical-align:top;">
                        <div style="background-color:#f9fafb;border-radius:8px;padding:14px 16px;">
                          <p style="margin:0 0 3px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Phone</p>
                          ${phoneFormatted
                            ? `<a href="tel:${lead.phoneDigits}" style="color:#1b5e35;font-size:16px;font-weight:600;text-decoration:none;">${phoneFormatted}</a>`
                            : `<span style="color:#9ca3af;font-size:14px;">Not provided</span>`
                          }
                        </div>
                      </td>
                      <td width="50%" style="padding:0 0 16px 8px;vertical-align:top;">
                        <div style="background-color:#f9fafb;border-radius:8px;padding:14px 16px;">
                          <p style="margin:0 0 3px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Email</p>
                          <a href="mailto:${lead.email}" style="color:#1b5e35;font-size:14px;font-weight:600;text-decoration:none;word-break:break-all;">${lead.email}</a>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2">
                        <div style="background-color:#f9fafb;border-radius:8px;padding:14px 16px;">
                          <p style="margin:0 0 3px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Address</p>
                          <p style="margin:0;font-size:15px;font-weight:500;color:#111827;">${lead.address}, ${lead.city}, CA</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            ${lead.details ? `
            <!-- Details -->
            <div style="border-top:1px solid #f3f4f6;padding-top:20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Details</p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;white-space:pre-line;">${escHtml(lead.details).replace(/\n/g, "<br>")}</p>
            </div>` : ""}

            ${photoCount > 0 ? `
            <!-- Photos -->
            <div style="border-top:1px solid #f3f4f6;padding-top:20px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Photos (${photoCount})</p>
              ${lead.photoUrls.map((url, i) => `<p style="margin:0 0 4px;font-size:13px;"><a href="${url}" style="color:#1b5e35;">View photo ${i + 1} →</a></p>`).join("")}
            </div>` : ""}

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="email-footer" style="background-color:#f9fafb;border-radius:0 0 12px 12px;padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Forwarded via Santa Cruz Tree Pros · Lead ID: <span style="font-family:monospace;">${lead.leadId}</span></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>
    `,
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API returned ${res.status}: ${body.slice(0, 300)}`);
  }
}
