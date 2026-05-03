// app/api/admin/partners/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

// GET /api/admin/partners — list all partners
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { forwards: true } },
    },
  });
  return NextResponse.json({ partners });
}

// POST /api/admin/partners — create a new partner
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { name, company, phone, email, cities, notes, active } = body as {
    name?: string;
    company?: string;
    phone?: string;
    email?: string;
    cities?: string[];
    notes?: string;
    active?: boolean;
  };

  if (!name?.trim() || !company?.trim() || !phone?.trim()) {
    return NextResponse.json(
      { error: "name, company, and phone are required" },
      { status: 400 },
    );
  }

  const partner = await prisma.partner.create({
    data: {
      name: name.trim(),
      company: company.trim(),
      phone: phone.replace(/\D/g, ""), // store digits only
      email: email?.trim() || null,
      cities: Array.isArray(cities) ? cities.map((c) => c.trim()).filter(Boolean) : [],
      notes: notes?.trim() || null,
      active: active !== false,
    },
  });

  return NextResponse.json({ partner }, { status: 201 });
}
