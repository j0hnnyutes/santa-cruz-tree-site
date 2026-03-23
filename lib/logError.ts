import { prisma } from "@/lib/prisma";

/* ─── Request helpers ─── */

function getClientIp(req: Request | null | undefined): string {
  if (!req) return "unknown";
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return "unknown";
}

function getUserAgent(req: Request | null | undefined): string | null {
  if (!req) return null;
  return req.headers.get("user-agent") || null;
}

// Vercel injects geo headers on every request — free, no extra service needed
function getGeo(req: Request | null | undefined): { country?: string; city?: string } {
  if (!req) return {};
  const country = req.headers.get("x-vercel-ip-country") || undefined;
  const city    = req.headers.get("x-vercel-ip-city")    || undefined;
  return { country, city };
}

/* ─── Device parser ─── */

function parseDevice(ua: string | null): string {
  if (!ua) return "Unknown device";
  if (/iphone/i.test(ua))   return "iPhone";
  if (/ipad/i.test(ua))     return "iPad";
  if (/android/i.test(ua))  return "Android";
  if (/edg/i.test(ua))      return "Edge / Desktop";
  if (/chrome/i.test(ua))   return "Chrome / Desktop";
  if (/safari/i.test(ua))   return "Safari / Desktop";
  if (/firefox/i.test(ua))  return "Firefox / Desktop";
  return "Desktop";
}

/* ─── Alert email ─── */

const ALERT_THROTTLE_MINUTES = 15;

type AlertOptions = {
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  message: string;
  stack?: string;
  path?: string;
  metadata?: Record<string, unknown>;
};

async function maybeSendAlert(
  options: AlertOptions,
  ip: string,
  userAgent: string | null,
  geo: { country?: string; city?: string },
): Promise<void> {
  const apiKey    = process.env.RESEND_API_KEY;
  const toEmail   = process.env.LEAD_TO_EMAIL;
  const fromEmail = process.env.LEAD_FROM_EMAIL;
  if (!apiKey || !toEmail || !fromEmail) return;

  // ── Rate limit: 1 alert per error type per 15 minutes ──────────────────────
  const throttleKey = `alert_throttle_${options.type}`;
  try {
    const lastAlert = await (prisma as any).adminConfig.findUnique({
      where: { key: throttleKey },
    });
    if (lastAlert) {
      const elapsed = Date.now() - new Date(lastAlert.value).getTime();
      if (elapsed < ALERT_THROTTLE_MINUTES * 60 * 1000) return;
    }
    await (prisma as any).adminConfig.upsert({
      where:  { key: throttleKey },
      create: { key: throttleKey, value: new Date().toISOString() },
      update: { value: new Date().toISOString() },
    });
  } catch {
    // If throttle check fails, send anyway (better to over-alert than miss one)
  }

  // ── Context: recent frequency + last few errors ─────────────────────────────
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const oneDayAgo  = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [hourCount, dayCount, recentErrors] = await Promise.all([
    (prisma as any).errorLog.count({ where: { type: options.type, createdAt: { gte: oneHourAgo } } }),
    (prisma as any).errorLog.count({ where: { createdAt: { gte: oneDayAgo } } }),
    (prisma as any).errorLog.findMany({
      where:   { createdAt: { gte: oneDayAgo } },
      orderBy: { createdAt: "desc" },
      take:    5,
      select:  { severity: true, type: true, message: true, path: true, createdAt: true },
    }),
  ]).catch(() => [1, 1, []]);

  // ── Build email ─────────────────────────────────────────────────────────────
  const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const device  = parseDevice(userAgent);
  const stackLines = options.stack
    ? options.stack.split("\n").slice(0, 7).join("\n")
    : null;

  const SEVERITY_COLOR: Record<string, string> = {
    critical: "#dc2626",
    high:     "#ea580c",
    medium:   "#d97706",
    low:      "#6b7280",
  };
  const headerColor = SEVERITY_COLOR[options.severity] ?? "#6b7280";

  const SEVERITY_EMOJI: Record<string, string> = {
    critical: "🚨",
    high:     "⚠️",
    medium:   "🔶",
    low:      "ℹ️",
  };
  const emoji = SEVERITY_EMOJI[options.severity] ?? "⚠️";

  function esc(s: string) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const recentRowsHtml = (Array.isArray(recentErrors) ? recentErrors as Array<{
    severity: string; type: string; message: string; path: string | null; createdAt: Date;
  }> : [])
    .map((e) => {
      const color = SEVERITY_COLOR[e.severity] ?? "#6b7280";
      const time  = new Date(e.createdAt).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
      return `
        <tr>
          <td style="padding:6px 8px;font-size:11px;font-weight:600;color:${color};white-space:nowrap;">${esc(e.severity.toUpperCase())}</td>
          <td style="padding:6px 8px;font-size:12px;color:#374151;font-family:monospace;">${esc(e.type)}</td>
          <td style="padding:6px 8px;font-size:12px;color:#374151;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(e.message.slice(0, 80))}</td>
          <td style="padding:6px 8px;font-size:11px;color:#9ca3af;white-space:nowrap;">${esc(time)}</td>
        </tr>`;
    })
    .join("");

  const geoStr = [geo.city, geo.country].filter(Boolean).join(", ") || "Unknown location";
  const metaStr = options.metadata ? JSON.stringify(options.metadata, null, 2) : null;
  const now = new Date().toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:28px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr>
    <td style="background:${headerColor};border-radius:12px 12px 0 0;padding:24px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.7);">
              santacruztreepros.com — Error Alert
            </p>
            <h1 style="margin:6px 0 0;font-size:20px;font-weight:700;color:#fff;">
              ${emoji} ${esc(options.severity.charAt(0).toUpperCase() + options.severity.slice(1))} — ${esc(options.type)}
            </h1>
          </td>
          <td align="right" valign="top">
            <span style="display:inline-block;background:rgba(255,255,255,0.2);color:#fff;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;">
              ${esc(now)}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="background:#fff;padding:28px;">

      <!-- Error message -->
      <div style="background:#fef2f2;border-left:4px solid ${headerColor};border-radius:0 6px 6px 0;padding:14px 16px;margin-bottom:20px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:${headerColor};">Error Message</p>
        <p style="margin:0;font-size:14px;font-weight:500;color:#111;word-break:break-word;">${esc(options.message)}</p>
        ${options.path ? `<p style="margin:6px 0 0;font-size:12px;color:#6b7280;font-family:monospace;">Path: ${esc(options.path)}</p>` : ""}
      </div>

      <!-- Context grid -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td width="33%" style="padding:0 6px 12px 0;vertical-align:top;">
            <div style="background:#f9fafb;border-radius:8px;padding:12px 14px;">
              <p style="margin:0 0 3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Device</p>
              <p style="margin:0;font-size:13px;font-weight:500;color:#111;">${esc(device)}</p>
            </div>
          </td>
          <td width="33%" style="padding:0 6px 12px;vertical-align:top;">
            <div style="background:#f9fafb;border-radius:8px;padding:12px 14px;">
              <p style="margin:0 0 3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Location</p>
              <p style="margin:0;font-size:13px;font-weight:500;color:#111;">${esc(geoStr)}</p>
            </div>
          </td>
          <td width="33%" style="padding:0 0 12px 6px;vertical-align:top;">
            <div style="background:#f9fafb;border-radius:8px;padding:12px 14px;">
              <p style="margin:0 0 3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">IP</p>
              <p style="margin:0;font-size:13px;font-weight:500;color:#111;font-family:monospace;">${esc(ip)}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:0 6px 0 0;vertical-align:top;">
            <div style="background:#f9fafb;border-radius:8px;padding:12px 14px;">
              <p style="margin:0 0 3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Frequency</p>
              <p style="margin:0;font-size:13px;font-weight:500;color:#111;">
                <strong>${hourCount}×</strong> this error type in the last hour
                &nbsp;·&nbsp; <strong>${dayCount}</strong> total errors today
              </p>
            </div>
          </td>
          <td style="padding:0 0 0 6px;vertical-align:top;">
            <div style="background:#f9fafb;border-radius:8px;padding:12px 14px;">
              <p style="margin:0 0 3px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;">Throttle</p>
              <p style="margin:0;font-size:13px;font-weight:500;color:#111;">1 alert / ${ALERT_THROTTLE_MINUTES} min</p>
            </div>
          </td>
        </tr>
      </table>

      ${stackLines ? `
      <!-- Stack trace -->
      <div style="margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#6b7280;">Stack Trace</p>
        <pre style="margin:0;background:#111827;color:#e5e7eb;font-size:11px;line-height:1.6;padding:14px 16px;border-radius:8px;overflow:auto;white-space:pre-wrap;word-break:break-all;">${esc(stackLines)}</pre>
      </div>` : ""}

      ${metaStr ? `
      <!-- Metadata -->
      <div style="margin-bottom:20px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#6b7280;">Metadata</p>
        <pre style="margin:0;background:#f9fafb;color:#374151;font-size:11px;line-height:1.6;padding:14px 16px;border-radius:8px;overflow:auto;white-space:pre-wrap;">${esc(metaStr)}</pre>
      </div>` : ""}

      ${recentRowsHtml ? `
      <!-- Recent errors -->
      <div style="border-top:1px solid #f3f4f6;padding-top:20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#6b7280;">Recent Errors (last 24 h)</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:6px 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;text-align:left;">Sev</th>
              <th style="padding:6px 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;text-align:left;">Type</th>
              <th style="padding:6px 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;text-align:left;">Message</th>
              <th style="padding:6px 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#9ca3af;text-align:left;">Time</th>
            </tr>
          </thead>
          <tbody>${recentRowsHtml}</tbody>
        </table>
      </div>` : ""}

      <!-- CTA -->
      <div style="border-top:1px solid #f3f4f6;padding-top:20px;text-align:center;">
        <a href="${siteUrl}/admin/errors"
           style="display:inline-block;background:${headerColor};color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
          View All Errors in Admin →
        </a>
        <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;">You'll be prompted to log in if your session has expired.</p>
      </div>

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f9fafb;border-radius:0 0 12px 12px;padding:14px 28px;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:11px;color:#9ca3af;">
        santacruztreepros.com error alert · alerts throttled to 1 per ${ALERT_THROTTLE_MINUTES} min per error type
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `${emoji} [${options.severity}] ${options.type} — ${options.message.slice(0, 70)}`,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[logError] Alert email failed:", res.status, body.slice(0, 200));
    }
  } catch (err) {
    console.error("[logError] Alert email threw:", err);
  }
}

/* ─── Public API ─── */

export function logError(
  req: Request | null | undefined,
  options: {
    severity: "critical" | "high" | "medium" | "low";
    type: string;
    message: string;
    stack?: string;
    path?: string;
    metadata?: Record<string, unknown>;
  },
): void {
  const ip        = getClientIp(req);
  const userAgent = getUserAgent(req);
  const geo       = getGeo(req);

  const saveAndAlert = async () => {
    // Merge geo into metadata so it's queryable in the admin errors view
    const enrichedMeta = { ...options.metadata, ...geo };
    const metaJson = Object.keys(enrichedMeta).length
      ? JSON.stringify(enrichedMeta)
      : null;

    await (prisma as any).errorLog.create({
      data: {
        severity: options.severity,
        type:     options.type,
        message:  options.message,
        stack:    options.stack  || null,
        path:     options.path   || null,
        ip,
        userAgent,
        metadata: metaJson,
      },
    });

    if (options.severity === "critical" || options.severity === "high") {
      await maybeSendAlert(options, ip, userAgent, geo);
    }
  };

  saveAndAlert().catch((err) => console.error("Failed to log/alert error:", err));
}
