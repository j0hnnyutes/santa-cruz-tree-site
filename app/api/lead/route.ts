import { Resend } from "resend";

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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Honeypot: bots fill this, humans won't.
    const honey = String(body.company ?? "").trim();
    if (honey.length > 0) {
      // Return OK to avoid tipping off bots.
      return Response.json({ ok: true });
    }

    // Env checks (fail loudly)
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.LEAD_TO_EMAIL;
    const from = process.env.LEAD_FROM_EMAIL;

    if (!apiKey || !to || !from) {
      return Response.json(
        {
          ok: false,
          error:
            "Missing env vars: RESEND_API_KEY, LEAD_TO_EMAIL, and/or LEAD_FROM_EMAIL",
        },
        { status: 500 }
      );
    }

    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const service = String(body.service ?? "").trim();
    const details = String(body.details ?? "").trim();
    const phoneDigits = digitsOnly(String(body.phoneDigits ?? "")).slice(0, 10);

    // Server-side validation (never trust client)
    const errors: Record<string, string> = {};
    if (fullName.length < 2) errors.fullName = "Name is required.";
    if (phoneDigits.length !== 10) errors.phone = "Phone must be 10 digits.";
    if (!isValidEmail(email)) errors.email = "Valid email is required.";
    if (!service) errors.service = "Service is required.";

    if (Object.keys(errors).length > 0) {
      return Response.json({ ok: false, errors }, { status: 400 });
    }

    const resend = new Resend(apiKey);

    const subject = `New Tree Lead: ${service}`;
    const text = [
      "New lead submission:",
      "",
      `Name: ${fullName}`,
      `Phone: ${phoneDigits}`,
      `Email: ${email}`,
      `Service: ${service}`,
      `Details: ${details || "(none)"}`,
      "",
      `Submitted at: ${new Date().toISOString()}`,
    ].join("\n");

    const html = `
      <h2>New lead submission</h2>
      <ul>
        <li><strong>Name:</strong> ${escapeHtml(fullName)}</li>
        <li><strong>Phone:</strong> ${escapeHtml(phoneDigits)}</li>
        <li><strong>Email:</strong> ${escapeHtml(email)}</li>
        <li><strong>Service:</strong> ${escapeHtml(service)}</li>
      </ul>
      <p><strong>Details:</strong></p>
      <pre style="white-space:pre-wrap;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">${escapeHtml(
        details || "(none)"
      )}</pre>
      <p style="color:#666;font-size:12px;">Submitted at: ${escapeHtml(
        new Date().toISOString()
      )}</p>
    `;

    const result = await resend.emails.send({
      from,
      to,
      subject,
      text,
      html,
      replyTo: email,
    });

    // IMPORTANT: Resend returns { data, error }
    if (result.error) {
      return Response.json(
        { ok: false, error: result.error.message },
        { status: 502 }
      );
    }

    return Response.json({ ok: true, id: result.data?.id ?? null });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown server error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}