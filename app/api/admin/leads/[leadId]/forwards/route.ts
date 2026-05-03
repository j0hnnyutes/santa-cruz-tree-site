// app/api/admin/leads/[leadId]/forwards/route.ts
//
// GET /api/admin/leads/:leadId/forwards
// Returns all LeadForward records for a lead, newest first, including partner info.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { leadId } = await params;

  const forwards = await prisma.leadForward.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
    include: {
      partner: { select: { name: true, company: true } },
    },
  });

  return NextResponse.json({ forwards });
}
