// app/api/lead/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { logError } from "@/lib/logError";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

/* ─── Helpers ─── */

function digitsOnly(v: unknown) {
  return String(v ?? "").replace(/\D/g, "");
}

function toStr(v: unknown) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function formatPhone(digits: string) {
  if (digits.length !== 10) return digits;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/* ─── Parse request body (JSON or multipart) ─── */

type ParsedBody = {
  fields: Record<string, string>;
  photoAttachments: Array<{ filename: string; content: string; contentType: string }>;
};

async function parseRequest(request: Request): Promise<ParsedBody> {
  const ct = request.headers.get("content-type") || "";

  if (ct.includes("multipart/form-data")) {
    const fd = await request.formData();
    const fields: Record<string, string> = {};
    const photoAttachments: ParsedBody["photoAttachments"] = [];

    for (const [key, value] of fd.entries()) {
      if (typeof value === "string") {
        fields[key] = value;
      }
    }

    const files = fd.getAll("photos").filter((v): v is File => v instanceof File);
    for (const file of files.slice(0, 5)) {
      try {
        const buffer = await file.arrayBuffer();
        photoAttachments.push({
          filename: file.name,
          content: Buffer.from(buffer).toString("base64"),
          contentType: file.type || "image/jpeg",
        });
      } catch {
        // Skip unreadable files — don't block the lead
      }
    }

    return { fields, photoAttachments };
  }

  // JSON fallback
  try {
    const json = await request.json();
    const fields = Object.fromEntries(
      Object.entries(json ?? {}).map(([k, v]) => [k, toStr(v)])
    );
    return { fields, photoAttachments: [] };
  } catch {
    return { fields: {}, photoAttachments: [] };
  }
}

/* ─── Turnstile server-side verification ─── */

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY not set — skipping verification in dev");
    return true;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = await res.json();
    if (data?.success !== true) {
      logError(null, {
        severity: "warning",
        type: "captcha",
        message: "Turnstile verification returned success=false",
        path: "/api/lead",
        metadata: { errorCodes: data?.["error-codes"] ?? [] },
      });
    }
    return data?.success === true;
  } catch (err) {
    console.error("Turnstile verification failed:", err);
    logError(null, {
      severity: "warning",
      type: "captcha",
      message: err instanceof Error ? err.message : "Turnstile verification threw unexpectedly",
      stack: err instanceof Error ? err.stack : undefined,
      path: "/api/lead",
    });
    return false;
  }
}

/* ─── Email notification via Resend ─── */

async function sendLeadNotification(lead: {
  fullName: string;
  email: string;
  phoneDigits: string;
  address: string;
  city: string;
  service: string;
  details: string | null;
  leadId: string;
  photoAttachments: Array<{ filename: string; content: string; contentType: string }>;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.LEAD_TO_EMAIL;
  const fromEmail = process.env.LEAD_FROM_EMAIL;
  const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  if (!apiKey || !toEmail || !fromEmail) {
    console.warn("Resend not configured — skipping email notification");
    return;
  }

  const phoneFormatted = formatPhone(lead.phoneDigits);
  const photoCount = lead.photoAttachments.length;
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
                          <a href="tel:${lead.phoneDigits}" style="color:#1b5e35;font-size:16px;font-weight:600;text-decoration:none;">${phoneFormatted}</a>
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
              <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;white-space:pre-line;">${lead.details.replace(/\n/g, "<br>")}</p>
            </div>` : ""}

            ${photoCount > 0 ? `
            <!-- Photos -->
            <div style="border-top:1px solid #f3f4f6;padding-top:20px;margin-bottom:24px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Photos</p>
              <p style="margin:0;font-size:14px;color:#374151;">📎 ${photoCount} photo${photoCount > 1 ? "s" : ""} attached to this email</p>
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

    // Attach photos if present
    if (photoCount > 0) {
      payload.attachments = lead.photoAttachments.map((a) => ({
        filename: a.filename,
        content: a.content,
      }));
    }

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

/* ─── POST handler ─── */

export async function POST(request: Request) {
  // Rate limiting
  const rl = await rateLimit(request, { max: 10, windowMs: 60_000, keyPrefix: "lead:" });
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  const { fields, photoAttachments } = await parseRequest(request);

  // Validate Turnstile token — fail open so mobile users whose CAPTCHA
  // widget errors (Cloudflare error 110200) can still submit the form.
  const turnstileToken = fields.turnstileToken ?? "";
  if (turnstileToken) {
    const turnstileValid = await verifyTurnstile(turnstileToken);
    if (!turnstileValid) {
      console.warn("Turnstile verification failed — processing lead anyway.");
    }
  } else {
    console.warn("No Turnstile token provided — processing lead without CAPTCHA.");
  }

  // Parse & validate fields
  const fullName = toStr(fields.fullName || fields.name).trim();
  const email = toStr(fields.email).trim();
  const service = toStr(fields.service).trim();
  const details = toStr(fields.details || fields.message || fields.notes).trim();
  const address = toStr(fields.address).trim();
  const city = toStr(fields.city).trim();

  const phoneRaw = fields.phone ?? fields.phoneNumber ?? fields.phoneDigits ?? fields.mobile ?? "";
  const phoneDigits = digitsOnly(phoneRaw);

  const errors: Record<string, string> = {};
  if (!fullName) errors.fullName = "Name is required.";
  if (!email) errors.email = "Email is required.";
  if (!address) errors.address = "Address is required.";
  if (!city) errors.city = "City is required.";
  if (!service) errors.service = "Service is required.";
  if (phoneDigits.length !== 10) errors.phone = "Phone must be 10 digits.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  try {
    // Duplicate detection: check for same phone or email in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await prisma.lead.findFirst({
      where: {
        createdAt: { gte: twentyFourHoursAgo },
        OR: [{ phoneDigits }, { email: email.toLowerCase() }],
      },
      select: { leadId: true, fullName: true, createdAt: true },
    });

    const leadId = randomUUID();
    const isDuplicate = !!duplicate;
    const photoCount = photoAttachments.length;

    const lead = await prisma.lead.create({
      data: {
        leadId,
        fullName,
        phoneDigits,
        email,
        address,
        city,
        service,
        details: details || null,
        status: "NEW",
      },
      select: { leadId: true },
    });

    // Log creation event
    const photoNote = photoCount > 0 ? ` · ${photoCount} photo${photoCount > 1 ? "s" : ""}` : "";
    const eventDetail = isDuplicate
      ? `Possible duplicate of ${duplicate.fullName} (${duplicate.leadId.slice(0, 8)}...) from ${duplicate.createdAt.toISOString()}`
      : `${service} — ${city}${photoNote}`;

    await prisma.leadEvent.create({
      data: {
        leadId: lead.leadId,
        action: isDuplicate ? "CREATED_DUPLICATE" : "CREATED",
        detail: eventDetail,
      },
    });

    // If duplicate, also log on the original lead
    if (isDuplicate) {
      await prisma.leadEvent.create({
        data: {
          leadId: duplicate.leadId,
          action: "DUPLICATE_FLAGGED",
          detail: `New submission from ${fullName} (${lead.leadId.slice(0, 8)}...) may be a duplicate`,
        },
      }).catch(() => {});
    }

    // Save photos to disk so they can be viewed in the admin detail page
    if (photoCount > 0) {
      const uploadsDir = path.join(process.cwd(), "lead-uploads", lead.leadId);
      try {
        await mkdir(uploadsDir, { recursive: true });
        for (const att of photoAttachments) {
          // Sanitize filename to prevent path traversal
          const safeName = path.basename(att.filename).replace(/[^a-zA-Z0-9._-]/g, "_");
          await writeFile(path.join(uploadsDir, safeName), Buffer.from(att.content, "base64"));
        }
      } catch (err) {
        console.error("Failed to save lead photos to disk:", err);
        // Don't block lead creation if photo save fails
      }
    }

    // Await email so Vercel doesn't shut down the function before it sends
    await sendLeadNotification({
      fullName,
      email,
      phoneDigits,
      address,
      city,
      service,
      details: isDuplicate
        ? `${details || ""}\n\n⚠️ POSSIBLE DUPLICATE — same phone/email submitted in last 24h`.trim()
        : details || null,
      leadId: lead.leadId,
      photoAttachments,
    }).catch((err) => {
      console.error("Email notification error:", err);
      logError(null, {
        severity: "critical",
        type: "email_delivery",
        message: err instanceof Error ? err.message : "Uncaught email notification error",
        stack: err instanceof Error ? err.stack : undefined,
        path: "/api/lead",
      });
    });

    return NextResponse.json({ ok: true, leadId: lead.leadId }, { status: 200 });
  } catch (err) {
    console.error("POST /api/lead error:", err);
    logError(request, {
      severity: "error",
      type: "server_api",
      message: String(err),
      stack: err instanceof Error ? err.stack : undefined,
      path: "/api/lead",
    });
    return NextResponse.json(
      { ok: false, error: "Server error creating lead." },
      { status: 500 }
    );
  }
}
