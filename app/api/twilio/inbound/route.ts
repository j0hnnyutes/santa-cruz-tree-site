// app/api/twilio/inbound/route.ts
//
// Twilio webhook for inbound SMS to TWILIO_FROM_NUMBER.
// Configure in Twilio Console → Phone Numbers → your number →
// "A Message Comes In" → Webhook (POST) → this route's full URL.
//
// Handles standard opt-out/opt-in keywords by flipping Partner.active,
// so the admin dashboard reflects real subscription state. Every request
// is verified against Twilio's X-Twilio-Signature header — unsigned or
// mis-signed requests are rejected before touching the database.

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logError";

const STOP_KEYWORDS = new Set(["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"]);
const START_KEYWORDS = new Set(["START", "YES", "UNSTOP"]);
const HELP_KEYWORDS = new Set(["HELP", "INFO"]);

function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string,
  authToken: string,
): boolean {
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }
  const expected = createHmac("sha1", authToken).update(data, "utf-8").digest("base64");

  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);
  if (expectedBuf.length !== signatureBuf.length) return false;
  return timingSafeEqual(expectedBuf, signatureBuf);
}

// Compares by last-10-digits so it doesn't matter whether either side
// has a leading "1" country code — Partner.phone is stored digits-only
// and may or may not include it depending on how it was typed.
function phoneTail(input: string): string {
  const digits = input.replace(/\D/g, "");
  return digits.slice(-10);
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function twiml(message?: string): NextResponse {
  const body = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function POST(request: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) {
    return new NextResponse("Twilio not configured", { status: 500 });
  }

  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = String(value);
  });

  const signature = request.headers.get("x-twilio-signature") ?? "";
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("host") ?? "";
  const url = `${proto}://${host}${new URL(request.url).pathname}`;

  if (!signature || !validateTwilioSignature(url, params, signature, authToken)) {
    logError(request, {
      severity: "high",
      type: "auth",
      message: "Invalid Twilio inbound SMS signature",
      path: "/api/twilio/inbound",
      metadata: { from: params.From ?? null },
    });
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const from = params.From;
  const body = (params.Body ?? "").trim().toUpperCase();

  if (!from) {
    return twiml();
  }

  const tail = phoneTail(from);
  if (tail.length !== 10) {
    return twiml();
  }

  const partners = await prisma.partner.findMany();
  const partner = partners.find((p) => phoneTail(p.phone) === tail);

  if (!partner) {
    // Unknown number texting the business line — no partner record to update.
    return twiml();
  }

  const timestamp = new Date().toISOString().slice(0, 10);

  if (STOP_KEYWORDS.has(body)) {
    if (partner.active) {
      await prisma.partner.update({
        where: { id: partner.id },
        data: {
          active: false,
          notes: appendNote(partner.notes, `Opted out via SMS reply on ${timestamp}`),
        },
      });
    }
    return twiml(
      "Santa Cruz Tree Pros: You have been unsubscribed from lead notifications. Reply START to resubscribe.",
    );
  }

  if (START_KEYWORDS.has(body)) {
    if (!partner.active) {
      await prisma.partner.update({
        where: { id: partner.id },
        data: {
          active: true,
          notes: appendNote(partner.notes, `Resubscribed via SMS reply on ${timestamp}`),
        },
      });
    }
    return twiml("Santa Cruz Tree Pros: You're resubscribed to lead notifications. Reply STOP to opt out anytime.");
  }

  if (HELP_KEYWORDS.has(body)) {
    return twiml(
      "Santa Cruz Tree Pros lead notifications. Reply STOP to unsubscribe. Msg&data rates may apply.",
    );
  }

  // Any other inbound text — no action, no reply (avoids texting partners
  // back every time they reply "thanks" or "got it").
  return twiml();
}

function appendNote(existing: string | null, line: string): string {
  return existing ? `${existing}\n${line}` : line;
}
