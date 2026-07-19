// app/api/lead/route.ts
import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { logError } from "@/lib/logError";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { sendLeadSms } from "@/lib/twilio";
import { sendLeadNotification, sendPartnerLeadEmail } from "@/lib/email";
// Photos are resized client-side to compact JPEG data URLs and sent as
// base64 strings in the form body (photoData[] fields). This route decodes
// them and uploads to Vercel Blob via server-side put() — no client↔CDN
// handshake or onUploadCompleted webhook required, so it works on localhost.

/* ─── Helpers ─── */

function digitsOnly(v: unknown) {
  return String(v ?? "").replace(/\D/g, "");
}

function toStr(v: unknown) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

/* ─── Parse request body (JSON or multipart) ─── */
//
// Photos are no longer uploaded through this function.
// The client uploads files directly to Vercel Blob via /api/blob-upload
// (bypassing the 4.5 MB serverless body limit), then submits only the
// resulting Blob URLs here via the `photoUrls` form field.

type ParsedBody = {
  fields: Record<string, string>;
  photoDataList: string[]; // base64 JPEG data URLs from client resize
};

async function parseRequest(request: Request): Promise<ParsedBody> {
  const ct = request.headers.get("content-type") || "";

  if (ct.includes("multipart/form-data")) {
    const fd = await request.formData();
    const fields: Record<string, string> = {};

    for (const [key, value] of fd.entries()) {
      if (typeof value === "string" && key !== "photoData") {
        fields[key] = value;
      }
    }

    // Collect base64 JPEG data URLs sent by the client after canvas resize
    const photoDataList = fd
      .getAll("photoData")
      .filter((v): v is string => typeof v === "string" && v.startsWith("data:image/"))
      .slice(0, 5); // hard cap at 5

    return { fields, photoDataList };
  }

  // JSON fallback
  try {
    const json = await request.json();
    const fields = Object.fromEntries(
      Object.entries(json ?? {})
        .filter(([k]) => k !== "photoData")
        .map(([k, v]) => [k, toStr(v)])
    );
    const photoDataList = Array.isArray(json?.photoData)
      ? (json.photoData as unknown[])
          .filter((v): v is string => typeof v === "string" && v.startsWith("data:image/"))
          .slice(0, 5)
      : [];
    return { fields, photoDataList };
  } catch {
    return { fields: {}, photoDataList: [] };
  }
}

/* ─── Server-side Vercel Blob upload ─── */
// Decodes base64 JPEG data URLs and uploads them to Vercel Blob.
// Running on the server avoids the onUploadCompleted webhook dependency
// (which requires a publicly-reachable server and breaks on localhost).
async function uploadPhotosToBlobStore(
  photoDataList: string[],
  leadPrefix: string,
): Promise<string[]> {
  console.log(`[photos] received ${photoDataList.length} photo(s) for lead ${leadPrefix}`);
  if (!photoDataList.length) return [];
  // BLOB2_READ_WRITE_TOKEN = new public store; BLOB_READ_WRITE_TOKEN = legacy fallback
  const blobToken = process.env.BLOB2_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    console.warn("[photos] No blob token found (checked BLOB2_READ_WRITE_TOKEN and BLOB_READ_WRITE_TOKEN) — skipping photo upload");
    return [];
  }
  console.log(`[photos] using token: ${blobToken.slice(0, 24)}...`);
  const results = await Promise.allSettled(
    photoDataList.map(async (dataUrl, i) => {
      const [header, b64] = dataUrl.split(",");
      const mimeType = header.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
      const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
      const buf = Buffer.from(b64, "base64");
      console.log(`[photos] uploading photo ${i + 1}: ${buf.length} bytes, type=${mimeType}`);
      const blob = await put(`leads/${leadPrefix}-photo-${i + 1}.${ext}`, buf, {
        access: "public",
        contentType: mimeType,
        token: blobToken,
      });
      console.log(`[photos] photo ${i + 1} uploaded OK: ${blob.url}`);
      return blob.url;
    }),
  );
  const urls: string[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") urls.push(r.value);
    else {
      const err = r.reason as Error & { status?: number; code?: string };
      console.error("[photos] blob upload failed:", {
        message: err?.message,
        status: err?.status,
        code: err?.code,
        stack: err?.stack?.split("\n")[0],
      });
    }
  }
  console.log(`[photos] saved ${urls.length}/${photoDataList.length} photo(s)`);
  return urls;
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
        severity: "medium",
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
      severity: "medium",
      type: "captcha",
      message: err instanceof Error ? err.message : "Turnstile verification threw unexpectedly",
      stack: err instanceof Error ? err.stack : undefined,
      path: "/api/lead",
    });
    return false;
  }
}

/* ─── POST handler ─── */

export async function POST(request: Request) {
  // Rate limiting
  const rl = await rateLimit(request, { max: 10, windowMs: 60_000, keyPrefix: "lead:" });
  if (!rl.ok) {
    logError(request, {
      severity: "medium",
      type: "rate_limit",
      message: "Rate limit hit on /api/lead — possible form spam attempt",
      path: "/api/lead",
    });
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  const { fields, photoDataList } = await parseRequest(request);

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

  const utmSource   = toStr(fields.utmSource).trim()   || null;
  const utmMedium   = toStr(fields.utmMedium).trim()   || null;
  const utmCampaign = toStr(fields.utmCampaign).trim() || null;
  const sessionId   = toStr(fields.sessionId).trim()   || null;

  const errors: Record<string, string> = {};
  if (!fullName) errors.fullName = "Name is required.";
  if (!email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!address) errors.address = "Address is required.";
  if (!city) errors.city = "City is required.";
  if (!service) errors.service = "Service is required.";
  if (phoneDigits.length > 0 && phoneDigits.length !== 10) errors.phone = "Phone must be 10 digits.";

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

    // Decode base64 photos and upload to Vercel Blob from the server.
    // Server-side put() needs no webhook callback and works on localhost.
    const photoUrls = await uploadPhotosToBlobStore(
      photoDataList,
      leadId.slice(0, 8),
    );

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
        photoUrls,
        utmSource,
        utmMedium,
        utmCampaign,
        sessionId,
      },
      select: { leadId: true },
    });

    // Log creation event
    const savedPhotoCount = photoUrls.length;
    const photoNote = savedPhotoCount > 0 ? ` · ${savedPhotoCount} photo${savedPhotoCount > 1 ? "s" : ""}` : "";
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

    // Auto-forward: find an active partner covering this city and send SMS.
    // Skipped for duplicates — a repeat submission from the same customer
    // shouldn't fire a second automated text to a partner. It still reaches
    // the business owner via the lead notification email below (always
    // sent, duplicate or not), for manual review/forwarding.
    //
    // Deferred via after() — doesn't block the lead creation response, but
    // Vercel keeps the function alive until it finishes instead of freezing
    // it mid-send. A bare fire-and-forget IIFE here (the prior approach) hit
    // the exact bug already diagnosed and fixed for the email send in
    // c2c8ca0 — the runtime can shut down before the awaited work inside
    // resolves.
    if (!isDuplicate) after(async () => {
      try {
        const cityLower = city.toLowerCase();
        // Find the active partner covering this city. We load all active
        // partners and match case-insensitively in JS — the list is small
        // enough that a full scan is fine.
        //
        // A partner whose cities array contains "*" covers every city — used
        // as a catch-all (e.g. the owner's own number before real per-city
        // partners exist). Exact city matches take priority over the
        // wildcard so a specific partner isn't shadowed once one exists.
        const allActive = await prisma.partner.findMany({
          where: { active: true },
          select: { id: true, name: true, company: true, phone: true, email: true, cities: true },
        });
        const exactMatch = allActive.find((p) =>
          p.cities.some((c) => c.toLowerCase() === cityLower)
        );
        const wildcardMatch = allActive.find((p) => p.cities.includes("*"));
        const autoPartner = exactMatch ?? wildcardMatch ?? null;

        if (!autoPartner) return;

        const smsPayload = {
          leadId: lead.leadId,
          fullName,
          phoneDigits,
          email,
          address,
          city,
          service,
          details: details || null,
        };

        let twilioSid: string | null = null;
        let smsStatus: "SENT" | "FAILED" = "SENT";
        let smsError: string | null = null;

        try {
          twilioSid = await sendLeadSms(autoPartner.phone, smsPayload);
        } catch (err) {
          smsStatus = "FAILED";
          smsError = err instanceof Error ? err.message : String(err);
          console.error("[auto-forward] SMS failed:", smsError);
        }

        const forwardWrites: Promise<unknown>[] = [
          prisma.leadForward.create({
            data: {
              leadId: lead.leadId,
              partnerId: autoPartner.id,
              method: "SMS",
              status: smsStatus,
              twilioSid,
              isAuto: true,
              error: smsError,
            },
          }),
          prisma.leadEvent.create({
            data: {
              leadId: lead.leadId,
              action: smsStatus === "SENT" ? "FORWARDED" : "FORWARD_FAILED",
              detail:
                smsStatus === "SENT"
                  ? `Auto-SMS sent to ${autoPartner.name} (${autoPartner.company})`
                  : `Auto-SMS to ${autoPartner.name} failed: ${smsError}`,
            },
          }),
        ];

        // Also email the partner directly, if they have an address on file —
        // independent of the SMS outcome above. Same skip-on-duplicate scope
        // (this whole block is gated by !isDuplicate already).
        const autoPartnerEmail = autoPartner.email;
        if (autoPartnerEmail) {
          let emailStatus: "SENT" | "FAILED" = "SENT";
          let emailError: string | null = null;
          try {
            await sendPartnerLeadEmail({ ...autoPartner, email: autoPartnerEmail }, {
              leadId: lead.leadId,
              fullName,
              phoneDigits,
              email,
              address,
              city,
              service,
              details: details || null,
              photoUrls,
            });
          } catch (err) {
            emailStatus = "FAILED";
            emailError = err instanceof Error ? err.message : String(err);
            console.error("[auto-forward] partner email failed:", emailError);
          }

          forwardWrites.push(
            prisma.leadForward.create({
              data: {
                leadId: lead.leadId,
                partnerId: autoPartner.id,
                method: "EMAIL",
                status: emailStatus,
                isAuto: true,
                error: emailError,
              },
            }),
            prisma.leadEvent.create({
              data: {
                leadId: lead.leadId,
                action: emailStatus === "SENT" ? "FORWARDED" : "FORWARD_FAILED",
                detail:
                  emailStatus === "SENT"
                    ? `Auto-email sent to ${autoPartner.name} (${autoPartner.company})`
                    : `Auto-email to ${autoPartner.name} failed: ${emailError}`,
              },
            }),
          );
        }

        await Promise.all(forwardWrites);
      } catch (err) {
        console.error("[auto-forward] unexpected error:", err);
      }
    });

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
      photoUrls,
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

    return NextResponse.json({
      ok: true,
      leadId: lead.leadId,
      photosReceived: photoDataList.length,
      photosSaved: photoUrls.length,
    }, { status: 200 });
  } catch (err) {
    console.error("POST /api/lead error:", err);
    logError(request, {
      severity: "high",
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
