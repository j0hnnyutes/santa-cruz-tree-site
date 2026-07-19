// app/api/admin/leads/forward/route.ts
//
// POST /api/admin/leads/forward
// Body: { leadId: string; partnerId: string }
//
// Sends an SMS to the partner's phone with lead details, and — if the
// partner has an email on file — also emails them the same details. Each
// channel is recorded as its own LeadForward row + LeadEvent, independent
// of the other's outcome.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { sendLeadSms } from "@/lib/twilio";
import { sendPartnerLeadEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    leadId?: string;
    partnerId?: string;
  };

  const { leadId, partnerId } = body;
  if (!leadId || !partnerId) {
    return NextResponse.json(
      { error: "leadId and partnerId are required" },
      { status: 400 },
    );
  }

  // Fetch lead + partner in parallel
  const [lead, partner] = await Promise.all([
    prisma.lead.findUnique({
      where: { leadId },
      select: {
        leadId: true, fullName: true, phoneDigits: true, email: true,
        address: true, city: true, service: true, details: true, photoUrls: true,
      },
    }),
    prisma.partner.findUnique({
      where: { id: partnerId },
      select: { id: true, name: true, company: true, phone: true, email: true },
    }),
  ]);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }
  if (!partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  // Send SMS
  let twilioSid: string | null = null;
  let smsError: string | null = null;
  let smsStatus: "SENT" | "FAILED" = "SENT";

  try {
    twilioSid = await sendLeadSms(partner.phone, lead);
  } catch (err) {
    smsStatus = "FAILED";
    smsError = err instanceof Error ? err.message : String(err);
    console.error("SMS forward error:", smsError);
  }

  const writes: Promise<unknown>[] = [
    prisma.leadForward.create({
      data: {
        leadId,
        partnerId,
        method: "SMS",
        status: smsStatus,
        twilioSid,
        isAuto: false,
        error: smsError,
      },
    }),
    prisma.leadEvent.create({
      data: {
        leadId,
        action: smsStatus === "SENT" ? "FORWARDED" : "FORWARD_FAILED",
        detail: smsStatus === "SENT"
          ? `SMS sent to ${partner.name} (${partner.company})`
          : `SMS to ${partner.name} failed: ${smsError}`,
      },
    }),
  ];

  // Also email the partner, if they have an address on file — independent
  // of the SMS outcome above.
  let emailAttempted = false;
  let emailStatus: "SENT" | "FAILED" | null = null;
  let emailError: string | null = null;

  if (partner.email) {
    emailAttempted = true;
    emailStatus = "SENT";
    try {
      await sendPartnerLeadEmail({ ...partner, email: partner.email }, lead);
    } catch (err) {
      emailStatus = "FAILED";
      emailError = err instanceof Error ? err.message : String(err);
      console.error("Email forward error:", emailError);
    }

    writes.push(
      prisma.leadForward.create({
        data: {
          leadId,
          partnerId,
          method: "EMAIL",
          status: emailStatus,
          isAuto: false,
          error: emailError,
        },
      }),
      prisma.leadEvent.create({
        data: {
          leadId,
          action: emailStatus === "SENT" ? "FORWARDED" : "FORWARD_FAILED",
          detail: emailStatus === "SENT"
            ? `Email sent to ${partner.name} (${partner.company})`
            : `Email to ${partner.name} failed: ${emailError}`,
        },
      }),
    );
  }

  await Promise.all(writes);

  if (smsStatus === "FAILED") {
    return NextResponse.json(
      {
        ok: false,
        error: `SMS failed: ${smsError}`,
        emailAttempted, emailStatus, emailError,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    twilioSid,
    emailAttempted, emailStatus, emailError,
  });
}
