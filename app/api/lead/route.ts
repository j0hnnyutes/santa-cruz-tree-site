import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

function digitsOnly(input: string) {
  return (input ?? "").replace(/\D/g, "");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email ?? "");
}

function escapeHtml(input: string) {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Honeypot: bots fill this, humans won't.
    const honey = String(body.company ?? "").trim();
    if (honey.length > 0) {
      // Return OK to avoid tipping off bots.
      return Response.json({ ok: true });
    }

    // Rate limit: 10/min per IP
    const ip = getClientIp(req) || "unknown";
    const rl = rateLimit(`lead:${ip}`, 10, 60_000);
    if (!rl.ok) {
      return Response.json(
        { ok: false, error: "Too many requests. Try again shortly." },
        { status: 429 }
      );
    }

    // Env checks
    const apiKey = process.env.RESEND_API_KEY;
    const toRaw = process.env.LEAD_TO_EMAIL;
    const from = process.env.LEAD_FROM_EMAIL;

    if (!apiKey || !toRaw || !from) {
      return Response.json(
        {
          ok: false,
          error:
            "Missing env vars: RESEND_API_KEY, LEAD_TO_EMAIL, and/or LEAD_FROM_EMAIL",
        },
        { status: 500 }
      );
    }

    const toList = toRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (toList.length === 0) {
      return Response.json(
        { ok: false, error: "LEAD_TO_EMAIL has no valid recipients." },
        { status: 500 }
      );
    }

    // Inputs
    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const service = String(body.service ?? "").trim();
    const details = String(body.details ?? "").trim();
    const phoneDigits = digitsOnly(String(body.phoneDigits ?? "")).slice(0, 10);

    // Server-side validation
    const errors: Record<string, string> = {};
    if (fullName.length < 2) errors.fullName = "Name is required.";
    if (phoneDigits.length !== 10) errors.phone = "Phone must be 10 digits.";
    if (!isValidEmail(email)) errors.email = "Valid email is required.";
    if (!service) errors.service = "Service is required.";

    if (Object.keys(errors).length > 0) {
      return Response.json({ ok: false, errors }, { status: 400 });
    }

    const leadId = crypto.randomUUID();
    const submittedAtIso = new Date().toISOString();
    const userAgent = req.headers.get("user-agent") || null;

    // OPTIONAL tracking fields (if your frontend later sends them)
    const pagePath = typeof body.pagePath === "string" ? body.pagePath : null;
    const referrer = typeof body.referrer === "string" ? body.referrer : null;

    const utmSource = typeof body.utmSource === "string" ? body.utmSource : null;
    const utmMedium = typeof body.utmMedium === "string" ? body.utmMedium : null;
    const utmCampaign =
      typeof body.utmCampaign === "string" ? body.utmCampaign : null;
    const utmTerm = typeof body.utmTerm === "string" ? body.utmTerm : null;
    const utmContent =
      typeof body.utmContent === "string" ? body.utmContent : null;
    const gclid = typeof body.gclid === "string" ? body.gclid : null;
    const fbclid = typeof body.fbclid === "string" ? body.fbclid : null;

    // ✅ DB LOG
    await prisma.lead.create({
      data: {
        leadId,
        fullName,
        email,
        phoneDigits,
        service,
        details: details || null,

        pagePath,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        gclid,
        fbclid,

        ip: ip || null,
        userAgent,

        raw: JSON.stringify(body).slice(0, 50_000),
      },
    });

    // Email
    const resend = new Resend(apiKey);

    const subject = `New Lead • ${service}`;
    const text = [
      "New lead submission",
      "",
      `Lead ID: ${leadId}`,
      `Submitted: ${submittedAtIso}`,
      "",
      `Name: ${fullName}`,
      `Phone: ${phoneDigits}`,
      `Email: ${email}`,
      `Service: ${service}`,
      `Details: ${details || "(none)"}`,
      "",
      pagePath ? `Page: ${pagePath}` : "",
      referrer ? `Referrer: ${referrer}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const html = `
      <h2>New lead submission</h2>
      <ul>
        <li><strong>Lead ID:</strong> ${escapeHtml(leadId)}</li>
        <li><strong>Submitted:</strong> ${escapeHtml(submittedAtIso)}</li>
        <li><strong>Name:</strong> ${escapeHtml(fullName)}</li>
        <li><strong>Phone:</strong> ${escapeHtml(phoneDigits)}</li>
        <li><strong>Email:</strong> ${escapeHtml(email)}</li>
        <li><strong>Service:</strong> ${escapeHtml(service)}</li>
      </ul>
      ${pagePath ? `<p><strong>Page:</strong> ${escapeHtml(pagePath)}</p>` : ""}
      ${
        referrer ? `<p><strong>Referrer:</strong> ${escapeHtml(referrer)}</p>` : ""
      }
      <p><strong>Details:</strong></p>
      <pre style="white-space:pre-wrap;font-family:monospace;">${escapeHtml(
        details || "(none)"
      )}</pre>
    `;

    const result = await resend.emails.send({
      from,
      to: toList,
      subject,
      text,
      html,
      replyTo: email,
    });

    if (result.error) {
      return Response.json(
        { ok: false, error: result.error.message },
        { status: 502 }
      );
    }

    return Response.json({ ok: true, leadId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown server error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}