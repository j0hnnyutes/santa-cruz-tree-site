// app/api/admin/partners/[partnerId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

// PATCH /api/admin/partners/:partnerId — update a partner
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { partnerId } = await params;
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

  const updated = await prisma.partner.update({
    where: { id: partnerId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(company !== undefined && { company: company.trim() }),
      ...(phone !== undefined && { phone: phone.replace(/\D/g, "") }),
      ...(email !== undefined && { email: email?.trim() || null }),
      ...(cities !== undefined && {
        cities: Array.isArray(cities)
          ? cities.map((c) => c.trim()).filter(Boolean)
          : [],
      }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
      ...(active !== undefined && { active }),
    },
  });

  return NextResponse.json({ partner: updated });
}

// DELETE /api/admin/partners/:partnerId — remove a partner
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { partnerId } = await params;

  await prisma.partner.delete({ where: { id: partnerId } });

  return NextResponse.json({ ok: true });
}
