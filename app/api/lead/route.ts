// app/api/lead/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

function digitsOnly(v: unknown) {
  return String(v ?? "").replace(/\D/g, "");
}

function toStr(v: unknown) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

async function readBody(request: Request): Promise<Record<string, any>> {
  const ct = request.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    try {
      const json = await request.json();
      return json && typeof json === "object" ? (json as any) : {};
    } catch {
      return {};
    }
  }

  if (
    ct.includes("multipart/form-data") ||
    ct.includes("application/x-www-form-urlencoded")
  ) {
    try {
      const fd = await request.formData();
      return Object.fromEntries(fd.entries());
    } catch {
      return {};
    }
  }

  try {
    const json = await request.json();
    return json && typeof json === "object" ? (json as any) : {};
  } catch {
    return {};
  }
}

export async function POST(request: Request) {
  const body = await readBody(request);

  const fullName = toStr(body.fullName || body.name).trim();
  const email = toStr(body.email).trim();
  const service = toStr(body.service).trim();
  const details = toStr(body.details || body.message || body.notes).trim();

  const address = toStr(body.address).trim();
  const city = toStr(body.city).trim();

  const phoneRaw =
    body.phone ?? body.phoneNumber ?? body.phoneDigits ?? body.mobile ?? "";
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
    const lead = await prisma.lead.create({
      data: {
        leadId: randomUUID(),
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

    return NextResponse.json({ ok: true, leadId: lead.leadId }, { status: 200 });
  } catch (err) {
    console.error("POST /api/lead error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error creating lead." },
      { status: 500 }
    );
  }
}