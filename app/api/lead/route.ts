import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const TIME_ZONE = "America/Los_Angeles";

function digitsOnly(input: string) {
  return (input ?? "").replace(/\D/g, "");
}

function formatPhoneUS10(digits: string) {
  const d = (digits ?? "").replace(/\D/g, "").slice(0, 10);
  if (d.length !== 10) return digits ?? "";
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
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

function formatDateTimeInTZ(date: Date) {
  // Explicit, human-friendly Santa Cruz time (tries to show PST/PDT)
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function safeString(v: unknown) {
  return typeof v === "string" ? v : "";
}

export async function POST(req: Request) {
  try {
    // Rate limit
    const limited = await rateLimit(req, { windowMs: 60_000, max: 10 });
    if (!limited.ok) {
      return Response.json(
        { ok: false, error: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Honeypot
    const honey = String(body.company ?? "").trim();
    if (honey.length > 0) return Response.json({ ok: true });

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

    const fullName = safeString(body.fullName).trim();
    const email = safeString(body.email).trim();
    const service = safeString(body.service).trim();
    const details = safeString(body.details).trim();

    const phoneDigits = digitsOnly(safeString(body.phoneDigits)).slice(0, 10);
    const phonePretty = formatPhoneUS10(phoneDigits);

    // Validation
    const errors: Record<string, string> = {};
    if (fullName.length < 2) errors.fullName = "Name is required.";
    if (phoneDigits.length !== 10) errors.phone = "Phone must be 10 digits.";
    if (!isValidEmail(email)) errors.email = "Valid email is required.";
    if (!service) errors.service = "Service is required.";

    if (Object.keys(errors).length > 0) {
      return Response.json({ ok: false, errors }, { status: 400 });
    }

    // DB insert (schema matches your latest Lead table)
    const leadId = crypto.randomUUID();
    await prisma.lead.create({
      data: {
        leadId,
        fullName,
        phoneDigits,
        email,
        service,
        details: details || null,
        // status defaults to NEW
      },
    });

    // Email content (Santa Cruz time)
    const submittedAt = new Date();
    const submittedAtPretty = formatDateTimeInTZ(submittedAt);

    const resend = new Resend(apiKey);
    const subject = `New Tree Lead: ${service}`;

    const text = [
      "New lead submission:",
      "",
      `Name: ${fullName}`,
      `Phone: ${phonePretty}`,
      `Email: ${email}`,
      `Service: ${service}`,
      `Details: ${details || "(none)"}`,
      "",
      `Lead ID: ${leadId}`,
      `Submitted at (Santa Cruz): ${submittedAtPretty}`,
    ].join("\n");

    const html = `
      <h2>New lead submission</h2>
      <ul>
        <li><strong>Name:</strong> ${escapeHtml(fullName)}</li>
        <li><strong>Phone:</strong> ${escapeHtml(phonePretty)}</li>
        <li><strong>Email:</strong> ${escapeHtml(email)}</li>
        <li><strong>Service:</strong> ${escapeHtml(service)}</li>
        <li><strong>Lead ID:</strong> <span style="font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">${escapeHtml(
          leadId
        )}</span></li>
      </ul>
      <p><strong>Details:</strong></p>
      <pre style="white-space:pre-wrap;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">${escapeHtml(
        details || "(none)"
      )}</pre>
      <p style="color:#666;font-size:12px;">Submitted at (Santa Cruz): ${escapeHtml(
        submittedAtPretty
      )}</p>
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