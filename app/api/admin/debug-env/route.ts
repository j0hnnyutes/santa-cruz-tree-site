// app/api/admin/debug-env/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/adminAuth";

/**
 * Dev-only diagnostic endpoint.
 * - Requires admin session (NO CSRF for GET)
 * - Returns 404 in production
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  // For GET diagnostics, do NOT require CSRF header.
  const auth = await requireAdminAuth({ enforceCsrf: false });
  if (!auth?.ok) {
    return NextResponse.json(
      { ok: false, error: auth?.error || "Unauthorized" },
      { status: 401 }
    );
  }

  const db = process.env.DATABASE_URL || "";

  // Avoid BigInt serialization issues by coercing to Number.
  let leadTotal: number | null = null;
  let leadUnarchived: number | null = null;
  let leadError: string | null = null;

  try {
    const totalAgg = await prisma.lead.aggregate({ _count: { _all: true } });
    const unarchAgg = await prisma.lead.aggregate({
      where: { archivedAt: null },
      _count: { _all: true },
    });

    leadTotal = Number((totalAgg as any)?._count?._all ?? 0);
    leadUnarchived = Number((unarchAgg as any)?._count?._all ?? 0);
  } catch (e: any) {
    leadError = e?.message || String(e);
  }

  // SQLite database file actually opened (helps verify DATABASE_URL)
  let sqliteDatabases: Array<{ seq: string; name: string; file: string }> = [];
  let sqliteError: string | null = null;

  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(`PRAGMA database_list;`);
    sqliteDatabases = (rows || []).map((r) => ({
      seq: String(r.seq),
      name: String(r.name),
      file: String(r.file),
    }));
  } catch (e: any) {
    sqliteError = e?.message || String(e);
  }

  // Cookie preview (don’t leak full secrets)
  const cookieHeader = request.headers.get("cookie") || "";
  const getCookie = (name: string) => {
    const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = cookieHeader.match(new RegExp(`(?:^|; )${esc}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : "";
  };

  const adminSession = getCookie("admin_session");
  const adminCsrf = getCookie("admin_csrf");

  const preview = (v: string, n = 6) =>
    v ? `${v.slice(0, n)}***${v.slice(-n)}` : "";

  return NextResponse.json(
    {
      ok: true,
      cwd: process.cwd(),
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: db,
      databaseUrlPreview: db ? `${db.slice(0, 4)}***${db.slice(-10)}` : "",
      cookies: {
        hasAdminSessionCookie: !!adminSession,
        adminSessionLen: adminSession ? adminSession.length : 0,
        adminSessionPreview: preview(adminSession),
        hasAdminCsrfCookie: !!adminCsrf,
        adminCsrfLen: adminCsrf ? adminCsrf.length : 0,
        adminCsrfPreview: preview(adminCsrf),
      },
      leadTotal,
      leadUnarchived,
      leadError,
      sqliteDatabases,
      sqliteError,
    },
    { status: 200 }
  );
}