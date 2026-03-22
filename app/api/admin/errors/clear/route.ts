import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminCsrf } from "@/lib/adminCsrf";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  const csrf = verifyAdminCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ ok: false, error: csrf.error }, { status: csrf.status });
  }

  try {
    const url = new URL(request.url);

    // Optional filters — if none provided, deletes everything
    const severity = url.searchParams.get("severity");
    const type = url.searchParams.get("type");
    const fromDate = url.searchParams.get("from_date");
    const toDate = url.searchParams.get("to_date");

    const where: any = {};

    if (severity) {
      where.severity = severity;
    }

    if (type) {
      where.type = type;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        const from = new Date(fromDate);
        if (!isNaN(from.getTime())) {
          where.createdAt.gte = from;
        }
      }
      if (toDate) {
        const to = new Date(toDate);
        if (!isNaN(to.getTime())) {
          where.createdAt.lte = to;
        }
      }
    }

    const result = await (prisma as any).errorLog.deleteMany({ where });

    return NextResponse.json({ ok: true, deleted: result.count }, { status: 200 });
  } catch (err: unknown) {
    console.error("DELETE /api/admin/errors/clear error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error clearing errors" },
      { status: 500 }
    );
  }
}
