import { NextResponse, type NextRequest } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { verifyAdminCsrf } from "@/lib/adminCsrf";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);

    // Parse query params
    const severity = url.searchParams.get("severity");
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("search");
    const fromDate = url.searchParams.get("from_date");
    const toDate = url.searchParams.get("to_date");
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");

    const page = Math.max(1, parseInt(pageParam || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(limitParam || "20", 10)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (severity) {
      where.severity = severity;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { message: { contains: search } },
        { path: { contains: search } },
      ];
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

    // Fetch errors and total count
    const [errors, total] = await Promise.all([
      (prisma as any).errorLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      (prisma as any).errorLog.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        ok: true,
        errors,
        total,
        page,
        pages,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("GET /api/admin/errors error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error fetching errors" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const csrf = verifyAdminCsrf(request);
  if (!csrf.ok) {
    return NextResponse.json({ ok: false, error: csrf.error }, { status: csrf.status });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing id parameter" },
        { status: 400 }
      );
    }

    await (prisma as any).errorLog.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("DELETE /api/admin/errors error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error deleting error" },
      { status: 500 }
    );
  }
}
