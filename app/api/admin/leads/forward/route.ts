// app/api/admin/leads/forward/route.ts
//
// POST /api/admin/leads/forward
// Body: { leadId: string; partnerId: string }
//
// Sends an SMS to the partner's phone with lead details, records the forward
// in LeadForward, and logs a FORWARDED event on the lead.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { sendLeadSms } from "@/lib/twilio";

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
        address: true, city: true, service: true, details: true,
      },
    }),
    prisma.partner.findUnique({
      where: { id: partnerId },
      select: { id: true, name: true, company: true, phone: true },
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
  let status: "SENT" | "FAILED" = "SENT";

  try {
    twilioSid = await sendLeadSms(partner.phone, lead);
  } catch (err) {
    status = "FAILED";
    smsError = err instanceof Error ? err.message : String(err);
    console.error("SMS forward error:", smsError);
  }

  // Record forward + lead event
  await Promise.all([
    prisma.leadForward.create({
      data: {
        leadId,
        partnerId,
        method: "SMS",
        status,
        twilioSid,
        isAuto: false,
        error: smsError,
      },
    }),
    prisma.leadEvent.create({
      data: {
        leadId,
        action: status === "SENT" ? "FORWARDED" : "FORWARD_FAILED",
        detail: status === "SENT"
          ? `SMS sent to ${partner.name} (${partner.company})`
          : `SMS to ${partner.name} failed: ${smsError}`,
      },
    }),
  ]);

  if (status === "FAILED") {
    return NextResponse.json(
      { ok: false, error: `SMS failed: ${smsError}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, twilioSid });
}
