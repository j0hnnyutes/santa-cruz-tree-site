// app/api/admin/debug-env/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function preview(v: string, showLast = 6) {
  if (!v) return "";
  if (v.length <= showLast + 4) return `${v.slice(0, 2)}***${v.slice(-2)}`;
  return `${v.slice(0, 2)}***${v.slice(-showLast)}`;
}

function safeJson<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
}

export async function GET() {
  const admin = process.env.ADMIN_PASSWORD || "";
  const db = process.env.DATABASE_URL || "";

  let leadTotal: number | null = null;
  let leadUnarchived: number | null = null;
  let leadError: string | null = null;

  let sqliteDatabases: any = null;
  let sqliteError: string | null = null;

  try {
    const raw = await prisma.$queryRawUnsafe<any[]>(
      `PRAGMA database_list;`
    );
    sqliteDatabases = safeJson(raw);
  } catch (e: any) {
    sqliteError = e?.message || String(e);
  }

  try {
    leadTotal = await prisma.lead.count();
    leadUnarchived = await prisma.lead.count({
      where: { archivedAt: null },
    });
  } catch (e: any) {
    leadError = e?.message || String(e);
  }

  return NextResponse.json({
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: db,
    databaseUrlPreview: preview(db, 18),
    leadTotal,
    leadUnarchived,
    leadError,
    sqliteDatabases,
    sqliteError,
  });
}